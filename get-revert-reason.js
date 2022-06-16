const utf8 = new TextDecoder()

async function getRevertReason (provider, tx) {
  tx = Object.assign({}, tx)
  delete tx.gasPrice
  delete tx.maxFeePerGas
  delete tx.maxPriorityFeePerGas
  let ret = ''
  try {
    ret = await provider.call(tx)
  } catch (err) {
    // try to make ethers call errors consistent with estimateGas
    if (err.data === '0x') return ''
    throw err
  }
  // https://github.com/ethers-io/ethers.js/issues/949
  // geth returns the decoded revert reason string as an error
  // but ethers removes it, so we decode the raw response here
  const stringLength = parseInt(ret.substr(2 + 4 * 2 + 32 * 2, 32 * 2), 16)
  const buffer = new Uint8Array(stringLength)
  let reason = ret.substr(138, stringLength * 2)
  let i = 0
  while (reason) {
    buffer[i++] = parseInt(reason.slice(0, 2), 16)
    reason = reason.slice(2)
  }
  return utf8.decode(buffer)
}

export default getRevertReason
