import CkbCapacity from './CkbCapacity'
import CkbScript from './CkbScript'
import CkbData from './CkbScript/CkbData'
import ckbEvents from './CkbEvents'

import { BLOCK_ASSEMBLER_CODE_HASH, SIMPLE_UDT_CODE_HASH, ANYONE_CAN_PAY_CODE_HASH } from './lib/constants'

export interface CkbCell {
  outPoint: CKBComponents.OutPoint,
  cellbase: boolean,
  blockHash: CKBComponents.Hash256,
  blockNumber: CKBComponents.BlockNumber,
  capacity: CKBComponents.Capacity,
  lock: CKBComponents.Script,
  type?: CKBComponents.Script | null,
  data: CKBComponents.Bytes,
}

export enum CkbCellStatus {
  Live = 'live',
  Pending = 'pending',
  Used = 'used',
}

export class CkbLiveCell {
  #status: CkbCellStatus
  readonly outPoint: CKBComponents.OutPoint
  readonly cellbase: boolean
  readonly blockHash: string
  readonly blockNumber: string
  readonly capacity: CkbCapacity
  readonly lock: CkbScript
  readonly type: CkbScript
  readonly data: CkbData

  constructor (cell: CkbCell) {
    this.#status = CkbCellStatus.Live
    
    this.outPoint = cell.outPoint
    this.cellbase = cell.cellbase
    this.blockHash = cell.blockHash
    this.blockNumber = cell.blockNumber
    this.capacity = new CkbCapacity(cell.capacity)

    this.lock = new CkbScript(cell.lock)
    this.type = new CkbScript(cell.type)
    this.data = new CkbData(cell.data, 'hex')
  }

  get id () {
    return`${parseInt(this.outPoint.index, 16)}@${this.outPoint.txHash.slice(2)}`
  }
  
  get lockHash () {
    return this.lock.hash
  }

  get typeHash () {
    return this.type.hash
  }

  get dataHash () {
    return this.data.hash
  }

  get dataLen () {
    return this.data.size()
  }

  isEmpty () {
    return !this.data.size() && !this.type.size() && this.lock.codeHash === BLOCK_ASSEMBLER_CODE_HASH
  }

  containsUdt () {
    return this.type.codeHash === SIMPLE_UDT_CODE_HASH
  }

  udt () {
    if (!this.data.size() || this.type.codeHash !== SIMPLE_UDT_CODE_HASH) {
      return null
    }
    const value = BigInt(this.data.toString('uint128'))
    const issuer = this.type.args.serialize()
    return { value, issuer }
  }

  anyoneCanPay () {
    return this.lock.codeHash === ANYONE_CAN_PAY_CODE_HASH
  }
  
  serialize () {
    return {
      since: '0x0',
      previousOutput: this.outPoint,
    }
  }

  serializeAsDep () {
    return {
      depType: 'code',
      outPoint: this.outPoint,
    }
  }

  toCachedCell () {
    return {
      blockHash: this.blockHash,
      cellbase: this.cellbase,
      outPoint: this.outPoint,
      status: 'live',
      capacity: this.capacity.serialize(),
      lock: this.lock.serialize(),
      type: this.type.serialize(),
      dataHash: this.data.hash,
      outputDataLen: this.data.size(),
    }
  }

  get status () {
    return this.#status
  }

  setStatus (status: string) {
    ckbEvents.trigger(`cell:status:${this.id}`, status)
    if (status === 'live') {
      this.#status = CkbCellStatus.Live
    } else if (status === 'pending') {
      this.#status = CkbCellStatus.Pending
    } else if (status === 'used') {
      this.#status = CkbCellStatus.Used
    }
  }

  onStatus (callback: Function) {
    ckbEvents.on(`cell:status:${this.id}`, callback)
  }
}


export class CkbOutputCell {
  constructor (
    public capacity: CkbCapacity,
    public lock: CkbScript = new CkbScript(),
    public type: CkbScript = new CkbScript(),
    public data: CkbData = new CkbData()
  ) {}

  size () {
    return 8 + this.lock.size() + this.type.size() + this.data.size()
  }

  serializeAsOutput () {
    return {
      capacity: this.capacity.serialize(),
      lock: this.lock.serialize(),
      type: this.type.serialize(),
    }
  }

  serializeAsOutputData () {
    return this.data.serialize()
  }
}