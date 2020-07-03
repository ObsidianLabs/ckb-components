import uniq from 'lodash/uniq'
import { rawTransactionToHash, serializeWitnessArgs } from '@nervosnetwork/ckb-sdk-utils'

import { CkbLiveCell, CkbOutputCell } from './CkbCell'

const depHash = {
  local: '0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708',
  'ckb-aggron': '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
  'ckb-mainnet': '0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c',
}

export default class CkbTransaction {
  network: string;

  constructor(
    readonly inputs: CkbLiveCell[],
    readonly deps: CkbLiveCell[],
    readonly outputs: CkbOutputCell[],
    network: string = 'local',
  ) {
    this.network = network;
  }

  private serializeOutputs (outputCells: CkbOutputCell[]) {
    const outputs = outputCells.map(output => output.serializeAsOutput())
    const outputsData = outputCells.map(output => output.serializeAsOutputData())
    return { outputs, outputsData }
  }

  get hash () {
    return rawTransactionToHash(this.serialize())
  }

  public serialize () {
    const { inputs, deps, outputs } = this

    const cellDeps = [{
      depType: 'depGroup',
      outPoint: { txHash: depHash[this.network], index: '0x0' },
    }].concat(deps.map(cell => cell.serializeAsDep()))

    const witnesses: Array<string | object> = inputs.map(() => '0x')
    witnesses[0] = {
      lock: '',
      inputType: '',
      outputType: ''
    }

    return {
      version: '0x0',
      cellDeps,
      headerDeps: [],
      inputs: inputs.map(input => input.serialize()),
      ...this.serializeOutputs(outputs),
      witnesses,
    } as CKBComponents.RawTransaction
  }

  public getSigners () {
    return uniq(this.inputs.map(input => input.lock.isAddress({ secp256k1Only: true }) && input.lock.getAddress()).filter(Boolean))
  }

  public async sign (witnessesSigner, tx = this.serialize()) {
    const transactionHash = rawTransactionToHash(tx)

    const signedWitnesses = await witnessesSigner({
      transactionHash,
      witnesses: tx.witnesses,
      inputCells: this.inputs.map(input => input.toCachedCell()),
      skipMissingKeys: true,
    })
    return {
      ...tx,
      witnesses: signedWitnesses.map(witness =>
        typeof witness === 'string' ? witness : serializeWitnessArgs(witness),
      ),
    }
  }
}
