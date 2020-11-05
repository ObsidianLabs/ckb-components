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
        const lockHash = this.lockHash
        try {
          await this.ensureIndex()
        } catch (e) {
          return {}
        }
        const result = await this.ckbClient.core.rpc.getCapacityByLockHash(lockHash)
        if (!result) {
          return {}
        }
        return {
          balance: result.capacity,
          live_cells_count: parseInt(result.cellsCount),
          transactions_count: '(n/a)'
        }
      }
    }
    return await this._getInfo()
  }

  async lockScript () {
    if (lib.isHexString(this.value)) {
      const lock = await this.getLockScriptFromCell()
      if (!lock) {
        return
      }
      return {
        hash_type: lock.hashType,
        code_hash: lock.codeHash,
        args: lock.args,
      }
    }
    const lock = new CkbScript(this.value)
    return {
      hash_type: lock.hashType,
      code_hash: lock.codeHash,
      args: lock.args.serialize(),
    }
  }

  async getLockScriptFromCell () {
    try {
      await this.ensureIndex()
    } catch (e) {
      return
    }
    const result = await this.ckbClient.core.rpc.getLiveCellsByLockHash(this.lockHash, '0x0', '0x1', true)
    return result && result[0] && result[0].cellOutput.lock
  }

  async ensureIndex () {
    if (!await this.checkIndexState()) {
      await this.createIndex()
    }
  }

  async checkIndexState () {
    if (typeof this.indexed === 'undefined') {
      const indexStates = await this.ckbClient.core.rpc.getLockHashIndexStates()
      const match = indexStates.find(state => state.lockHash === this.lockHash)
      this.indexed = !!match
      return this.indexed
    }
    return this.indexed
  }

  async createIndex () {
    const result = await this.ckbClient.core.rpc.indexLockHash(this.lockHash, BigInt(0))
    this.indexed = true
    return result
  }

  async removeIndex () {
    const result = await this.ckbClient.core.rpc.deindexLockHash(this.lockHash)
    this.indexed = false
    return result
  }
}
