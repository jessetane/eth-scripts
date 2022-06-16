import watchTx from './watch-tx.js'

async function deploy (ethers, deployer, templates) {
  if (!templates) throw new Error('missing templates')
  for (let name in templates) {
    const template = templates[name]
    template.metadata = template.build.metadata
    const abi = template.abi = template.build.abi
    const bytecode = template.bytecode = template.build.evm.bytecode.object
    if (template.preDeploy) {
      await template.preDeploy(template, templates)
    }
    if (template.address) {
      template.contract = new ethers.Contract(template.address, abi, deployer)
    } else {
      const factory = new ethers.ContractFactory(abi, bytecode, deployer)
      template.contract = await factory.deploy(...(template.args || []), { gasLimit: template.gasLimit })
      await watchTx(deployer.provider, template.contract.deployTransaction)
      template.address = template.contract.address
    }
    if (template.postDeploy) {
      await template.postDeploy(template, templates)
    }
  }
  return templates
}

export default deploy
