let abiEncoder = null

export default function encodeConstructorArgs (ethers, abi, args = []) {
  const constructor = abi.find(m => m.type === 'constructor')
  if (!constructor) return ''
  if (!abiEncoder) {
    abiEncoder = new ethers.utils.AbiCoder()
  }
  return abiEncoder.encode(constructor.inputs, args).slice(2)
}
