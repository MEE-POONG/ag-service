const crypto = require('crypto')
const dns = require('dns')
const fs = require('fs')
const path = require('path')
const { BSON, MongoClient } = require('mongodb')

const TARGET_COLLECTION = 'AgUserDB'
const ACCOUNT_COLLECTION = 'AgUserAccountDB'
const OBSOLETE_COLLECTION = 'AGUserDB'
const DEFAULT_STATUS = 'PENDING'
const BATCH_SIZE = 500

function configureDnsFallback() {
  const currentServers = dns.getServers()
  const onlyLoopback =
    currentServers.length === 0 ||
    currentServers.every((server) => server === '127.0.0.1' || server === '::1')

  if (!onlyLoopback) return false

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

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalize(value) {
  return cleanString(value).toLowerCase()
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function choose(preferred, fallback, defaultValue) {
  if (hasValue(preferred)) return preferred
  if (hasValue(fallback)) return fallback
  return defaultValue
}

function earlierDate(first, second) {
  if (first instanceof Date && second instanceof Date) return first <= second ? first : second
  if (first instanceof Date) return first
  if (second instanceof Date) return second
  return new Date()
}

function laterDate(first, second) {
  if (first instanceof Date && second instanceof Date) return first >= second ? first : second
  if (first instanceof Date) return first
  if (second instanceof Date) return second
  return new Date()
}

function mapUniqueByUsername(documents, collectionName) {
  const result = new Map()

  for (const document of documents) {
    const key = normalize(document.username)
    if (!key) throw new Error(`${collectionName} contains a document without username`)
    if (result.has(key)) throw new Error(`${collectionName} contains duplicate username values`)
    result.set(key, document)
  }

  return result
}

function mostCommonWebname(accounts, configuredDefault) {
  if (configuredDefault) return configuredDefault

  const counts = new Map()
  for (const account of accounts) {
    const webname = cleanString(account.webname)
    if (webname) counts.set(webname, (counts.get(webname) || 0) + 1)
  }

  const mostCommon = [...counts.entries()].sort((first, second) => second[1] - first[1])[0]
  if (!mostCommon) throw new Error('Cannot determine a default webname from AgUserAccountDB')
  return mostCommon[0]
}

function buildMergedUsers({ accounts, agUsers, webBases, configuredDefaultWebname }) {
  const accountByUsername = mapUniqueByUsername(accounts, ACCOUNT_COLLECTION)
  const agUserByUsername = mapUniqueByUsername(agUsers, TARGET_COLLECTION)
  const usernames = new Set([...accountByUsername.keys(), ...agUserByUsername.keys()])
  const webBaseByName = new Map(webBases.map((webBase) => [normalize(webBase.name), webBase]))
  const defaultWebname = mostCommonWebname(accounts, configuredDefaultWebname)

  if (!webBaseByName.has(normalize(defaultWebname))) {
    throw new Error(`Default webname does not exist in WebBaseDB: ${defaultWebname}`)
  }

  const stats = {
    accountOnly: 0,
    agUserOnly: 0,
    merged: 0,
    webnameFromLogin: 0,
    webnameDefaulted: 0,
    userLoginRegenerated: 0,
    originDerived: 0,
  }
  const idMappings = []
  const candidates = []

  for (const usernameKey of usernames) {
    const account = accountByUsername.get(usernameKey)
    const agUser = agUserByUsername.get(usernameKey)

    if (account && agUser) stats.merged += 1
    else if (account) stats.accountOnly += 1
    else stats.agUserOnly += 1

    const username = cleanString(choose(account?.username, agUser?.username, ''))
    let webname = cleanString(account?.webname)

    if (!webname) {
      const currentLogin = cleanString(choose(account?.userLogin, agUser?.userLogin, ''))
      const suffix =
        currentLogin && currentLogin.toLowerCase().startsWith(username.toLowerCase())
          ? currentLogin.slice(username.length)
          : ''

      if (suffix && webBaseByName.has(normalize(suffix))) {
        webname = suffix
        stats.webnameFromLogin += 1
      } else {
        webname = defaultWebname
        stats.webnameDefaulted += 1
      }
    }

    const webBase = webBaseByName.get(normalize(webname))
    if (!webBase) throw new Error(`No WebBaseDB record matches a merged webname`)

    const createdAt = earlierDate(account?.createdAt, agUser?.createdAt)
    const updatedAt = laterDate(account?.updatedAt, agUser?.updatedAt)
    const createdSource =
      agUser?.createdAt instanceof Date && agUser.createdAt.getTime() === createdAt.getTime()
        ? agUser
        : account
    const updatedSource =
      account?.updatedAt instanceof Date && account.updatedAt.getTime() === updatedAt.getTime()
        ? account
        : agUser

    let origin = cleanString(choose(account?.origin, agUser?.origin, ''))
    if (!origin) {
      origin = username.replace(/\d+$/, '') || username
      stats.originDerived += 1
    }

    const canonicalId = agUser?._id || account?._id
    if (account && String(account._id) !== String(canonicalId)) {
      idMappings.push({ from: account._id, to: canonicalId })
    }

    candidates.push({
      hasAccount: Boolean(account),
      originalLogin: cleanString(choose(account?.userLogin, agUser?.userLogin, '')),
      document: {
        _id: canonicalId,
        __v: Number.isInteger(agUser?.__v) ? agUser.__v : 0,
        username,
        reserve: cleanString(choose(account?.reserve, agUser?.reserve, '')),
        userLogin: '',
        origin,
        position: cleanString(choose(account?.position, agUser?.position, 'agent')),
        gaSecretEnc: cleanString(choose(account?.gaSecretEnc, agUser?.gaSecretEnc, '')),
        isActive:
          typeof account?.isActive === 'boolean'
            ? account.isActive
            : typeof agUser?.isActive === 'boolean'
              ? agUser.isActive
              : true,
        statusServe: cleanString(account?.statusServe).toUpperCase() || DEFAULT_STATUS,
        webname,
        webBaseId: webBase._id,
        partnerAG: choose(account?.partnerAG, agUser?.partnerAG, null),
        partnerLogin: choose(account?.partnerLogin, agUser?.partnerLogin, null),
        meta: account?.meta ?? null,
        note: account?.note ?? null,
        deleteBy: agUser?.deleteBy ?? null,
        createdAt,
        createdBy: cleanString(choose(createdSource?.createdBy, account?.createdBy || agUser?.createdBy, 'system')),
        updatedAt,
        updatedBy: cleanString(choose(updatedSource?.updatedBy, account?.updatedBy || agUser?.updatedBy, 'system')),
      },
    })
  }

  // Account records keep their operational login. Any duplicate from the older
  // collection is regenerated deterministically from username + webname.
  candidates.sort((first, second) => Number(second.hasAccount) - Number(first.hasAccount))
  const usedLogins = new Set()

  for (const candidate of candidates) {
    let userLogin = candidate.originalLogin
    if (!userLogin || usedLogins.has(normalize(userLogin))) {
      userLogin = `${candidate.document.username}${candidate.document.webname}`
      stats.userLoginRegenerated += 1
    }

    if (!userLogin || usedLogins.has(normalize(userLogin))) {
      throw new Error('Unable to generate a unique userLogin during merge')
    }

    candidate.document.userLogin = userLogin
    usedLogins.add(normalize(userLogin))
  }

  const documents = candidates
    .map((candidate) => candidate.document)
    .sort((first, second) => normalize(first.username).localeCompare(normalize(second.username)))

  return { defaultWebname, documents, idMappings, stats }
}

function validateMergedUsers(documents) {
  const requiredFields = [
    'username',
    'reserve',
    'userLogin',
    'origin',
    'position',
    'gaSecretEnc',
    'isActive',
    'statusServe',
    'webname',
    'webBaseId',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
  ]
  const usernames = new Set()
  const userLogins = new Set()

  for (const document of documents) {
    for (const field of requiredFields) {
      if (document[field] === undefined || document[field] === null) {
        throw new Error(`Merged document is missing required field: ${field}`)
      }
    }

    const username = normalize(document.username)
    const userLogin = normalize(document.userLogin)
    if (!username || usernames.has(username)) throw new Error('Merged usernames are not unique')
    if (!userLogin || userLogins.has(userLogin)) throw new Error('Merged userLogin values are not unique')
    usernames.add(username)
    userLogins.add(userLogin)
  }
}

function timestampToken() {
  return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')
}

function writeBackup(baseDirectory, collections) {
  const backupDirectory = path.join(baseDirectory, `ag-user-merge-${timestampToken()}`)
  fs.mkdirSync(backupDirectory, { recursive: true })
  const manifest = { createdAt: new Date().toISOString(), files: {} }

  for (const [collectionName, documents] of Object.entries(collections)) {
    const serialized = BSON.EJSON.stringify(documents, { relaxed: false })
    const fileName = `${collectionName}.json`
    fs.writeFileSync(path.join(backupDirectory, fileName), serialized, 'utf8')
    manifest.files[fileName] = {
      count: documents.length,
      sha256: crypto.createHash('sha256').update(serialized).digest('hex'),
    }
  }

  fs.writeFileSync(
    path.join(backupDirectory, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  )

  return backupDirectory
}

async function insertInBatches(collection, documents) {
  for (let index = 0; index < documents.length; index += BATCH_SIZE) {
    await collection.insertMany(documents.slice(index, index + BATCH_SIZE), { ordered: true })
  }
}

async function remapReferences(database, idMappings) {
  const relationCollections = ['PartnerDB', 'CustomerAgentDB']

  for (const collectionName of relationCollections) {
    const collection = database.collection(collectionName)
    for (let index = 0; index < idMappings.length; index += BATCH_SIZE) {
      const operations = idMappings.slice(index, index + BATCH_SIZE).map(({ from, to }) => ({
        updateMany: {
          filter: { agentId: from },
          update: { $set: { agentId: to } },
        },
      }))
      if (operations.length) await collection.bulkWrite(operations, { ordered: true })
    }
  }

  const workHistory = database.collection('WorkHistoryDB')
  for (let index = 0; index < idMappings.length; index += BATCH_SIZE) {
    const operations = idMappings.slice(index, index + BATCH_SIZE).map(({ from, to }) => ({
      updateMany: {
        filter: { tableName: ACCOUNT_COLLECTION, recordId: from },
        update: { $set: { tableName: TARGET_COLLECTION, recordId: to } },
      },
    }))
    if (operations.length) await workHistory.bulkWrite(operations, { ordered: true })
  }
  await workHistory.updateMany(
    { tableName: ACCOUNT_COLLECTION },
    { $set: { tableName: TARGET_COLLECTION } }
  )

  const activityLog = database.collection('ActivityLogDB')
  for (let index = 0; index < idMappings.length; index += BATCH_SIZE) {
    const operations = idMappings.slice(index, index + BATCH_SIZE).map(({ from, to }) => ({
      updateMany: {
        filter: { tableName: ACCOUNT_COLLECTION, recordId: String(from) },
        update: { $set: { tableName: TARGET_COLLECTION, recordId: String(to) } },
      },
    }))
    if (operations.length) await activityLog.bulkWrite(operations, { ordered: true })
  }
  await activityLog.updateMany(
    { tableName: ACCOUNT_COLLECTION },
    { $set: { tableName: TARGET_COLLECTION } }
  )
}

async function restoreReferenceCollections(database, backupData) {
  for (const collectionName of [
    'PartnerDB',
    'CustomerAgentDB',
    'WorkHistoryDB',
    'ActivityLogDB',
  ]) {
    const collection = database.collection(collectionName)
    await collection.deleteMany({})
    await insertInBatches(collection, backupData[collectionName])
  }
}

async function verifyDatabaseState(database, expectedCount, dropSources) {
  const target = database.collection(TARGET_COLLECTION)
  const [count, duplicateUsernames, duplicateLogins, incomplete, invalidReferences] = await Promise.all([
    target.countDocuments({}),
    target.aggregate([{ $group: { _id: { $toLower: '$username' }, count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }]).toArray(),
    target.aggregate([{ $group: { _id: { $toLower: '$userLogin' }, count: { $sum: 1 } } }, { $match: { count: { $gt: 1 } } }]).toArray(),
    target.countDocuments({
      $or: [
        { username: { $exists: false } },
        { userLogin: { $exists: false } },
        { origin: { $exists: false } },
        { position: { $exists: false } },
        { statusServe: { $exists: false } },
        { webname: { $exists: false } },
        { webBaseId: { $exists: false } },
      ],
    }),
    Promise.all(
      ['PartnerDB', 'CustomerAgentDB'].map(async (collectionName) => {
        const references = await database.collection(collectionName).distinct('agentId')
        if (!references.length) return 0
        const resolved = await target.countDocuments({ _id: { $in: references } })
        return references.length - resolved
      })
    ),
  ])

  if (count !== expectedCount) throw new Error(`Expected ${expectedCount} merged users, found ${count}`)
  if (duplicateUsernames.length) throw new Error('Duplicate usernames remain after migration')
  if (duplicateLogins.length) throw new Error('Duplicate userLogin values remain after migration')
  if (incomplete) throw new Error('Incomplete AgUserDB documents remain after migration')
  if (invalidReferences.some((countValue) => countValue !== 0)) {
    throw new Error('Unresolved agentId references remain after migration')
  }

  if (dropSources) {
    const collectionNames = new Set(
      (await database.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name)
    )
    if (collectionNames.has(ACCOUNT_COLLECTION) || collectionNames.has(OBSOLETE_COLLECTION)) {
      throw new Error('Obsolete AG user collections still exist after migration')
    }
    if ([...collectionNames].some((name) => name.startsWith(`${TARGET_COLLECTION}__`))) {
      throw new Error('Temporary AG user collections still exist after migration')
    }
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const dropSources = process.argv.includes('--drop-source')
  const confirmedDatabase = process.argv
    .find((argument) => argument.startsWith('--confirm-database='))
    ?.slice('--confirm-database='.length)
  const configuredDefaultWebname = process.argv
    .find((argument) => argument.startsWith('--default-webname='))
    ?.slice('--default-webname='.length)
  const backupRoot = path.resolve(
    process.argv.find((argument) => argument.startsWith('--backup-dir='))?.slice('--backup-dir='.length) ||
      path.join('data', 'backups')
  )

  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured')
  if (dropSources && !apply) throw new Error('--drop-source requires --apply')

  const dnsFallbackUsed = configureDnsFallback()
  const client = new MongoClient(process.env.DATABASE_URL, {
    connectTimeoutMS: 15_000,
    serverSelectionTimeoutMS: 15_000,
  })

  try {
    await client.connect()
    const database = client.db()
    await database.command({ ping: 1 })

    if (apply && confirmedDatabase !== database.databaseName) {
      throw new Error(`Apply requires --confirm-database=${database.databaseName}`)
    }

    const collectionNames = new Set(
      (await database.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name)
    )
    if (!collectionNames.has(TARGET_COLLECTION)) {
      throw new Error(`Missing collection: ${TARGET_COLLECTION}`)
    }

    if (!collectionNames.has(ACCOUNT_COLLECTION)) {
      const mergedCount = await database.collection(TARGET_COLLECTION).countDocuments({})
      await verifyDatabaseState(database, mergedCount, true)
      console.log(
        JSON.stringify({
          event: 'already-complete',
          mode: apply ? 'apply' : 'dry-run',
          database: database.databaseName,
          dnsFallbackUsed,
          mergedCount,
        })
      )
      return
    }

    const backupCollectionNames = [
      TARGET_COLLECTION,
      ACCOUNT_COLLECTION,
      OBSOLETE_COLLECTION,
      'PartnerDB',
      'CustomerAgentDB',
      'WorkHistoryDB',
      'ActivityLogDB',
    ]
    const backupData = {}
    for (const collectionName of backupCollectionNames) {
      backupData[collectionName] = collectionNames.has(collectionName)
        ? await database.collection(collectionName).find({}).toArray()
        : []
    }

    if (backupData[OBSOLETE_COLLECTION].length > 0) {
      throw new Error(`${OBSOLETE_COLLECTION} is not empty and requires a separate mapping decision`)
    }

    const webBases = await database.collection('WebBaseDB').find({}).toArray()
    const merged = buildMergedUsers({
      accounts: backupData[ACCOUNT_COLLECTION],
      agUsers: backupData[TARGET_COLLECTION],
      webBases,
      configuredDefaultWebname,
    })
    validateMergedUsers(merged.documents)

    console.log(
      JSON.stringify({
        event: 'preflight',
        mode: apply ? 'apply' : 'dry-run',
        database: database.databaseName,
        dnsFallbackUsed,
        sourceCounts: {
          AgUserDB: backupData[TARGET_COLLECTION].length,
          AgUserAccountDB: backupData[ACCOUNT_COLLECTION].length,
          AGUserDB: backupData[OBSOLETE_COLLECTION].length,
        },
        mergedCount: merged.documents.length,
        idMappings: merged.idMappings.length,
        defaultWebname: merged.defaultWebname,
        stats: merged.stats,
      })
    )

    if (!apply) return

    const backupDirectory = writeBackup(backupRoot, backupData)
    const token = timestampToken()
    const stagingName = `AgUserDB__merge_staging_${token}`
    const previousName = `AgUserDB__pre_merge_${token}`
    const staging = database.collection(stagingName)

    await insertInBatches(staging, merged.documents)
    await Promise.all([
      staging.createIndex({ username: 1 }, { unique: true, name: 'AgUserDB_username_key' }),
      staging.createIndex({ userLogin: 1 }, { unique: true, name: 'AgUserDB_userLogin_key' }),
      staging.createIndex({ statusServe: 1 }, { name: 'AgUserDB_statusServe_idx' }),
      staging.createIndex({ webBaseId: 1 }, { name: 'AgUserDB_webBaseId_idx' }),
    ])

    if ((await staging.countDocuments({})) !== merged.documents.length) {
      throw new Error('Staging collection count verification failed')
    }

    await database.collection(TARGET_COLLECTION).rename(previousName, { dropTarget: false })
    await staging.rename(TARGET_COLLECTION, { dropTarget: false })

    try {
      await remapReferences(database, merged.idMappings)
      await verifyDatabaseState(database, merged.documents.length, false)
    } catch (error) {
      console.error(JSON.stringify({ event: 'rollback-started', reason: error.message }))
      await restoreReferenceCollections(database, backupData)
      const failedName = `AgUserDB__failed_${token}`
      await database.collection(TARGET_COLLECTION).rename(failedName, { dropTarget: false })
      await database.collection(previousName).rename(TARGET_COLLECTION, { dropTarget: false })
      throw error
    }

    if (dropSources) {
      if (collectionNames.has(ACCOUNT_COLLECTION)) {
        await database.collection(ACCOUNT_COLLECTION).drop()
      }
      if (collectionNames.has(OBSOLETE_COLLECTION)) {
        await database.collection(OBSOLETE_COLLECTION).drop()
      }
      await database.collection(previousName).drop()

      const temporaryCollections = (
        await database.listCollections({}, { nameOnly: true }).toArray()
      ).filter((collection) => collection.name.startsWith(`${TARGET_COLLECTION}__`))
      for (const temporaryCollection of temporaryCollections) {
        await database.collection(temporaryCollection.name).drop()
      }
      await verifyDatabaseState(database, merged.documents.length, true)
    }

    console.log(
      JSON.stringify({
        event: 'complete',
        database: database.databaseName,
        mergedCount: merged.documents.length,
        sourceCollectionsDropped: dropSources,
        backupDirectory,
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
