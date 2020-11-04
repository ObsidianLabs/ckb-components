import IndexerCellCollector from './IndexerCellCollector'

export default class CkbCellManager {
  constructor(account, indexer, step = 20) {
    this.account = account
    this.indexer = indexer
    this.collector = null

    this.nCells = undefined

    this.cells = []

    this.capacity = {
      free: BigInt(0),
      used: BigInt(0),
    }

    this.initialized = this.initialize(step)
  }

  async initialize (step) {
    const lockScript = await this.account.lockScript()
    if (!lockScript) {
      throw new Error(`Fail to get lock script for ${this.account.value}`)
    }
    this.collector = new IndexerCellCollector(this.account.rpc, this.indexer, lockScript)
    this.loader = this.collector.collect(step)
  }

  async refresh () {
    const { live_cells_count } = await this.account.info()
    this.nCells = live_cells_count
  }

  async loadMoreCells () {
    await this.initialized

    const { done, value } = await this.loader.next()

    value.forEach(cell => {
      if (cell.isEmpty()) {
        this.capacity.free = this.capacity.free + cell.capacity.value
      } else {
        this.capacity.used = this.capacity.used + cell.capacity.value
      }
    })

    this.cells = this.cells.concat(value)

    return {
      done,
      capacity: this.capacity,
      cells: this.cells,
    }
  }
}
