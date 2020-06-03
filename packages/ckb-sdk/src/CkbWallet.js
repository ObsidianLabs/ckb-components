import { cell_collectors } from 'ckb-js-toolkit'
import { CkbScript, lib } from '@obsidians/ckb-tx-builder'

import toCkbLiveCell from './toCkbLiveCell'

export default class CkbWallet {
  constructor(ckbClient, lockHash) {
    this.ckbClient = ckbClient
    this.lockHash = lockHash
    this.lockScript = null
    this.collector = new cell_collectors.RPCCollector(this.ckbClient.rpc, lockHash, {
      skipCellWithContent: false,
      loadData: true
    })
    this.indexed = undefined
  }

  static from (ckbClient, value) {
    if (value.startsWith('ckb') || value.startsWith('ckt')) {
      try {
        const script = new CkbScript(value)
        const wallet = new CkbWallet(ckbClient, script.hash)
        wallet.lockScript = script
        return wallet
      } catch (e) {
        throw new Error('Invalid address.')
      }
    } else if (lib.isHexString(value)) {
      if (value.length !== 66) {
        throw new Error('Invalid lock hash, expected a 0x-prefixed hex string with 64 digits.')
      }
      try {
        return new CkbWallet(ckbClient, value)
      } catch (e) {
        throw new Error('Invalid lock hash.')
      }
    }
    throw new Error('Invalid value, expected a lock hash or CKB address.')
  }

  async getCapacity () {
    const result = await this.ckbClient.core.rpc.getCapacityByLockHash(this.lockHash)
    if (!result) {
      return { capacity: BigInt(0), cellsCount: 0 }
    }
    return {
      capacity: BigInt(result.capacity),
      cellsCount: parseInt(result.cellsCount),
      blockNumber: parseInt(result.blockNumber)
    }
  }

  async *loadCells () {
    if (!(await this.checkIndexState())) {
      await this.createIndex()
    }
    for await (const cell of this.collector.collect()) {
      yield toCkbLiveCell(cell)
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

  async getTransactions (page = 0, size = 10) {
    if (!(await this.checkIndexState())) {
      await this.createIndex()
    }
    const txs = await this.ckbClient.core.rpc.getTransactionsByLockHash(
      this.lockHash,
      BigInt(page),
      BigInt(size),
      true
    )
    
    for (var i = 0; i < txs.length; i++) {
      const { txHash } = txs[i].createdBy
      const { txStatus, transaction } = await this.getTransaction(txHash)
      txs[i].tx = transaction
      txs[i].status = txStatus
    }

    return txs
  }

  async getTransaction(txHash) {
    return await this.ckbClient.core.rpc.getTransaction(txHash)
  }
}