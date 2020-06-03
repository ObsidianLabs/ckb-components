const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class CkbNode {
  constructor () {
    this._terminal = null
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

  updateLifecycle (lifecycle) {
    if (this._status) {
      this._status.setState({ lifecycle })
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

export default new CkbNode()