import { CkbData, FileReader } from '@obsidians/ckb-objects'

import CkbRawTransaction from './CkbRawTransaction'
import CkbCellCollection from './CkbCellCollection'

export default class CkbTxBuilder {
  #cellCollection: CkbCellCollection

  constructor (cellCollection: CkbCellCollection, fs) {
    this.#cellCollection = cellCollection
    CkbData.fileReader = new FileReader(fs)
  }

  newTx () {
    return new CkbRawTransaction(this, this.#cellCollection)
  }
}