const fs = require('fs')
const { net } = require('electron')

const { IpcChannel } = require('@obsidians/ipc')

const semverLt = require('semver/functions/lt')

class CkbInstanceManager extends IpcChannel {
  constructor () {
    super('ckb-instances')
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
    await this.pty.exec(`docker volume create --label version=${version},chain=dev ckb-${name}`)
    await this.pty.exec(`docker run --rm -it -v ckb-${name}:/var/lib/ckb nervos/ckb:${version} init --force --chain dev --ba-arg ${lockArg}`)
    
    await this.pty.exec(`docker run -d --rm -it --name ckb-config-${name} -v ckb-${name}:/var/lib/ckb --entrypoint /bin/bash nervos/ckb:${version}`)
    await this.pty.exec(`docker cp ckb-config-${name}:/var/lib/ckb/ckb.toml /tmp/ckb.toml`)

    let config = fs.readFileSync(`/tmp/ckb.toml`, 'utf8')
    config = config.replace(`filter = "info"`, `filter = "info,ckb-script=debug"`)
    config = config.replace(`= ["Net", "Pool", "Miner", "Chain", "Stats", "Experiment"]`, `= ["Net", "Pool", "Miner", "Chain", "Stats", "Indexer", "Experiment"]`)
    config = config.replace(`= ["Net", "Pool", "Miner", "Chain", "Stats", "Subscription", "Experiment"]`, `= ["Net", "Pool", "Miner", "Chain", "Stats", "Indexer", "Subscription", "Experiment"]`)

    fs.writeFileSync(`/tmp/ckb.toml`, config, 'utf8')

    await this.pty.exec(`docker cp /tmp/ckb.toml ckb-config-${name}:/var/lib/ckb/ckb.toml`)
    await this.pty.exec(`docker exec -u root ckb-config-${name} /bin/bash -c "chown ckb:ckb ckb.toml"`)
    await this.pty.exec(`docker stop ckb-config-${name}`)
  }

  async createAggronInstance ({ name, version }) {
    await this.pty.exec(`docker volume create --label version=${version},chain=aggron ckb-aggron-${name}`)
    await this.pty.exec(`docker run --rm -it -v ckb-aggron-${name}:/var/lib/ckb nervos/ckb:${version} init --force --chain testnet`)
  }

  async createMainnetInstance({ name, version }) {
    await this.pty.exec(`docker volume create --label version=${version},chain=mainnet ckb-mainnet-${name}`)
    await this.pty.exec(`docker run --rm -it -v ckb-mainnet-${name}:/var/lib/ckb nervos/ckb:${version} init --force --chain mainnet`)
  }

  async list (chain = 'dev') {
    const { logs: volumes } = await this.pty.exec(`docker volume ls --format "{{json . }}"`)
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

  async delete (name) {
    await this.pty.exec(`docker volume rm ckb-${name}`)
  }

  async versions () {
    const { logs: images } = await this.pty.exec(`docker images nervos/ckb --format "{{json . }}"`)
    const versions = images.split('\n').filter(Boolean).map(JSON.parse).filter(x => x.Tag.startsWith('v'))
    return versions
  }

  async deleteVersion (version) {
    await this.pty.exec(`docker rmi nervos/ckb:${version}`)
  }

  async remoteVersions (size) {
    const res = await new Promise((resolve, reject) => {
      const request = net.request(`http://registry.hub.docker.com/v1/repositories/nervos/ckb/tags`)
      request.on('response', (response) => {
        let body = ''
        response.on('data', chunk => {
          body += chunk
        })
        response.on('end', () => resolve(body))
      })
      request.end()
    })
    return JSON.parse(res)
      .filter(({ name }) => name.startsWith('v'))
      .sort((x, y) => semverLt(x.name, y.name) ? 1 : -1)
      .slice(0, size)
  }

  async any () {
    const { versions = [] } = await this.versions()
    return !!versions.length
  }
}

module.exports = CkbInstanceManager