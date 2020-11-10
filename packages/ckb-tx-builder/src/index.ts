import CkbRawTransaction from './CkbRawTransaction'
import CkbCellCache from './CkbCellCache'

export default class CkbTxBuilder {
  static indexer

  #cellCache: CkbCellCache

  constructor () {
    this.#cellCache = new CkbCellCache()
  }

  cellCollector (lock_script) {
    return this.#cellCache.cellCollector(CkbTxBuilder.indexer, lock_script)
  }

  newTx () {
    return new CkbRawTransaction(this.#cellCache)
  }
}
