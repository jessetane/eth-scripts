import childProcess from 'child_process'

let geths = []

process.on('exit', () => {
  geths.forEach(geth => geth.close())
})

export default function spawnGeth (exe, opts = {}) {  
  return new Promise((res, rej) => {
    const datadir = `${opts.datadir || 'var'}`
    const gethOpts = [
      '--http',
      '--http.api=web3,eth,debug,personal,net',
      '--allow-insecure-unlock',
      `--datadir=${datadir}`,
      '--dev',
      '--dev.period=0',
      `--dev.gaslimit=${opts.gasLimit || '11500000'}`,
      `--miner.gaslimit=${opts.gasLimit || '11500000'}`,
      `--rpc.gascap=${opts.gasCap || 0}`,
      `--rpc.txfeecap=0`,
      `--http.port=${opts.port || '8545'}`,
      '--http.corsdomain=*',
      '--nodiscover'
    ]
    const geth = childProcess.spawn(exe, gethOpts)
    geth.stderr.on('data', d => {
      d = d.toString()
      if (opts.debug) {
        process.stderr.write(d)
      }
      if (geth.ready) return
      if (d.indexOf('Commit new mining work') !== -1) {
        geth.ready = true
        res(geth)
      }
    })
    geth.on('exit', code => {
      if (!geth.done) {
        geth.emit('error', new Error('geth crashed with code: ' + code))
      }
    })
    geth.close = function () {
      geths = geths.filter(g => g !== geth)
      geth.done = true
      geth.kill()
    }
    geths.push(geth)
  })
}
