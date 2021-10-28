import getRevertReason from './get-revert-reason.js'

async function watchTx (promise) {
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
      reason = await getRevertReason(err.transaction)
    } else {
      throw err
    }
    throw new Error(reason)
  }
}

export default watchTx
