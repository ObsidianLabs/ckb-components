import CkbRawTransaction from './CkbRawTransaction'

import CkbCellCollection from './CkbCellCollection'
import { setFs } from './CkbData'

export default class CkbTxBuilder {
  #cellCollection: CkbCellCollection

  constructor (cellCollection: CkbCellCollection, fs) {
    this.#cellCollection = cellCollection
    setFs(fs)
  }

  newTx () {
    return new CkbRawTransaction(this, this.#cellCollection)
  }
}