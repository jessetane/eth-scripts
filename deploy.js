import config from './config.js'
import watchTx from './watch-tx.js'

async function deploy (deployer, templates) {
  if (!templates) throw new Error('missing templates')
  for (let name in templates) {
    const template = templates[name]
    const abi = template.build.abi
    const bytecode = template.build.evm.bytecode.object
    const factory = new config.ethers.ContractFactory(abi, bytecode, deployer)
    if (template.preDeploy) {
      await template.preDeploy(template, templates)
    }
    if (template.address) {
      template.contract = new config.ethers.Contract(template.address, abi, deployer)
    } else {
      template.contract = await factory.deploy(...(template.args || []), { gasLimit: template.gasLimit || 9999999 })
      await watchTx(template.contract.deployTransaction)
    }
    if (template.postDeploy) {
      await template.postDeploy(template, templates)
    }
  }
  return templates
}

export default deploy
