import { RPC } from 'ckb-js-toolkit'

export default class CkbIndexer {
  constructor(endpoint) {
    this.endpoint = endpoint
    this.rpc = new RPC(endpoint)
  }

  prepareParams (lock_script, cursor, step = 20, order = 'asc') {
    const params = [
      {
        script: {
          code_hash: lock_script.code_hash,
          hash_type: lock_script.hash_type,
          args: lock_script.args,
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

  async getCells (lock_script, cursor, step, order = 'asc') {
    const params = this.prepareParams(lock_script, cursor, step, order)
    const result = await this.rpc.get_cells(...params)
    return {
      cursor: result.last_cursor,
      cells: result.objects,
    }
  }

  async getTransactions (lock_script, cursor, step, order = 'desc') {
    const params = this.prepareParams(lock_script, cursor, step, order)
    try {
      const result = await this.rpc.get_transactions(...params)
      return {
        cursor: result.last_cursor,
        txs: result.objects,
      }
    } catch (error) {
      return { error }
    }
  }
}