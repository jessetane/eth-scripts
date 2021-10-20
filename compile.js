import childProcess from 'child_process'

export default async function compile (compilerPath, standardInputJson) {
  return new Promise((res, rej) => {
    const p = childProcess.spawn(compilerPath, [ '--standard-json', '--allow-paths=.' ])
    let stdout = ''
    p.stdout.on('data', data => stdout += data)
    p.on('error', err => { rej(err) })
    p.on('close', code => {
      let output = JSON.parse(stdout)
      if (output.errors) {
        const err = new Error('compilation failed')
        err.data = output
        rej(err)
      } else {
        res(output)
      }
    })
    if (!standardInputJson.language) {
      standardInputJson.language = 'Solidity'
    }
    if (!standardInputJson.settings) {
      standardInputJson.settings = compile.defaultSettings
    }
    p.stdin.end(JSON.stringify(standardInputJson))
  })
}

compile.defaultSettings = {
  remappings: [
    '@openzeppelin=node_modules/@openzeppelin'
  ],
  optimizer: {
    enabled: true,
    runs: 200
  },
  outputSelection: {
    '*': {
      '*': [
        'abi',
        'evm.bytecode.object'
      ]
    }
  }
}
