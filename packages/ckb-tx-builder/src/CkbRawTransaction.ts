import uniq from 'lodash/uniq'

import {
  CkbTransaction,
  CkbLiveCell,
  CkbCapacity,
  CkbScript,
  CkbData,
  SIMPLE_UDT_CODE_HASH,
} from '@obsidians/ckb-objects'

import CkbCellCache from './CkbCellCache'
import CkbTransactionPart from './CkbTransactionPart'

export default class CkbRawTransaction {
  #fee: CkbCapacity
  #txParts:  Map<string, CkbTransactionPart[]>
  #inputs: Set<CkbLiveCell>
  #deps: Map<string, CkbLiveCell>

  constructor(private cellCache: CkbCellCache) {
    this.#fee = new CkbCapacity(0.001)
    this.#txParts = new Map()
    this.#inputs = new Set()
    this.#deps = new Map()
  }

  public fee (fee : number | string | bigint | CkbCapacity) : CkbRawTransaction {
    this.#fee = new CkbCapacity(fee)
    return this
  }

  public from (from: string | CkbScript, amount: number | string | bigint | CkbCapacity) : CkbRawTransaction {
    const lock = new CkbScript(from)
    
    if (!this.#txParts.has(lock.hash)) {
      this.#txParts.set(lock.hash, [])
    }
    const txPart = new CkbTransactionPart(lock, amount)
    txPart.inverse()
    this.#txParts.get(lock.hash).push(txPart)
    return this
  }

  public to (to: string | CkbScript, amount: number | string | bigint | CkbCapacity, data?: CkbData, type?: CkbScript) : CkbRawTransaction {
    const lock = new CkbScript(to)

    if (!this.#txParts.has(lock.hash)) {
      this.#txParts.set(lock.hash, [])
    }
    this.#txParts.get(lock.hash).push(new CkbTransactionPart(lock, amount, data, type))
    return this
  }

  public transfer (from: string | CkbScript, to: string | CkbScript, amount: number | string | bigint | CkbCapacity, data?: CkbData, type?: CkbScript) {
    return this.from(from, amount).to(to, amount, data, type)
  }

  public transferUdt(from: string | CkbScript, to: string | CkbScript, amount: bigint, udt: string) {
    const fromLockScript = new CkbScript(from)
    const toLockScript = new CkbScript(to)
    const udtScript = new CkbScript(
      'data',
      SIMPLE_UDT_CODE_HASH,
      new CkbData(udt, 'hex')
    )

    const {
      cells,
      totalCapacity,
      accumulation,
    } = this.cellCache.gatherUdtCells(fromLockScript.hash, amount, udtScript.hash)

    cells.forEach(this.#inputs.add, this.#inputs)
    const returns = accumulation - amount

    this.to(toLockScript, 142, new CkbData(amount.toString(), 'uint128'), udtScript)
    if (returns) {
      this.to(fromLockScript, 142, new CkbData(returns.toString(), 'uint128'), udtScript)
    }
    const delta = new CkbCapacity(returns ? 284 : 142).minus(totalCapacity)
    if (delta.value > BigInt(0)) {
      this.from(fromLockScript, delta)
    } else if (delta.value === BigInt(0)) {
      this.from(fromLockScript, this.#fee)
    } else {
      this.to(fromLockScript, BigInt(0) - delta.value - this.#fee.value)
    }
    return this
  }

  public toWithFile (address: string, filePath: string, capacity?: number | string | bigint | CkbCapacity) : CkbRawTransaction {
    return this.to(address, capacity, new CkbData(filePath, 'file'))
  }

  public toWithData (address: string, data: CkbData, capacity?: number | string | bigint | CkbCapacity) : CkbRawTransaction {
    return this.to(address, capacity, data)
  }

  public toWithHexData (address: string, hex: string, capacity?: number | string | bigint | CkbCapacity) : CkbRawTransaction {
    return this.to(address, capacity, new CkbData(hex, 'hex'))
  }

  public provideDep (hash: string, cell: CkbLiveCell) {
    this.#deps.set(hash, cell)
  }

  private mergeParts () {
    Array.from(this.#txParts.keys()).forEach(lock_hash => {
      this.#txParts.set(lock_hash, CkbTransactionPart.mergeAll(this.#txParts.get(lock_hash)))
    })
  }

  public estimate () {
    const inCapacity = new CkbCapacity()
    const outCapacity = new CkbCapacity()
    this.#txParts.forEach(parts => parts.forEach(part => {
      if (part.capacity.value > 0) {
        outCapacity.plus(part.capacity)
      } else if (part.capacity.value < 0) {
        inCapacity.minus(part.capacity)
      }
    }))
    this.#inputs.forEach(cell => inCapacity.plus(cell.capacity))

    return {
      in: inCapacity,
      out: outCapacity,
      delta: new CkbCapacity(inCapacity.value - outCapacity.value),
    }
  }

  private separate () {
    const inputs: CkbTransactionPart[] = []
    const outputs: CkbTransactionPart[] = []
    this.#txParts.forEach(parts => parts.forEach(part => {
      if (part.capacity.value > 0) {
        outputs.push(part)
      } else if (part.capacity.value < 0) {
        inputs.push(part)
      }
    }))
    return { inputs, outputs }
  }
  
  private overpay () {
    const estimate = this.estimate()
    const fee = this.#fee.value
    let overpay = fee - estimate.delta.value
    return overpay > BigInt(0) ? overpay : BigInt(0)
  }

  private gatherInputCells (inputs: CkbTransactionPart[]) {
    const overpay = this.overpay()

    let gatheredCells: Set<CkbLiveCell> = new Set()
    const outputsFromReturns: CkbTransactionPart[] = []
    inputs.forEach((inputPart, index) => {
      let amount = BigInt(0) - inputPart.capacity.value // inputPart capacity is negative
      if (!index) {
        amount += BigInt(overpay) // first input pays the fee
      }
      const {
        cells,
        totalCapacity,
      } = this.cellCache.gatherCells(inputPart.lock_hash, amount, inputPart.type_hash)
      const returns = totalCapacity.value - amount

      cells.forEach(gatheredCells.add, gatheredCells)
      if (returns > BigInt(0)) {
        outputsFromReturns.push(new CkbTransactionPart(inputPart.lock, returns))
      }
    })
    return {
      gatheredCells,
      outputsFromReturns,
    }
  }

  private prepare () {
    this.mergeParts()

    if (this.estimate().in.isZero()) {
      throw new Error('Total input bytes is zero.')
    }

    if (this.estimate().delta.value < BigInt(0)) {
      throw new Error('Total input bytes does not cover total output bytes.')
    }

    const { inputs, outputs } = this.separate()
    const { gatheredCells, outputsFromReturns } = this.gatherInputCells(inputs)

    return {
      inputs: [...gatheredCells, ...this.#inputs],
      outputs: outputs.concat(outputsFromReturns),
    }
  }

  public generate () {
    const { inputs, outputs } = this.prepare()
    const inputDeps = inputs.map(cell => [cell.lock.code_hash, cell.type.code_hash])
    const outputDeps = outputs.map(cell => [cell.lock.code_hash, cell.type.code_hash])
    const depHashes = uniq([...inputDeps, ...outputDeps].flat().filter(Boolean)) as string[]
    const deps = depHashes.map(hash => this.#deps.get(hash)).filter(Boolean)
    return new CkbTransaction(inputs, deps, outputs.map(output => output.toCkbOutput()))
  }

  public toString () {
    const tx = this.generate()
    return JSON.stringify(tx.serialize())
  }
}
