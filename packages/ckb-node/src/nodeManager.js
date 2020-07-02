import Sdk from '@obsidians/ckb-sdk'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class NodeManager {
  constructor () {
    this._terminal = null
  }

  get sdk () {
    return this._sdk
  }

  set terminal (v) {
    this._terminal = v
  }

  set minerTerminal (v) {
    this._minerTerminal = v
  }

  set status (v) {
    this._status = v
  }

  async start ({ name, version, miner = true }) {
    if (!this._terminal) {
      return
    }

    const [ckbRun, ckbMiner] = this.generateCommands({ name, version })
    await this._terminal.exec(ckbRun, { resolveOnFirstLog: true })
    if (miner) {
      await delay(500)
      await this._minerTerminal.exec(ckbMiner, { resolveOnFirstLog: true })
    }
    return {
      url: 'http://localhost:8114',
    }
  }

  generateCommands ({ name, version }) {
    const containerName = `ckb-${name}-${version}`

    const ckbRun = [
      'docker run -it --rm',
      `--name ${containerName}`,
      `-p 8114:8114`,
      `-p 8115:8115`,
      `-v ckb-${name}:/var/lib/ckb`,
      `nervos/ckb:${version} run`
    ].join(' ')

    const ckbMiner = [
      'docker exec -it',
      containerName,
      'ckb miner'
    ].join(' ')

    return [ckbRun, ckbMiner]
  }

  updateLifecycle (lifecycle, params) {
    if (this._status) {
      this._status.setState({ lifecycle })
    }
    if (params) {
      this._sdk = new Sdk(params)
    } else {
      this._sdk = null
    }
  }

  switchNetwork (network) {
    if (network.url) {
      this._sdk = new Sdk(network)
    } else {
      this._sdk = null
    }
  }

  updateBlockNumber (blockNumber) {
    if (this._status) {
      this._status.setState({ blockNumber })
    }
  }

  async stop () {
    if (this._minerTerminal) {
      await this._minerTerminal.stop()
    }
    if (this._terminal) {
      await this._terminal.stop()
    }
  }
}

export default new NodeManager()