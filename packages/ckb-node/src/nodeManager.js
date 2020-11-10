import { networkManager, instanceChannel } from '@obsidians/ckb-network'
import notification from '@obsidians/notification'

import { getCachingKeys, dropByCacheKey } from 'react-router-cache-route'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class NodeManager {
  constructor () {
    this._terminal = null
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
      throw new Error()
    }

    const versions = await instanceChannel.ckbNode.versions()
    if (!versions.find(v => v.Tag === version)) {
      notification.error(`CKB Node ${version} not Installed`, `Please install the version in <b>CKB Version Manager</b>`)
      throw new Error('Version not installed')
    }

    const [ckbRun, ckbIndexer, ckbMiner] = this.generateCommands({ name, version })
    await this._terminal.exec(ckbRun, {
      resolveOnFirstLog: true,
      stopCommand: `docker stop ckb-${name}-${version}`,
    })
    if (miner) {
      await delay(2000)
      await this._minerTerminal.exec(ckbMiner, { resolveOnFirstLog: true })
    }
    this._indexerTerminal.exec(ckbIndexer, {
      stopCommand: `docker stop -t 1 ckb-${name}-indexer`,
    })
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
      `nervos/ckb-indexer`,
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
      networkManager.updateSdk(params)
    }
  }

  updateBlockNumber (block_number) {
    if (this._status) {
      this._status.setState({ block_number })
    }
  }

  async stop () {
    const cachingKeys = getCachingKeys()
    cachingKeys.filter(key => key.startsWith('contract-') || key.startsWith('account-')).forEach(dropByCacheKey)
    
    let n
    if (this._minerTerminal) {
      n = notification.info('Stopping CKB Miner...', '', 0)
      await this._minerTerminal.stop()
      n.dismiss()
    }
    if (this._indexerTerminal) {
      n = notification.info('Stopping CKB Indexer...', '', 0)
      await this._indexerTerminal.stop()
      n.dismiss()
    }
    if (this._terminal) {
      n = notification.info('Stopping CKB Node...', '', 0)
      await this._terminal.stop()
      n.dismiss()
    }
  }
}

export default new NodeManager()