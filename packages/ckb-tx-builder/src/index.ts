import CkbRawTransaction from './CkbRawTransaction'
import CkbCellCache from './CkbCellCache'

export default class CkbTxBuilder {
  static indexer

  #cellCache: CkbCellCache

  constructor () {
    this.#cellCache = new CkbCellCache()
  }

  cellCollector (lockScript) {
    return this.#cellCache.cellCollector(CkbTxBuilder.indexer, lockScript)
  }

  newTx () {
    return new CkbRawTransaction(this.#cellCache)
  }
}
