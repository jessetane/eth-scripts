# eth-scripts
Some scripts for working with Ethereum et al.

## Why
A place to collect notes gathered while studying the virtual machine and storage systems.

## How
Each script (or javascript module) can generally be used standalone. Some are only useful in javascript programs, others are also useful in a browser / dapp context.

### Dependencies
Some of the js modules depend on the [ethers js](https://docs.ethers.io) library.

### Downloading geth
```shell
download-geth 1.10.17 > geth
chmod +x bin/geth
```

### Downloading solc
```shell
download-solc 0.8.13 > solc
chmod +x solc
```

### Spawning a node
Spawns geth in dev mode with sane defaults suitable for testing and experimentation.

```javascript
import geth from 'eth-scripts/geth.js'

const gethChildProcess = await geth('path/to/geth', {
  datadir: 'path/to/data',
  port: '3000',
  gasLimit: 11500000,
  gasCap: 0
})
```

### Solidity compilation
Pass in a path to a `solc` executable and a standard-input-json like object, get back compiler output json as an object.

```javascript
import compile from 'eth-scripts/compile.js'

const compilerOutput = await compile('path/to/solc', {
  sources: {
    'MyContract.sol': {
      urls: ['MyContract.sol']
    }
  }
})
```

### Deploying compiled contracts
Pass in a signer and a javascript object map of contract "templates".

```javascript
import { ethers } from 'ethers'
import deploy from 'eth-scripts/deploy.js'

const provider = new ethers.providers.JsonRpcProvider('http://localhost:3000')
const providerAccounts = await provider.listAccounts()
const signer = await provider.getSigner(providerAccounts[0])
const templates = {
  MyContract: {
    build: compilerOutput.contracts['MyContract.sol'].MyContract,
    args: [ 'some', 'constructor', 'args' ],
    preDeploy: (currentTemplate, allTemplates) => {},
    postDeploy: (currentTemplate, allTemplates) => {}
  }
}
await deploy(ethers, signer, templates)
const metadata = JSON.parse(templates.MyContract.metadata)
const ethersContract = templates.MyContract.contract
console.log(metadata.compiler.version)
console.log(metadata.settings.compilationTarget)
console.log(ethersContract.functions)
```

### Watch a transaction until it has been mined
Awaits an ethers.js transaction and attempts to handle errors during its lifecycle in a consistent fashion whether they are generated by the rpc client, an eth node, or an on chain reversion. If the transcation was mined but also reverted, `getRevertReason` is invoked internally to synthesize the reason.

```javascript
import watchTx from 'eth-scripts/watch-tx.js'

try {
  const tx = templates.MyContract.contract.someMethodThatModifiesState()
  await watchTx(provider, tx)
  console.log('transaction successful')
} catch (err) {
  console.log('transaction failed', err)
}
```

### Getting the reason a transaction was reverted
If a transaction was reverted, this module can simulate the execution failure using `eth_call` to synthesize the reason. Attempts to normalize confusing and inconsistent ethers.js behavior.

```javascript
import getRevertReason from 'eth-scripts/get-revert-reason.js'

const tx = templates.MyContract.contract.someMethodThatModifiesState()
await tx // assume transaction is sent and mined but reverts on chain
const reason = getRevertReason(provider, tx)
```

### Decoding ABIEncoderV2 structs (and BigNumber) in a human friendly way
```javascript
import abiv2 from 'eth-scripts/abiv2.js'

const someData = await contract.somePublicViewMethodThatReturnsStruct()
console.log(someData) /*
[
  BigNumber { _hex: '0x2a', _isBigNumber: true },
  BigNumber { _hex: '0x029a', _isBigNumber: true },
  BigNumber { _hex: '0x0539', _isBigNumber: true },
  x: BigNumber { _hex: '0x2a', _isBigNumber: true },
  y: BigNumber { _hex: '0x029a', _isBigNumber: true },
  z: BigNumber { _hex: '0x0539', _isBigNumber: true }
]
*/
const shouldConvertBigNumberToNumber = true
console.log(abiv2(someData, shouldConvertBigNumberToNumber)) // { x: 42, y: 666, z: 1337 }
```

### Encoding constructor arguments
Useful for verifying contracts on Etherscan.

```javascript
import encodeConstructorArgs from 'eth-scripts/encode-constructor-args.js'

const abi = compilerOutput.contracts['MyContract.sol'].MyContract.abi
const encodedArgs = encodeConstructorArgs(ethers, abi, [ 'some', 'constructor', 'args' ])
```

### Generating standard-input-json
Given a sources map like the one output by the compiler, generates standard-input-json with sources content loaded from the filesystem. Useful for verifying contracts on Etherscan.

```javascript
import generateStandardInputJson from 'eth-scripts/generate-standard-input-json.js'

const solcSettings = compile.defaultSettings
const standardInputJson = generateStandardInputJson(solcSettings, {
  "path/to/MyContract.sol": {
    "id": 0
  }
})
console.log(standardInputJason.sources)
```

### Verifying contracts on Etherscan
Contract verification via Etherscan GUI doesn't always work.

```javascript
import verify from 'eth-scripts/verify-etherscan.js'

const settings = compile.defaultSettings
const build = compile(/**/)
const templates = deploy(/**/)
const main = templates.MyContract
const metadata = JSON.parse(main.build.metadata)
const fileName = Object.keys(metadata.settings.compilationTarget)[0]
const contractName = metadata.settings.compilationTarget[file]
const res = await verify({
  network: 'rinkeby',
  fileName,
  contractName,
  address: main.address,
  sourceCode: JSON.stringify(await generateStandardInputJson(settings, build.sources)),
  constructorArgs: encodeConstructorArgs(ethers, main.abi, main.args),
  compilerVersion: metadata.compiler.version,
  licenseType: '3', // see https://etherscan.io/contract-license-types
  apiKey: 'XYZ' // see https://docs.etherscan.io/getting-started
})
```

## License
MIT
