import { CkbCell, CkbLiveCell } from '@obsidians/ckb-objects'

import CkbCellCache from './CkbCellCache'

export default class CkbCellCollector {
  #loader: AsyncGenerator<CkbLiveCell[], void, unknown>

  #cells: Set<CkbLiveCell>
  #capacity: any

  #cursor: string = ''
  #hasMore: boolean = true

  constructor (
    private cache: CkbCellCache,
    readonly indexer,
    readonly lockScript,
    readonly step: number = 20
  ) {
    this.#loader = this.collect(step)

    this.#cells = new Set()
    this.#capacity = {
      free: BigInt(0),
      used: BigInt(0),
    }
  }

  async loadMoreCells () {
    const { done, value } = await this.#loader.next()

    if (!value) {
      return
    }

    value.forEach(cell => {
      if (cell.isEmpty()) {
        this.#capacity.free += cell.capacity.value
      } else {
        this.#capacity.used += cell.capacity.value
      }
      this.#cells.add(cell)
      this.cache.push(cell)
    })

    return {
      done,
      capacity: this.#capacity,
      cells: [...this.#cells],
    }
  }

  private async *collect (step: number) {
    while (this.#hasMore) {
      const { cursor, cells } = await this.indexer.getCells(
        this.lockScript,
        this.#cursor,
        step
      ) as { cursor: string, cells: Array<any> }
      
      this.#cursor = cursor
      if (cells.length < step) {
        this.#hasMore = false
      }

      yield cells.map(toCkbLiveCell)
    }
  }
}

function toCkbLiveCell ({ out_point, output, output_data, block_number, cellbase }) {
  const outPoint = {
    txHash: out_point.tx_hash,
    index: out_point.index,
  }
  const lock = output.lock && {
    hashType: output.lock.hash_type,
    codeHash: output.lock.code_hash,
    args: output.lock.args,
  }
  const type = output.type && {
    hashType: output.type.hash_type,
    codeHash: output.type.code_hash,
    args: output.type.args,
  }
  return new CkbLiveCell({
    outPoint,
    capacity: output.capacity,
    lock,
    type,
    data: output_data,
    blockNumber: block_number,
    cellbase,
  } as CkbCell)
}
