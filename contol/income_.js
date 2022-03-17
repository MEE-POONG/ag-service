const { income_UFA66 } = require('./income_UFA66')
const { income_PSD99 } = require('./income_PSD99')
const from = '03/07/2022'
const to = '03/13/2022&'
;(async () => {
  await income_UFA66(from, to)
  // await income_PSD99(from, to)
})()
