import { cell_collectors } from 'ckb-js-toolkit'
import { CkbScript, lib } from '@obsidians/ckb-tx-builder'

import toCkbLiveCell from './toCkbLiveCell'
import PendingTx from './PendingTx'

export default class CkbWallet {
  constructor(sdk, value) {
    this.ckbClient = sdk.ckbClient
    this.ckbIndexer = sdk.ckbIndexer
    this.ckbExplorer = 'https://api.explorer.nervos.org/testnet/api/v1'
    this.value = value
    this.lockHash = value
    // this.collector = new cell_collectors.RPCCollector(this.ckbClient.rpc, lockHash, {
    //   skipCellWithContent: false,
    //   loadData: true
    // })
    // this.indexed = undefined
    this._getInfo = null
  }

  static from (sdk, value) {
    const wallet = new CkbWallet(sdk, value)
    return wallet
  }

  async info (force) {
    if (!this._getInfo || force) {
      this._getInfo = async () => {
        const url = `${this.ckbExplorer}/addresses/${this.value}`
        const response = await fetch(url, {
          headers: {
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
          }
        })
        const result = await response.json()
        return result.data.attributes
      }
    }
    return await this._getInfo()
  }

  async lockScript () {
    const { lock_script } = await this.info()
    return new CkbScript({
      hashType: lock_script.hash_type,
      codeHash: lock_script.code_hash,
      args: lock_script.args
    })
  }

  async *loadCells () {
    if (!(await this.checkIndexState())) {
      await this.createIndex()
    }
    for await (const cell of this.collector.collect()) {
      yield toCkbLiveCell(cell)
    }
  }

  async checkIndexState () {
    if (typeof this.indexed === 'undefined') {
      const indexStates = await this.ckbClient.core.rpc.getLockHashIndexStates()
      const match = indexStates.find(state => state.lockHash === this.lockHash)
      this.indexed = !!match
      return this.indexed
    }
    return this.indexed
  }

  async createIndex () {
    const result = await this.ckbClient.core.rpc.indexLockHash(this.lockHash, BigInt(0))
    this.indexed = true
    return result
  }

  async removeIndex () {
    const result = await this.ckbClient.core.rpc.deindexLockHash(this.lockHash)
    this.indexed = false
    return result
  }

  async getTransactions (cursor, size = 20) {
    if (!this.ckbIndexer) {
      return []
    }

    const lockScript = await this.lockScript()
    const { last_cursor, txs } = await this.ckbIndexer.getTransactions(lockScript, cursor, size)

    return {
      cursor: last_cursor,
      txs: txs.map(tx => new PendingTx(tx, this.ckbClient)),
    }
  }

  async getTransaction(txHash) {
    return await this.ckbClient.core.rpc.getTransaction(txHash)
  }
}