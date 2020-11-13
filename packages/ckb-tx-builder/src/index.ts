import CkbRawTransaction from './CkbRawTransaction'
import CkbCellCache from './CkbCellCache'

export default class CkbTxBuilder {
  #indexer
  #cellCache: CkbCellCache

  constructor (indexer) {
    this.#indexer = indexer
    this.#cellCache = new CkbCellCache()
  }

  cellCollector (lock_script) {
    return this.#cellCache.cellCollector(this.#indexer, lock_script)
  }

  clearCache () {
    this.#cellCache = new CkbCellCache()
  }

  newTx () {
    return new CkbRawTransaction(this.#cellCache)
  }
}
