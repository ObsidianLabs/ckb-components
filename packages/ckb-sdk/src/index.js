import CkbClient from './CkbClient'

export default class CkbSdk {
  constructor (nodeUrl = 'http://localhost:8114') {
    this.nodeUrl = nodeUrl
    this.ckbClient = new CkbClient(nodeUrl)
  }
}
