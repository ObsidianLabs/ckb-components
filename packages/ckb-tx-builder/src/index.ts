import CkbRawTransaction from './CkbRawTransaction'
import CkbCellCache from './CkbCellCache'

export default class CkbTxBuilder {
  #indexer
  #cellCache: CkbCellCache

  constructor (indexer) {
    this.#indexer = indexer
    this.#cellCache = new CkbCellCache(indexer)
  }

  cellCollector (lock_script) {
    return this.#cellCache.cellCollector(lock_script)
  }

  clearCache () {
    this.#cellCache = new CkbCellCache(this.#indexer)
  }

  newTx () {
    return new CkbRawTransaction(this.#cellCache)
  }
}
