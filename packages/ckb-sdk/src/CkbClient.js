import CKBCore from '@nervosnetwork/ckb-sdk-core'
import { RPC } from 'ckb-js-toolkit'

import cloneDeep from 'lodash/cloneDeep'

export default class CkbClient {
  constructor(nodeUrl) {
    this.nodeUrl = nodeUrl
    this.core = new CKBCore(nodeUrl)
    this.rpc = new RPC(nodeUrl)
    this.txsCache = {}
  }

  async loadTransaction (txHash) {
    if (!this.txsCache[txHash]) {
      this.txsCache[txHash] = this.core.rpc.getTransaction(txHash)
    }
    const tx = await this.txsCache[txHash]
    return cloneDeep(tx)
  }
  
  async loadOutpoint (outPoint) {
    const tx = await this.loadTransaction(outPoint.txHash)
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