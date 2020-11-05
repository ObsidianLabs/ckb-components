import { RPC } from 'ckb-js-toolkit'

export default class CkbIndexer {
  constructor(endpoint) {
    this.endpoint = endpoint
    this.rpc = new RPC(endpoint)
  }

  prepareParams (lockScript, cursor, step = 20, order = 'asc') {
    const params = [
      {
        script: {
          code_hash: lockScript.codeHash || lockScript.code_hash,
          hash_type: lockScript.hashType || lockScript.hash_type,
          args: lockScript.args,
        },
        script_type: 'lock',
      },
      order,
      `0x${step.toString(16)}`
    ]
    if (cursor) {
      params.push(cursor)
    }
    return params
  }

  async getCells (lockScript, cursor, step, order = 'asc') {
    const params = this.prepareParams(lockScript, cursor, step, order)
    const result = await this.rpc.get_cells(...params)
    return {
      last_cursor: result.last_cursor,
      cells: result.objects,
    }
  }

  async getTransactions (lockScript, cursor, step, order = 'desc') {
    const params = this.prepareParams(lockScript, cursor, step, order)
    const result = await this.rpc.get_transactions(...params)
    return {
      last_cursor: result.last_cursor,
      txs: result.objects,
    }
  }
}