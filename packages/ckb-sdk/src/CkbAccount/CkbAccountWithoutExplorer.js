import { CkbScript, lib } from '@obsidians/ckb-objects'

import CkbAccount from './CkbAccount'

export default class CkbAccountWithoutExplorer extends CkbAccount {
  constructor(sdk, value) {
    super(sdk, value)
    this.indexed = undefined
    this._getInfo = null
  }

  async info (force) {
    if (!this._getInfo || force) {
      this._getInfo = async () => {
        const lock_hash = this.lock_hash
        try {
          await this.ensureIndex()
        } catch (e) {
          return {}
        }
        const result = await this.ckbClient.rpc.get_capacity_by_lock_hash(lock_hash)
        if (!result) {
          return {}
        }
        return {
          balance: result.capacity,
          live_cells_count: parseInt(result.cells_count),
          transactions_count: '(n/a)'
        }
      }
    }
    return await this._getInfo()
  }

  async lock_script () {
    if (lib.isHexString(this.value)) {
      return await this.getLockScriptFromCell()
    }
    const lock = new CkbScript(this.value)
    return {
      hash_type: lock.hash_type,
      code_hash: lock.code_hash,
      args: lock.args.serialize(),
    }
  }

  async getLockScriptFromCell () {
    try {
      await this.ensureIndex()
    } catch (e) {
      return
    }
    const result = await this.ckbClient.rpc.get_live_cells_by_lock_hash(this.lock_hash, '0x0', '0x1', true)
    return result && result[0] && result[0].cell_output.lock
  }

  async ensureIndex () {
    if (!await this.checkIndexState()) {
      await this.createIndex()
    }
  }

  async checkIndexState () {
    if (typeof this.indexed === 'undefined') {
      const indexStates = await this.ckbClient.rpc.get_lock_hash_index_states()
      const match = indexStates.find(state => state.lock_hash === this.lock_hash)
      this.indexed = !!match
      return this.indexed
    }
    return this.indexed
  }

  async createIndex () {
    const result = await this.ckbClient.rpc.index_lock_hash(this.lock_hash, '0x0')
    this.indexed = true
    return result
  }

  async removeIndex () {
    const result = await this.ckbClient.rpc.deindex_lock_hash(this.lock_hash)
    this.indexed = false
    return result
  }
}
