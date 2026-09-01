const dns = require('dns')
const fs = require('fs')
const path = require('path')
const { BSON, MongoClient } = require('mongodb')

const DEFAULT_DATA_DIRECTORY = path.join(process.cwd(), 'data')
const BATCH_SIZE = 500

function configureDnsFallback() {
  const currentServers = dns.getServers()
  const onlyLoopback =
    currentServers.length === 0 ||
    currentServers.every((server) => server === '127.0.0.1' || server === '::1')

  if (!onlyLoopback) {
    return false
  }

  const fallbackServers = (process.env.MONGODB_DNS_SERVERS || '1.1.1.1,8.8.8.8')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean)

  dns.setServers(fallbackServers)
  return true
}

function redactMongoUri(message) {
  return String(message).replace(/mongodb(?:\+srv)?:\/\/[^@]+@/g, 'mongodb://***@')
}

function getCollectionName(fileName) {
  const firstDot = fileName.indexOf('.')
  const jsonSuffixLength = '.json'.length

  if (firstDot < 1 || !fileName.endsWith('.json')) {
    throw new Error(`Unsupported export file name: ${fileName}`)
  }

  return fileName.slice(firstDot + 1, -jsonSuffixLength)
}

function getDocumentIdKey(document) {
  if (document._id && typeof document._id.toHexString === 'function') {
    return document._id.toHexString()
  }

  return BSON.EJSON.stringify(document._id, { relaxed: false })
}

function loadExport(filePath) {
  const parsed = BSON.EJSON.parse(fs.readFileSync(filePath, 'utf8'), {
    relaxed: false,
  })

  if (!Array.isArray(parsed)) {
    throw new Error(`${path.basename(filePath)} must contain a JSON array`)
  }

  const ids = new Set()
  const documents = []
  let duplicateIds = 0

  parsed.forEach((document, index) => {
    if (!document || typeof document !== 'object' || Array.isArray(document)) {
      throw new Error(`${path.basename(filePath)} row ${index + 1} is not a document`)
    }

    if (document._id === undefined || document._id === null) {
      throw new Error(`${path.basename(filePath)} row ${index + 1} has no _id`)
    }

    const idKey = getDocumentIdKey(document)
    if (ids.has(idKey)) {
      duplicateIds += 1
      return
    }

    ids.add(idKey)
    documents.push(document)
  })

  return {
    documents,
    duplicateIds,
    sourceCount: parsed.length,
  }
}

async function countMatchingIds(collection, documents) {
  let count = 0

  for (let index = 0; index < documents.length; index += BATCH_SIZE) {
    const ids = documents.slice(index, index + BATCH_SIZE).map((document) => document._id)
    count += await collection.countDocuments({ _id: { $in: ids } })
  }

  return count
}

async function importCollection(collection, documents) {
  const result = {
    inserted: 0,
    skippedExisting: 0,
    skippedUniqueKey: 0,
  }

  for (let index = 0; index < documents.length; index += BATCH_SIZE) {
    const batch = documents.slice(index, index + BATCH_SIZE)
    const operations = batch.map((document) => {
      const { _id, ...fields } = document

      return {
        updateOne: {
          filter: { _id },
          update: { $setOnInsert: fields },
          upsert: true,
        },
      }
    })

    let batchResult

    try {
      batchResult = await collection.bulkWrite(operations, { ordered: false })
    } catch (error) {
      const writeErrors = Array.isArray(error.writeErrors) ? error.writeErrors : []
      const onlyDuplicateKeys =
        writeErrors.length > 0 && writeErrors.every((writeError) => writeError.code === 11000)

      if (!onlyDuplicateKeys || !error.result) {
        throw error
      }

      batchResult = error.result
      result.skippedUniqueKey += writeErrors.length
    }

    if (batchResult.modifiedCount !== 0) {
      throw new Error('Insert-only import unexpectedly modified an existing document')
    }

    result.skippedExisting += batchResult.matchedCount
    result.inserted += batchResult.upsertedCount
  }

  return result
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const dataDirectoryArgument = process.argv.find((argument) => argument.startsWith('--data-dir='))
  const dataDirectory = dataDirectoryArgument
    ? path.resolve(dataDirectoryArgument.slice('--data-dir='.length))
    : DEFAULT_DATA_DIRECTORY

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }

  const fileNames = fs
    .readdirSync(dataDirectory)
    .filter((fileName) => fileName.endsWith('.json'))
    .sort()

  if (fileNames.length === 0) {
    throw new Error(`No JSON files found in ${dataDirectory}`)
  }

  const exportsToImport = fileNames.map((fileName) => ({
    collectionName: getCollectionName(fileName),
    fileName,
    ...loadExport(path.join(dataDirectory, fileName)),
  }))

  const dnsFallbackUsed = configureDnsFallback()
  const client = new MongoClient(process.env.DATABASE_URL, {
    connectTimeoutMS: 15_000,
    serverSelectionTimeoutMS: 15_000,
  })

  try {
    await client.connect()
    const database = client.db()
    await database.command({ ping: 1 })

    console.log(
      JSON.stringify({
        event: 'connected',
        database: database.databaseName,
        dnsFallbackUsed,
        mode: dryRun ? 'dry-run' : 'import',
      })
    )

    let sourceTotal = 0
    let uniqueSourceTotal = 0
    let insertedTotal = 0
    let skippedExistingTotal = 0
    let skippedDuplicateIdTotal = 0
    let skippedUniqueKeyTotal = 0

    for (const exportItem of exportsToImport) {
      const { collectionName, documents, duplicateIds, fileName, sourceCount } = exportItem
      const collection = database.collection(collectionName)
      const before = await collection.countDocuments({})
      const overlappingIds = await countMatchingIds(collection, documents)

      sourceTotal += sourceCount
      uniqueSourceTotal += documents.length
      skippedDuplicateIdTotal += duplicateIds

      if (dryRun) {
        skippedExistingTotal += overlappingIds
      }

      if (dryRun || documents.length === 0) {
        console.log(
          JSON.stringify({
            event: dryRun ? 'preflight' : 'skipped-empty',
            file: fileName,
            collection: collectionName,
            source: sourceCount,
            uniqueSource: documents.length,
            before,
            skippedDuplicateId: duplicateIds,
            skippedExisting: overlappingIds,
            candidateInserts: documents.length - overlappingIds,
          })
        )
        continue
      }

      const imported = await importCollection(collection, documents)
      const verifiedIds = await countMatchingIds(collection, documents)
      const after = await collection.countDocuments({})
      const expectedVerifiedIds = documents.length - imported.skippedUniqueKey

      if (verifiedIds !== expectedVerifiedIds) {
        throw new Error(
          `${collectionName} verification failed: expected ${expectedVerifiedIds} source IDs, found ${verifiedIds}`
        )
      }

      insertedTotal += imported.inserted
      skippedExistingTotal += imported.skippedExisting
      skippedUniqueKeyTotal += imported.skippedUniqueKey

      console.log(
        JSON.stringify({
          event: 'imported',
          file: fileName,
          collection: collectionName,
          source: sourceCount,
          uniqueSource: documents.length,
          before,
          after,
          inserted: imported.inserted,
          skippedDuplicateId: duplicateIds,
          skippedExisting: imported.skippedExisting,
          skippedUniqueKey: imported.skippedUniqueKey,
          verifiedIds,
        })
      )
    }

    console.log(
      JSON.stringify({
        event: 'complete',
        mode: dryRun ? 'dry-run' : 'import',
        files: exportsToImport.length,
        sourceTotal,
        uniqueSourceTotal,
        insertedTotal,
        skippedExistingTotal,
        skippedDuplicateIdTotal,
        skippedUniqueKeyTotal,
      })
    )
  } finally {
    await client.close()
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      event: 'failed',
      name: error.name,
      code: error.code || null,
      message: redactMongoUri(error.message),
    })
  )
  process.exit(1)
})
