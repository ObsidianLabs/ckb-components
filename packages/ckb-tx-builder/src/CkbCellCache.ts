import { CkbCapacity, CkbLiveCell, CkbCellStatus, CkbScript } from '@obsidians/ckb-objects'
import CkbCellCollector from './CkbCellCollector'

export default class CkbCellCache {
  #indexer
  #cellCollectors: Map<string, CkbCellCollector>

  constructor (indexer) {
    this.#indexer = indexer
    this.#cellCollectors = new Map()
  }

  cellCollector (lock_script) {
    const script = new CkbScript(lock_script)
    const lock_hash = script.hash

    if (!this.#cellCollectors.has(lock_hash)) {
      this.#cellCollectors.set(lock_hash, new CkbCellCollector(this.#indexer, lock_script))
    }
    const collector = this.#cellCollectors.get(lock_hash)
    collector.clear()
    return collector
  }

  async gatherCells (lock_script: CkbScript, amount: bigint, type_hash?: string) {
    return this.gatherCellsByAccumulator(lock_script, defaultAccumulator(amount))
  }

  async gatherUdtCells (lock_script: CkbScript, amount: bigint, udtTypeHash: string) {
    return this.gatherCellsByAccumulator<bigint>(lock_script, udtAccumulator(amount, udtTypeHash))
  }

  async gatherCellsByAccumulator<T> (
    lock_script: CkbScript,
    accumulator: accumulator<T>,
  ) {
    const lock_hash = lock_script.hash
    if (!this.#cellCollectors.has(lock_hash)) {
      this.#cellCollectors.set(lock_hash, new CkbCellCollector(this.#indexer, lock_script.serialize()))
    }
    const collector = this.#cellCollectors.get(lock_hash)

    const totalCapacity = new CkbCapacity()
    const cells: Set<CkbLiveCell> = new Set()
    let acc
    for await (const cell of collector.asyncCellIterator()) {
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