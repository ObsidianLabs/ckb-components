const fs = require('fs')
const semverLt = require('semver/functions/lt')
const { IpcChannel } = require('@obsidians/ipc')
const { DockerImageChannel } = require('@obsidians/docker')

class CkbInstanceManager extends IpcChannel {
  constructor () {
    super('ckb-instances')

    this.ckbNode = new DockerImageChannel('nervos/ckb', {
      filter: tag => tag.startsWith('v'),
      sort: (x, y) => semverLt(x, y) ? 1 : -1
    })
    this.ckbIndexer = new DockerImageChannel('nervos/ckb-indexer')
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
    await this.exec(`docker volume create --label version=${version},chain=dev ckb-${name}`)
    await this.exec(`docker run --rm -it -v ckb-${name}:/var/lib/ckb nervos/ckb:${version} init --force --chain dev --ba-arg ${lockArg}`)
    
    await this.exec(`docker run -d --rm -it --name ckb-config-${name} -v ckb-${name}:/var/lib/ckb --entrypoint /bin/bash nervos/ckb:${version}`)
    await this.exec(`docker cp ckb-config-${name}:/var/lib/ckb/ckb.toml /tmp/ckb.toml`)

    let config = fs.readFileSync(`/tmp/ckb.toml`, 'utf8')
    config = config.replace(`filter = "info"`, `filter = "info,ckb-script=debug"`)
    config = config.replace(/(modules = \[.+)"Stats"/, `$1"Stats", "Indexer"`)

    fs.writeFileSync(`/tmp/ckb.toml`, config, 'utf8')

    await this.exec(`docker cp /tmp/ckb.toml ckb-config-${name}:/var/lib/ckb/ckb.toml`)
    await this.exec(`docker exec -u root ckb-config-${name} /bin/bash -c "chown ckb:ckb ckb.toml"`)
    await this.exec(`docker stop ckb-config-${name}`)
  }

  async createAggronInstance ({ name, version }) {
    await this.exec(`docker volume create --label version=${version},chain=aggron ckb-aggron-${name}`)
    await this.exec(`docker run --rm -it -v ckb-aggron-${name}:/var/lib/ckb nervos/ckb:${version} init --force --chain testnet`)
  }

  async createMainnetInstance({ name, version }) {
    await this.exec(`docker volume create --label version=${version},chain=mainnet ckb-mainnet-${name}`)
    await this.exec(`docker run --rm -it -v ckb-mainnet-${name}:/var/lib/ckb nervos/ckb:${version} init --force --chain mainnet`)
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
    await this.pty.exec(`docker run -d --rm -it --name ckb-config-${name} -v ckb-${name}:/var/lib/ckb --entrypoint /bin/bash nervos/ckb:${version}`)
    await this.pty.exec(`docker cp ckb-config-${name}:/var/lib/ckb/ckb.toml /tmp/ckb.toml`)
    const config = fs.readFileSync(`/tmp/ckb.toml`, 'utf8')
    await this.pty.exec(`docker stop ckb-config-${name}`)
    return config
  }

  async writeConfig ({ name, version, content }) {
    fs.writeFileSync(`/tmp/ckb.toml`, content, 'utf8')
    await this.pty.exec(`docker run -d --rm -it --name ckb-config-${name} -v ckb-${name}:/var/lib/ckb --entrypoint /bin/bash nervos/ckb:${version}`)
    await this.pty.exec(`docker cp /tmp/ckb.toml ckb-config-${name}:/var/lib/ckb/ckb.toml`)
    await this.pty.exec(`docker exec -u root ckb-config-${name} /bin/bash -c "chown ckb:ckb ckb.toml"`)
    await this.pty.exec(`docker stop ckb-config-${name}`)
  }

  async delete (name) {
    await this.exec(`docker volume rm ckb-${name}`)
  }
}

module.exports = CkbInstanceManager
