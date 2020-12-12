import { OutPoint, Hash, HexString, Script, CellDep, Input, Output } from '@ckb-lumos/base'

import CkbCapacity from './CkbCapacity'
import CkbScript from './CkbScript'
import CkbData from './CkbScript/CkbData'
import ckbEvents from './CkbEvents'

import { BLOCK_ASSEMBLER_CODE_HASH, SIMPLE_UDT_CODE_HASH, ANYONE_CAN_PAY_CODE_HASH } from './lib/constants'

export interface CkbCell {
  out_point: OutPoint,
  cellbase: boolean,
  block_hash: Hash,
  block_number: HexString,
  capacity: HexString,
  lock: Script,
  type?: Script,
  data: HexString,
}

export enum CkbCellStatus {
  Live = 'live',
  Pending = 'pending',
  Used = 'used',
}

export class CkbLiveCell {
  #status: CkbCellStatus
  readonly out_point: OutPoint
  readonly cellbase: boolean
  readonly block_hash: string
  readonly block_number: string
  readonly capacity: CkbCapacity
  readonly lock: CkbScript
  readonly type: CkbScript
  readonly data: CkbData

  constructor (cell: CkbCell) {
    this.#status = CkbCellStatus.Live
    
    this.out_point = cell.out_point
    this.cellbase = cell.cellbase
    this.block_hash = cell.block_hash
    this.block_number = cell.block_number
    this.capacity = new CkbCapacity(cell.capacity)

    this.lock = new CkbScript(cell.lock)
    this.type = new CkbScript(cell.type)
    this.data = new CkbData(cell.data, 'hex')
  }

  get id () {
    return`${parseInt(this.out_point.index, 16)}@${this.out_point.tx_hash.slice(2)}`
  }
  
  get lock_hash () {
    return this.lock.hash
  }

  get type_hash () {
    return this.type.hash
  }

  get data_hash () {
    return this.data.hash
  }

  get data_len () {
    return this.data.size()
  }

  isEmpty () {
    return !this.data.size() && !this.type.size() && this.lock.code_hash === BLOCK_ASSEMBLER_CODE_HASH
  }

  containsUdt () {
    return this.type.code_hash === SIMPLE_UDT_CODE_HASH.PROD || this.type.code_hash === SIMPLE_UDT_CODE_HASH.DEV
  }

  udt () {
    if (!this.data.size() || !this.containsUdt()) {
      return null
    }
    let value
    try {
      value = BigInt(this.data.toString('uint128'))
    } catch {
      value = BigInt(0)
    }
    const issuer = this.type.args.serialize()
    return { value, issuer }
  }

  anyoneCanPay () {
    return this.lock.code_hash === ANYONE_CAN_PAY_CODE_HASH
  }
  
  serialize () {
    return {
      since: '0x0',
      previous_output: this.out_point,
    } as Input
  }

  serializeAsDep () {
    return {
      dep_type: 'code',
      out_point: this.out_point,
    } as CellDep
  }

  toCachedCell () {
    return {
      // blockHash: this.block_hash,
      // cellbase: this.cellbase,
      // outPoint: {
      //   index: this.out_point.index,
      //   txHash: this.out_point.tx_hash,
      // },
      // status: 'live',
      // capacity: this.capacity.serialize(),
      lock: this.lock.serialize2() as CKBComponents.Script,
      // type: this.type.serialize2(),
      // dataHash: this.data.hash,
      // outputDataLen: this.data.size(),
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
    } as Output
  }

  serializeAsOutputData () {
    return this.data.serialize() as HexString
  }
}