import { CkbCapacity, CkbLiveCell, CkbCellStatus, CkbScript } from '@obsidians/ckb-objects'
import CkbCellCollector from './CkbCellCollector'

export default class CkbCellCache {
  #cellCollectors: Map<string, CkbCellCollector>
  #cache: Map<string, Set<CkbLiveCell>>

  constructor () {
    this.#cellCollectors = new Map()
    this.#cache = new Map()
  }

  cellCollector (indexer, lock) {
    // if (!this.#cellCollectors.has(lockHash)) {
    //   this.#cellCollectors.set(lockHash, new CkbCellCollector(this, lockHash))
    // }
    // return this.#cellCollectors.get(lockHash)

    const script = new CkbScript({ hashType: lock.hash_type, codeHash: lock.code_hash, args: lock.args })
    const lockHash = script.hash
    this.clearCellsForLockHash(lockHash)
    return new CkbCellCollector(this, indexer, lock)
  }

  push (cell: CkbLiveCell) {
    const lockHash = cell.lockHash
    if (!this.#cache.has(lockHash)) {
      this.#cache.set(lockHash, new Set())
    }
    this.#cache.get(lockHash).add(cell)
  }

  pushCells (cells: Set<CkbLiveCell>) {
    cells.forEach(cell => this.push(cell))
  }

  clearCellsForLockHash (lockHash: string) {
    this.#cache.delete(lockHash)
  }

  updateLiveCells (lockHash: string, cells: Array<CkbLiveCell>) {
    this.#cache.set(lockHash, new Set(cells))
  }

  gatherCells (lockHash: string, amount: bigint, typeHash?: string) {
    return this.gatherCellsByAccumulator(lockHash, defaultAccumulator(amount))
  }

  gatherUdtCells (lockHash: string, amount: bigint, udtTypeHash: string) {
    return this.gatherCellsByAccumulator<bigint>(lockHash, udtAccumulator(amount, udtTypeHash))
  }

  gatherCellsByAccumulator<T> (
    lockHash: string,
    accumulator: accumulator<T>,
  ) {
    const cells: Set<CkbLiveCell> = new Set()
    if (!this.#cache.has(lockHash)) {
      throw new Error(`No cells for lock hash "${lockHash}".`)
    }
    const liveCells = this.#cache.get(lockHash)

    const totalCapacity = new CkbCapacity()

    let acc
    for (let cell of liveCells) {
      if (cell.status !== CkbCellStatus.Live) {
        continue
      }

      const result = accumulator(cell, acc)
      if (!result.accepted) {
        continue
      }

      cells.add(cell)
      totalCapacity.plus(cell.capacity)
      acc = result.acc
      if (result.done) {
        break
      }
    }
    return { cells, totalCapacity, accumulation: acc }
  }
}

type accumulator<T> = (cell: CkbLiveCell, acc: T) => {
  accepted: boolean,
  done?: boolean,
  acc?: T,
}

const defaultAccumulator = (target: bigint): accumulator<bigint> => {
  return (cell: CkbLiveCell, acc: bigint = BigInt(0)) => {
    if (!cell) {
      throw new Error(`Do not have enough capacity.`)
    }

    if (cell.data.size() || cell.typeHash) {
      return { accepted: false }
    }
    acc += cell.capacity.value
    const done = acc >= target
    return { accepted: true, done, acc }
  }
}

const udtAccumulator = (target: bigint, udtTypeHash: string): accumulator<bigint> => {
  return (cell: CkbLiveCell, acc: bigint = BigInt(0)) => {
    if (!cell) {
      throw new Error(`Do not have enough UDTs.`)
    }

    if (cell.typeHash !== udtTypeHash) {
      return { accepted: false }
    }
    acc += BigInt(cell.data.toString('uint128'))
    const done = acc >= target
    return { accepted: true, done, acc }
  }
}