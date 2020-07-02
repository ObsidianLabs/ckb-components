export default class PendingTx {
  constructor (rawTx, ckbClient) {
    this.rawTx = rawTx
    this.ckbClient = ckbClient
  }

  get blockNumber () {
    return BigInt(this.rawTx.block_number).toString()
  }

  get txHash () {
    return this.rawTx.tx_hash
  }

  get index () {
    return Number(this.rawTx.tx_index)
  }

  async fetchTransaction () {
    return await this.ckbClient.loadTransaction(this.txHash)
  }
}