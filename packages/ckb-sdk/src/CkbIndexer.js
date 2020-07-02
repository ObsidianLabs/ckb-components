import { RPC } from 'ckb-js-toolkit'

export default class CkbIndexer {
  constructor(endpoint) {
    this.endpoint = endpoint
    this.rpc = new RPC(endpoint)
  }

  // walletFrom (value) {
  //   return CkbWallet.from(this, value)
  // }

  async getCells () {
    const result = await this.rpc.get_cells(
      {
        "script": {
          "code_hash": "0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8",
          "hash_type": "type",
          "args": "0xda648442dbb7347e467d1d09da13e5cd3a0ef0e1"
        },
        "script_type": "lock"
      },
      "desc",
      "0x64"
    )
    console.log(result)
    return result
  }

  async getTransactions (lockScript, cursor, size) {
    const { codeHash, hashType, args } = lockScript.serialize()
    const params = [
      {
        script: {
          code_hash: codeHash,
          hash_type: hashType,
          args: args,
        },
        script_type: 'lock',
      },
      'desc',
      `0x${size.toString(16)}`
    ]
    if (cursor) {
      params.push(cursor)
    }

    const result = await this.rpc.get_transactions(...params)
    return {
      last_cursor: result.last_cursor,
      txs: result.objects,
    }
  }
}