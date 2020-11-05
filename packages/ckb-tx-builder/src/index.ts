import CkbRawTransaction from './CkbRawTransaction'
import CkbCellCollection from './CkbCellCollection'

export default class CkbTxBuilder {
  #cellCollection: CkbCellCollection

  constructor () {
    this.#cellCollection = new CkbCellCollection()
  }

  pushCells (cells) {
    this.#cellCollection.pushCells(cells)
  }

  clearCellsForLockHash (lockHash) {
    this.#cellCollection.clearCellsForLockHash(lockHash)
  }

  newTx () {
    return new CkbRawTransaction(this.#cellCollection)
  }
}