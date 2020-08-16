import { CkbScript, lib } from '@obsidians/ckb-tx-builder'

import toCkbLiveCell from './toCkbLiveCell'
import PendingTx from './PendingTx'

export default class CkbWallet {
  constructor(sdk, value) {
    this.ckbClient = sdk.ckbClient
    this.ckbIndexer = sdk.ckbIndexer
    this.ckbExplorer = sdk.ckbExplorer
    this.value = value
    this.indexed = undefined
    this._getInfo = null
  }

  static from (sdk, value) {
    const wallet = new CkbWallet(sdk, value)
    return wallet
  }

  get lockHash () {
    if (this.value.startsWith('ckb') || this.value.startsWith('ckt')) {
      try {
        const lock = new CkbScript(this.value)
        return lock.hash
      } catch (e) {
        throw new Error('Invalid address.')
      }
    } else if (lib.isHexString(this.value)) {
      if (this.value.length !== 66) {
        throw new Error('Invalid lock hash, expected a 0x-prefixed hex string with 64 digits.')
      }
      return this.value
    }
    throw new Error('Invalid value, expected a lock hash or CKB address.')
  }

  async fetchAddressInfo (ckbExplorer) {
    const url = `${ckbExplorer}/addresses/${this.value}`
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    })
    const result = await response.json()
    return result.data.attributes
  }

  async info (force) {
    if (!this._getInfo || force) {
      if (this.ckbExplorer) {
        this._getInfo = async () => await this.fetchAddressInfo(this.ckbExplorer)
      } else {
        if (!await this.checkIndexState()) {
          await this.createIndex()
        }
        this._getInfo = async () => {
          const result = await this.ckbClient.core.rpc.getCapacityByLockHash(this.lockHash)
          if (!result) {
            return { balance: BigInt(0), live_cells_count: 0 }
          }
          return {
            balance: BigInt(result.capacity),
            live_cells_count: parseInt(result.cellsCount),
            transactions_count: '(n/a)'
          }
        }
      }
    }
    return await this._getInfo()
  }

  async lockScript () {
    if (this.ckbExplorer) {
      const { lock_script } = await this.info()
      return lock_script
    } else {
      if (lib.isHexString(this.value)) {
        const lock = await this.getLockScript()
        if (!lock) {
          return
        }
        return {
          hash_type: lock.hashType,
          code_hash: lock.codeHash,
          args: lock.args,
        }
      }
      const lock = new CkbScript(this.value)
      return {
        hash_type: lock.hashType,
        code_hash: lock.codeHash,
        args: lock.args.serialize(),
      }
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

  async getLockScript () {
    if (!(await this.checkIndexState())) {
      await this.createIndex()
    }
    const result = await this.ckbClient.core.rpc.getLiveCellsByLockHash(this.lockHash, '0x0', '0x1', true)
    return result && result[0] && result[0].cellOutput.lock
  }

  async getTransactions (cursor, size = 20) {
    const lockScript = await this.lockScript()
    if (!lockScript) {
      return { txs: [] }
    }
    const { last_cursor, txs } = await this.ckbIndexer.getTransactions(lockScript, cursor, size)

    return {
      cursor: last_cursor,
      txs: txs.map(tx => new PendingTx(tx, this.ckbClient)),
    }
  }

  async *loadCells () {
    if (!this.collector) {
      const lockScript = await this.lockScript()
      if (!lockScript) {
        return
      }
      this.collector = new IndexerCellCollector(this.ckbClient.rpc, this.ckbIndexer, lockScript)
    }
    for await (const cell of this.collector.collect()) {
      yield cell
    }
  }
}


class IndexerCellCollector {
  constructor(rpc, indexer, lockScript) {
    this.rpc = rpc
    this.indexer = indexer
    this.lockScript = lockScript

    this.cursor = ''
    this.hasMore = true
  }

  async *collect() {
    while (this.hasMore) {
      const { last_cursor, cells } = await this.indexer.getCells(this.lockScript, this.cursor)
      for (const cell of cells) {
        yield toCkbLiveCell(cell)
      }
      this.cursor = last_cursor
      if (cells.length < 20) {
        this.hasMore = false
      }
    }
  }
}