import { ethers } from 'ethers'

const abiEncoder = new ethers.utils.AbiCoder()

export default function encodeConstructorArgs (abi, args = []) {
  const constructor = abi.find(m => m.type === 'constructor')
  if (constructor) {
    return abiEncoder.encode(constructor.inputs, args)
  }
}
