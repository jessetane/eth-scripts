import getRevertReason from './get-revert-reason.js'

let provider = null

export default async function watchTx (promise, _provider) {
  if (_provider) provider = _provider
  try {
    let txRes = await promise
    if (txRes && typeof txRes.wait === 'function') {
      return await txRes.wait()
    } else {
      return txRes
    }
  } catch (err) {
    let reason = null
    if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
      reason = err.reason
    } else if (err.receipt) {
      reason = await getRevertReason(err.transaction, provider)
    } else {
      throw err
    }
    /*
    if (err.error && err.error.error) {
      // node error
      if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        reason = err.reason
      } else {
        // console.log('node error?')
        throw err.error.error
      }
    } else if (err.error) {
      // wallet error
      // console.log('wallet error?')
      throw err.error
    } else if (err.receipt) {
      // on chain error
      // console.log('chain error?')
      reason = await getRevertReason(err.transaction, provider)
    } else {
      // 2?
      console.error('watchTx.js: unknown error 2', err)
      reason = err.message
    }
    */
    throw new Error(reason)
  }
}
