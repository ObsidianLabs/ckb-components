import { CkbCapacity, CkbLiveCell, CkbCellStatus, CkbScript } from '@obsidians/ckb-objects'
import CkbCellCollector from './CkbCellCollector'

export default class CkbCellCache {
  #cache: Map<string, Set<CkbLiveCell>>

  constructor () {
    this.#cache = new Map()
  }

  cellCollector (indexer, lock_script) {
    // if (!this.#cellCollectors.has(lock_hash)) {
    //   this.#cellCollectors.set(lock_hash, new CkbCellCollector(this, lock_hash))
    // }
    // return this.#cellCollectors.get(lock_hash)

    const script = new CkbScript(lock_script)
    const lock_hash = script.hash
    this.clearCellsForLockHash(lock_hash)
    return new CkbCellCollector(this, indexer, lock_script)
  }

  push (cell: CkbLiveCell) {
    const lock_hash = cell.lock_hash
    if (!this.#cache.has(lock_hash)) {
      this.#cache.set(lock_hash, new Set())
    }
    this.#cache.get(lock_hash).add(cell)
  }

  pushCells (cells: Set<CkbLiveCell>) {
    cells.forEach(cell => this.push(cell))
  }

  clearCellsForLockHash (lock_hash: string) {
    this.#cache.delete(lock_hash)
  }

  updateLiveCells (lock_hash: string, cells: Array<CkbLiveCell>) {
    this.#cache.set(lock_hash, new Set(cells))
  }

  gatherCells (lock_hash: string, amount: bigint, type_hash?: string) {
    return this.gatherCellsByAccumulator(lock_hash, defaultAccumulator(amount))
  }

  gatherUdtCells (lock_hash: string, amount: bigint, udtTypeHash: string) {
    return this.gatherCellsByAccumulator<bigint>(lock_hash, udtAccumulator(amount, udtTypeHash))
  }

  gatherCellsByAccumulator<T> (
    lock_hash: string,
    accumulator: accumulator<T>,
  ) {
    const cells: Set<CkbLiveCell> = new Set()
    if (!this.#cache.has(lock_hash)) {
      throw new Error(`No cells for lock hash "${lock_hash}".`)
    }
    const liveCells = this.#cache.get(lock_hash)

    const totalCapacity = new CkbCapacity()

    let acc
    for (let cell of liveCells) {
      if (cell.status !== CkbCellStatus.Live) {
        continue
      }

      const result = accumulator.add(cell, acc)
      if (!result.accepted) {
        continue
      }

      cells.add(cell)
      totalCapacity.plus(cell.capacity)
      acc = result.acc
      if (result.done) {
        return { cells, totalCapacity, accumulation: acc }
      }
    }
    throw new Error(accumulator.error)
  }
}

type accumulator<T> = {
  error: string,
  add: (cell: CkbLiveCell, acc: T) => {
    accepted: boolean,
    done?: boolean,
    acc?: T,
  }
}

const defaultAccumulator = (target: bigint) => {
  return {
    error: `Do not have enough capacity.`,
    add: (cell: CkbLiveCell, acc: bigint = BigInt(0)) => {
      if (cell.data.size() || cell.type_hash) {
        return { accepted: false }
      }
      acc += cell.capacity.value
      const done = acc >= target
      return { accepted: true, done, acc }
    }
  } as accumulator<bigint>
}

const udtAccumulator = (target: bigint, udtTypeHash: string) => {
  return {
    error: `Do not have enough UDTs.`,
    add: (cell: CkbLiveCell, acc: bigint = BigInt(0)) => {
      if (cell.type_hash !== udtTypeHash) {
        return { accepted: false }
      }
      acc += BigInt(cell.data.toString('uint128'))
      const done = acc >= target
      return { accepted: true, done, acc }
    }
  } as accumulator<bigint>
}