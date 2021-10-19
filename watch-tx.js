import getRevertReason from './get-revert-reason.js'

let provider = null

export default async function watchTx (promise, _provider) {
  if (_provider) provider = _provider
  try {
    let txRes = await promise
    if (txRes && typeof txRes.wait === 'function') {
      await txRes.wait()
    } else {
      return txRes
    }
  } catch (err) {
    let reason = null
    if (err.error) {
      // node error
      throw err.error.error
    } else if (err.transaction) {
      // on chain error
      reason = await getRevertReason(err.transaction, provider)
    } else if (err.body) {
      // 1?
      console.error('watchTx.js: unknown error 1', err)
      reason = JSON.parse(err.body).error.message
    } else {
      // 2?
      console.error('watchTx.js: unknown error 2', err)
      reason = err.message
    }
    throw new Error(reason)
  }
}
