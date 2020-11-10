export default class TxCell {
  constructor (outpoint, ckbClient) {
    this.outpoint = outpoint
    this.ckbClient = ckbClient
  }

  get block_number () {
    return BigInt(this.outpoint.block_number).toString()
  }

  get type () {
    return this.outpoint.io_type
  }

  get tx_hash () {
    return this.outpoint.tx_hash
  }

  get io_index () {
    return Number(this.outpoint.io_index)
  }

  async fetchTransaction () {
    return await this.ckbClient.loadTransaction(this.tx_hash)
  }
}