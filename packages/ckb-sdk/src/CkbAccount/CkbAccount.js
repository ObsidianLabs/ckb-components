import { CkbScript, lib } from '@obsidians/ckb-objects'

import TxCell from './TxCell'

export default class CkbAccount {
  constructor(sdk, value) {
    this.ckbClient = sdk.ckbClient
    this.ckbIndexer = sdk.ckbIndexer
    this.ckbExplorer = sdk.ckbExplorer
    this.value = value
    this._getInfo = null
  }

  get rpc () {
    return this.ckbClient.rpc
  }

  get lock_hash () {
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

  async info (force) {
    if (!this._getInfo || force) {
      this._getInfo = async () => {
        const url = `${this.ckbExplorer}/addresses/${this.value}`
        const response = await fetch(url)
        const result = await response.json()
        const { balance, live_cells_count, transactions_count, ...rest } = result.data.attributes
        return {
          balance,
          live_cells_count: parseInt(live_cells_count),
          transactions_count,
          ...rest,
        }
      }
    }
    return await this._getInfo()
  }

  async lock_script () {
    const { lock_script } = await this.info()
    return lock_script
  }

  async getTransactions (lastCursor, size = 20) {
    const lock_script = await this.lock_script()
    if (!lock_script) {
      return { txs: [] }
    }
    const { cursor, txs } = await this.ckbIndexer.getTransactions(lock_script, lastCursor, size)

    return {
      cursor,
      txs: txs.map(tx => new TxCell(tx, this.ckbClient)),
    }
  }
}
