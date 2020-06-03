import CkbCapacity from './CkbCapacity'
import { CkbLiveCell, CkbCell } from './CkbCell'

export default class CkbCellCollection {
  #collections: Map<string, CkbLiveCell[]>

  constructor () {
    this.#collections = new Map()
  }

  push (cell: CkbLiveCell) {
    const lockHash = cell.lockHash
    if (!this.#collections.has(lockHash)) {
      this.#collections.set(lockHash, [])
    }
    this.#collections.get(lockHash).push(cell)
  }

  clearCellsForLockHash (lockHash: string) {
    this.#collections.delete(lockHash)
  }

  updateLiveCells (lockHash: string, cells: Array<CkbCell>) {
    this.#collections.set(lockHash, cells.map(cell => new CkbLiveCell(cell)))
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
    const cells: CkbLiveCell[] = []
    if (!this.#collections.has(lockHash)) {
      throw new Error(`No cells for lock hash "${lockHash}".`)
    }
    const liveCells = [...this.#collections.get(lockHash)]

    const totalCapacity = new CkbCapacity()
    let acc

    while (true) {
      const cell = liveCells.shift()
      const result = accumulator(cell, acc)
      if (!result.accepted) {
        continue
      }
      cells.push(cell)
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