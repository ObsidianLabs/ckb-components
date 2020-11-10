import {
  CkbOutputCell,
  CkbCapacity,
  CkbScript,
  CkbData,
} from '@obsidians/ckb-objects'

export default class CkbTransactionPart {
  #capacity: CkbCapacity
  readonly lock: CkbScript
  readonly type: CkbScript
  readonly data: CkbData

  readonly capacityByContents: boolean

  constructor(lock: CkbScript, capacity: number | string | bigint | CkbCapacity, data?: CkbData, type?: CkbScript) {
    this.#capacity = new CkbCapacity(capacity)
    this.lock = lock
    this.type = type || new CkbScript()
    this.data = data || new CkbData()

    this.capacityByContents = this.#capacity.isZero() && Boolean(data)
  }

  get capacity () {
    return this.capacityByContents ? this.calculateCapacity() : this.#capacity
  }

  calculateCapacity () {
    return new CkbCapacity(8 + this.lock.size() + this.type.size() + this.data.size())
  }

  get lock_hash () {
    return this.lock?.hash || ''
  }

  get type_hash () {
    return this.type?.hash || ''
  }

  hasData () {
    return !!this.data.size()
  }

  inverse () {
    this.#capacity.inverse()
    return this
  }

  get mergeable () {
    return !(this.capacityByContents || this.data)
  }

  merge (other: CkbTransactionPart) {
    this.#capacity.plus(other.capacity)
  }

  static mergeAll (parts: CkbTransactionPart[]): CkbTransactionPart[] {
    const unmergeables = []
    const mergeables = new Map<string, CkbTransactionPart>()
    parts.forEach(part => {
      if (!part.mergeable) {
        unmergeables.push(part)
        return
      }
      if (!mergeables.has(part.type_hash)) {
        mergeables.set(part.type_hash, part)
        return
      }
      mergeables.get(part.type_hash).merge(part)
    })
    return Array.from(mergeables.values()).filter(part => !part.capacity.isZero()).concat(unmergeables)
  }

  toCkbOutput () {
    return new CkbOutputCell(this.capacity, this.lock, this.type, this.data)
  }
}
