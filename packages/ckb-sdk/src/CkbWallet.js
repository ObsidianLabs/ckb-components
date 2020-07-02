import toCkbLiveCell from './toCkbLiveCell'
import PendingTx from './PendingTx'

export default class CkbWallet {
  constructor(sdk, value) {
    this.ckbClient = sdk.ckbClient
    this.ckbIndexer = sdk.ckbIndexer
    this.ckbExplorer = 'https://api.explorer.nervos.org/testnet/api/v1'
    this.value = value
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
    return lock_script
  }

  async getTransactions (cursor, size = 20) {
    const lockScript = await this.lockScript()
    const { last_cursor, txs } = await this.ckbIndexer.getTransactions(lockScript, cursor, size)

    return {
      cursor: last_cursor,
      txs: txs.map(tx => new PendingTx(tx, this.ckbClient)),
    }
  }

  async *loadCells () {
    if (!this.collector) {
      const lockScript = await this.lockScript()
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