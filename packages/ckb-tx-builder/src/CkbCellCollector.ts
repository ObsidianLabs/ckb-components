import { CkbCell, CkbLiveCell, CkbCapacity } from '@obsidians/ckb-objects'

export default class CkbCellCollector {
  #loader: AsyncGenerator<CkbLiveCell[], void, unknown>

  #cells: Set<CkbLiveCell>
  #capacity: any

  #cursor: string = ''
  #hasMore: boolean = true

  constructor (
    readonly indexer,
    readonly lock_script,
    readonly step: number = 20
  ) {
    this.clear()
  }

  clear () {
    this.#loader = this.collect(this.step)

    this.#cells = new Set()
    this.#capacity = {
      free: BigInt(0),
      used: BigInt(0),
    }
  }

  get cells () {
    return this.#cells
  }

  get nCells () {
    return this.#cells.size
  }

  get usedCapacity () {
    return new CkbCapacity(this.#capacity.used)
  }

  get freeCapacity () {
    return new CkbCapacity(this.#capacity.free)
  }

  get hasMore () {
    return this.#hasMore
  }

  async *asyncCellIterator () {
    for (let cell of this.#cells) {
      yield cell
    }
    while (this.#hasMore) {
      const cells = await this.loadMoreCells()
      for (let cell of cells) {
        yield cell
      }
    }
  }

  async loadMoreCells () {
    const { done, value } = await this.#loader.next()

    if (done || !value) {
      return
    }

    value.forEach(cell => {
      if (cell.isEmpty()) {
        this.#capacity.free += cell.capacity.value
      } else {
        this.#capacity.used += cell.capacity.value
      }
      this.#cells.add(cell)
    })

    return value
  }

  private async *collect (step: number) {
    while (this.#hasMore) {
      const { cursor, cells } = await this.indexer.getCells(
        this.lock_script,
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
  return new CkbLiveCell({
    out_point,
    capacity: output.capacity,
    lock: output.lock,
    type: output.type,
    data: output_data,
    block_number,
    cellbase,
  } as CkbCell)
}
