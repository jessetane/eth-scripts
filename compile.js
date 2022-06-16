import childProcess from 'child_process'

const defaultSettings = {
  remappings: [
    '@openzeppelin=node_modules/@openzeppelin'
  ],
  optimizer: {
    enabled: true,
    runs: 1000000
  },
  metadata: {
    bytecodeHash: 'none'
  },
  outputSelection: {
    '*': {
      '*': [
        'abi',
        'evm.bytecode.object',
        'metadata'
      ]
    }
  }
}

async function compile (pathToSolcExecutable, standardInputJson) {
  return new Promise((res, rej) => {
    const p = childProcess.spawn(pathToSolcExecutable, [ '--standard-json', '--allow-paths=.' ])
    let stdout = ''
    p.stdout.on('data', data => stdout += data)
    p.on('error', err => { rej(err) })
    p.on('close', code => {
      const output = JSON.parse(stdout)
      const errors = (output.errors || []).filter(e => e.type !== 'Warning')
      if (errors.length) {
        const err = new Error('compilation failed')
        err.data = output
        rej(err)
      } else {
        res(output)
      }
    })
    p.stdin.end(JSON.stringify(normalizeInput(standardInputJson)))
  })
}

function normalizeInput (input) {
  if (typeof input === 'string') {
    input = {
      sources: {
        [input]: {}
      }
    }
  }
  if (!input.language) {
    input.language = 'Solidity'
  }
  if (!input.settings) {
    input.settings = defaultSettings
  }
  for (var key in input.sources) {
    var source = input.sources[key]
    if (!source || typeof source !== 'object') {
      input.sources[key] = source = {}
    }
    if (!source.urls) {
      source.urls = []
    }
    if (!source.urls.length) {
      source.urls.push(key)
    }
  }
  return input
}

compile.defaultSettings = defaultSettings

export default compile
