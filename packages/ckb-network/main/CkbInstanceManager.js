const fs = require('fs')
const path = require('path')
const os = require('os')
const { IpcChannel } = require('@obsidians/ipc')
const { DockerImageChannel } = require('@obsidians/docker')

class CkbInstanceManager extends IpcChannel {
  constructor () {
    super('ckb-instances')

    this.ckbNode = new DockerImageChannel('nervos/ckb')
    this.ckbIndexer = new DockerImageChannel('obsidians/ckb-indexer')
  }

  async create ({ name, version, chain, lockArg }) {
    switch (chain) {
      case 'dev':
        return this.createDevInstance({ name, version, lockArg })
      case 'aggron':
        return this.createAggronInstance({ name, version })
      case 'mainnet':
        return this.createMainnetInstance({ name, version })
      default:
        return
    }
  }

  async createDevInstance({ name, version, lockArg }) {
    const configPath = path.join(os.tmpdir(), 'ckb.toml')

    await this.exec(`docker volume create --label version=${version},chain=dev ckb-${name}`)
    await this.exec(`docker run --rm -i -v ckb-${name}:/var/lib/ckb nervos/ckb:${version} init --force --chain dev --ba-arg ${lockArg}`)
    await this.exec(`docker run -di --rm --name ckb-config-${name} -v ckb-${name}:/var/lib/ckb --entrypoint /bin/bash nervos/ckb:${version}`)
    await this.exec(`docker cp ckb-config-${name}:/var/lib/ckb/ckb.toml ${configPath}`)

    let config = fs.readFileSync(configPath, 'utf8')
    config = config.replace(`filter = "info"`, `filter = "info,ckb-script=debug"`)
    config = config.replace(/(modules = \[.+)"Stats"/, `$1"Stats", "Indexer"`)

    fs.writeFileSync(configPath, config, 'utf8')

    await this.exec(`docker cp ${configPath} ckb-config-${name}:/var/lib/ckb/ckb.toml`)
    await this.exec(`docker exec -u root ckb-config-${name} /bin/bash -c "chown ckb:ckb ckb.toml"`)
    await this.exec(`docker stop ckb-config-${name}`)
  }

  async createAggronInstance ({ name, version }) {
    await this.exec(`docker volume create --label version=${version},chain=aggron ckb-aggron-${name}`)
    await this.exec(`docker run --rm -i -v ckb-aggron-${name}:/var/lib/ckb nervos/ckb:${version} init --force --chain testnet`)
  }

  async createMainnetInstance({ name, version }) {
    await this.exec(`docker volume create --label version=${version},chain=mainnet ckb-mainnet-${name}`)
    await this.exec(`docker run -di --rm -v ckb-mainnet-${name}:/var/lib/ckb nervos/ckb:${version} init --force --chain mainnet`)
  }

  async list (chain = 'dev') {
    const { logs: volumes } = await this.exec(`docker volume ls --format "{{json . }}"`)
    const instances = volumes.split('\n').filter(Boolean).map(JSON.parse).filter(x => x.Name.startsWith('ckb-'))
    const instancesWithLabels = instances.map(i => {
      const labels = {}
      i.Labels.split(',').forEach(x => {
        const [name, value] = x.split('=')
        labels[name] = value
      })
      i.Labels = labels
      return i
    })
    
    return instancesWithLabels.filter(x => x.Labels.chain === chain)
  }

  async readConfig ({ name, version }) {
    const configPath = path.join(os.tmpdir(), 'ckb.toml')
    await this.exec(`docker run --rm -di --name ckb-config-${name} -v ckb-${name}:/var/lib/ckb --entrypoint /bin/bash nervos/ckb:${version}`)
    await this.exec(`docker cp ckb-config-${name}:/var/lib/ckb/ckb.toml ${configPath}`)
    const config = fs.readFileSync(configPath, 'utf8')
    await this.exec(`docker stop ckb-config-${name}`)
    return config
  }

  async writeConfig ({ name, version, content }) {
    const configPath = path.join(os.tmpdir(), 'ckb.toml')
    fs.writeFileSync(configPath, content, 'utf8')
    await this.exec(`docker run --rm -di --name ckb-config-${name} -v ckb-${name}:/var/lib/ckb --entrypoint /bin/bash nervos/ckb:${version}`)
    await this.exec(`docker cp ${configPath} ckb-config-${name}:/var/lib/ckb/ckb.toml`)
    await this.exec(`docker exec -u root ckb-config-${name} /bin/bash -c "chown ckb:ckb ckb.toml"`)
    await this.exec(`docker stop ckb-config-${name}`)
  }

  async delete (name) {
    await this.exec(`docker volume rm ckb-${name}`)
  }
}

module.exports = CkbInstanceManager
