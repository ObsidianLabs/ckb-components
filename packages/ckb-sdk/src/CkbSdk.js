import CkbClient from './CkbClient'
import CkbWallet from './CkbWallet'
import CkbIndexer from './CkbIndexer'

export default class CkbSdk {
  constructor ({ url = 'http://localhost:8114', indexer }) {
    this.nodeUrl = url
    this.ckbClient = new CkbClient(url)
    if (indexer) {
      this.ckbIndexer = new CkbIndexer(indexer)
      // this.ckbIndexer.getCells()
    }
  }

  walletFrom (value) {
    return CkbWallet.from(this, value)
  }
}
