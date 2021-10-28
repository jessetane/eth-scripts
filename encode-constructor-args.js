import config from './config.js'

let abiEncoder = null

export default function encodeConstructorArgs (abi, args = []) {
  const constructor = abi.find(m => m.type === 'constructor')
  if (!constructor) return ''
  if (!abiEncoder) {
    abiEncoder = new config.ethers.utils.AbiCoder()
  }
  return abiEncoder.encode(constructor.inputs, args).slice(2)
}
