import https from 'https'

async function verify (params) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      sourceCode: params.sourceCode,
      constructorArguements: params.constructorArgs || '',
      module: 'contract',
      action: 'verifysourcecode',
      codeformat: 'solidity-standard-json-input',
      compilerversion: params.compilerVersion,
      contractaddress: params.address,
      contractname: `${params.fileName}:${params.contractName}`,
      licenseType: params.licenseType || '1',
      apikey: params.apiKey
    }).toString()
    const subdomain = `api${!params.network || params.network === 'main' ? '' : `-${params.network}`}`
    const url = `https://${subdomain}.etherscan.io/api`
    const req = new https.request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
    req.on('error', err => reject(err))
    req.on('response', res => {
      const statusCode = res.statusCode
      let data = ''
      res.on('error', err => reject(err))
      res.on('data', d => data += d.toString())
      res.on('end', () => {
        try {
          data = JSON.parse(data)
          if (data.status === '1') {
            const statusUrl = `https://${subdomain}.etherscan.io/api?module=contract&action=checkverifystatus&apikey=${params.apiKey}&guid=${data.result}`
            resolve({ statusCode, data: statusUrl })
          } else {
            const err = new Error('Unknown')
            err.statusCode = statusCode
            err.data = data
            reject(err)
          }
        } catch (err) {
          err.statusCode = statusCode
          err.data = data
          reject(err)
        }
      })
    })
    req.end(body)
  })
}

export default verify
