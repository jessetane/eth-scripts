import config from './config.js'

async function getRevertReason (tx) {
  tx = Object.assign({}, tx)
  delete tx.gasPrice
  delete tx.maxFeePerGas
  delete tx.maxPriorityFeePerGas
  try {
    var ret = await config.provider.call(tx)
    if (ret === '0x') {
      throw new Error('no revert reason found')
    }
  } catch (err) {
    if (err.error && err.error.body) {
      // return err.reason
      return JSON.parse(err.error.body).error.message
    } else {
      return err.message
    }
  }
  const stringLength = config.ethers.BigNumber.from(`0x${ret.slice(2 + 4 * 2 + 32 * 2).slice(0, 32 * 2)}`).toNumber()
  const reason = `0x${ret.substr(138).slice(0, stringLength * 2)}`
  return config.ethers.utils.toUtf8String(reason)
}

export default getRevertReason
