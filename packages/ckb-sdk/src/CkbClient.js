import { RPC, validators } from 'ckb-js-toolkit'

import cloneDeep from 'lodash/cloneDeep'

export default class CkbClient {
  constructor(nodeUrl) {
    this.nodeUrl = nodeUrl
    this.rpc = new RPC(nodeUrl)
    this.txsCache = {}
  }

  async sendTransaction(tx) {
    validators.ValidateTransaction(tx)
    return await this.rpc.send_transaction(tx)
  }

  async loadTransaction (tx_hash, noCache) {
    if (noCache || !this.txsCache[tx_hash]) {
      this.txsCache[tx_hash] = this.rpc.get_transaction(tx_hash)
    }
    const tx = await this.txsCache[tx_hash]
    if (!tx || !tx.tx_status || tx.tx_status.status === 'pending' || tx.tx_status.status === 'proposed') {
      this.txsCache[tx_hash] = undefined
    }
    return cloneDeep(tx)
  }
  
  async loadOutpoint (out_point) {
    const tx = await this.loadTransaction(out_point.tx_hash)
    if (!tx || !tx.transaction || !tx.transaction.outputs) {
      return
    }

    const index = parseInt(out_point.index, 16)
    const type = tx.transaction.outputs[index].type
    const data = tx.transaction.outputs_data[index]
    const cell = tx.transaction.outputs[index]
    return { out_point, type, data, ...cell }
  }
}