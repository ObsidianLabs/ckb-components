import Sdk from '@obsidians/ckb-sdk'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class NodeManager {
  constructor () {
    this._terminal = null
    this.network = null
  }

  get sdk () {
    return this._sdk
  }

  set terminal (v) {
    this._terminal = v
  }

  set indexerTerminal (v) {
    this._indexerTerminal = v
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

    const [ckbRun, ckbIndexer, ckbMiner] = this.generateCommands({ name, version })
    await this._terminal.exec(ckbRun, { resolveOnFirstLog: true })
    if (miner) {
      await delay(500)
      await this._minerTerminal.exec(ckbMiner, { resolveOnFirstLog: true })
    }
    this._indexerTerminal.exec(ckbIndexer)
    return {
      url: 'http://localhost:8114',
      indexer: 'http://localhost:8116',
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

    const ckbIndexer = [
      'docker run -it --rm',
      `--name ckb-${name}-indexer`,
      `-p 8116:8116`,
      `-v ckb-${name}:/data`,
      `muxueqz/ckb-indexer`,
      `-c 172.17.0.1:8114 -s /data/indexer -l 0.0.0.0:8116`
    ].join(' ')

    const ckbMiner = [
      'docker exec -it',
      containerName,
      'ckb miner'
    ].join(' ')

    return [ckbRun, ckbIndexer, ckbMiner]
  }

  updateLifecycle (lifecycle, params) {
    if (this._status) {
      this._status.setState({ lifecycle })
    }
    if (params) {
      this._sdk = new Sdk(params)
    } else {
      // this._sdk = null
    }
  }

  switchNetwork (network) {
    this.network = network
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

  async stop ({ name, version }) {
    if (this._minerTerminal) {
      await this._minerTerminal.stop()
    }
    if (this._indexerTerminal) {
      await this._indexerTerminal.exec(`docker stop ckb-${name}-indexer`)
    }
    if (this._terminal) {
      await this._terminal.exec(`docker stop ckb-${name}-${version}`)
      await this._terminal.stop()
    }
  }
}

export default new NodeManager()