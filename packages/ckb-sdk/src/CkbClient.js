import CKBCore from '@nervosnetwork/ckb-sdk-core'
import { RPC } from 'ckb-js-toolkit'
import CkbWallet from './CkbWallet'

export default class CkbClient {
  constructor(nodeUrl) {
    this.nodeUrl = nodeUrl
    this.core = new CKBCore(nodeUrl)
    this.rpc = new RPC(nodeUrl)
    this.txsCache = {}
  }

  walletFrom (value) {
    return CkbWallet.from(this, value)
  }
  
  async loadOutpoint (outPoint) {
    if (!this.txsCache[outPoint.txHash]) {
      this.txsCache[outPoint.txHash] = await this.core.rpc.getTransaction(outPoint.txHash)
    }
    const tx = this.txsCache[outPoint.txHash]
    if (!tx || !tx.transaction || !tx.transaction.outputs) {
      return
    }

    const index = parseInt(outPoint.index, 16)
    const type = tx.transaction.outputs[index].type
    const data = tx.transaction.outputsData[index]
    const cell = tx.transaction.outputs[index]
    return { outPoint, type, data, ...cell }
  }
}