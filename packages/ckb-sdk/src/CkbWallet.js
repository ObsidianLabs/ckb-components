import { cell_collectors } from 'ckb-js-toolkit'
import { CkbScript, lib } from '@obsidians/ckb-tx-builder'

import toCkbLiveCell from './toCkbLiveCell'
import PendingTx from './PendingTx'

export default class CkbWallet {
  constructor(sdk, lockHash) {
    this.ckbClient = sdk.ckbClient
    this.ckbIndexer = sdk.ckbIndexer
    this.ckbExplorer = 'https://api.explorer.nervos.org/testnet/api/v1'
    this.lockHash = lockHash
    this.lockScript = null
    this.collector = new cell_collectors.RPCCollector(this.ckbClient.rpc, lockHash, {
      skipCellWithContent: false,
      loadData: true
    })
    this.indexed = undefined
  }

  static from (ckbClient, value) {
    if (value.startsWith('ckb') || value.startsWith('ckt')) {
      try {
        const script = new CkbScript(value)
        const wallet = new CkbWallet(ckbClient, script.hash)
        wallet.lockScript = script
        return wallet
      } catch (e) {
        throw new Error('Invalid address.')
      }
    } else if (lib.isHexString(value)) {
      if (value.length !== 66) {
        throw new Error('Invalid lock hash, expected a 0x-prefixed hex string with 64 digits.')
      }
      try {
        return new CkbWallet(ckbClient, value)
      } catch (e) {
        throw new Error('Invalid lock hash.')
      }
    }
    throw new Error('Invalid value, expected a lock hash or CKB address.')
  }

  

  async getCapacity () {
    const url = `${this.ckbExplorer}/addresses/${this.lockScript.getAddress()}`
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    })
    const result = await response.json()
    return result.data.attributes
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

    const { last_cursor, txs } = await this.ckbIndexer.getTransactions(this.lockScript, cursor, size)

    return {
      cursor: last_cursor,
      txs: txs.map(tx => new PendingTx(tx, this.ckbClient)),
    }
  }

  async getTransaction(txHash) {
    return await this.ckbClient.core.rpc.getTransaction(txHash)
  }
}