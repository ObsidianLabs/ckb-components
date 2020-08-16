export default class TxCell {
  constructor (outpoint, ckbClient) {
    this.outpoint = outpoint
    this.ckbClient = ckbClient
  }

  get blockNumber () {
    return BigInt(this.outpoint.block_number).toString()
  }

  get type () {
    return this.outpoint.io_type
  }

  get txHash () {
    return this.outpoint.tx_hash
  }

  get txIndex () {
    return Number(this.outpoint.tx_index)
  }

  async fetchTransaction () {
    return await this.ckbClient.loadTransaction(this.txHash)
  }
}