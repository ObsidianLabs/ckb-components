import CkbClient from './CkbClient'
import CkbIndexer from './CkbIndexer'
import CkbAccount from './CkbAccount'

export default class CkbSdk {
  constructor ({ url = 'http://localhost:8114', indexer, explorer }) {
    this.nodeUrl = url
    this.ckbClient = new CkbClient(url)
    if (indexer) {
      this.ckbIndexer = new CkbIndexer(indexer)
    }
    this.ckbExplorer = explorer
  }

  walletFrom (value) {
    if (this.ckbExplorer) {
      return new CkbAccount.WithExplorer(this, value)
    } else {
      return new CkbAccount.WithoutExplorer(this, value)
    }
  }
}
