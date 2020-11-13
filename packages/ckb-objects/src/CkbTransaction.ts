import uniq from 'lodash/uniq'
import { core, values, RawTransaction, CellDep } from '@ckb-lumos/base'
import { Reader } from 'ckb-js-toolkit'
import { serializeWitnessArgs } from '@nervosnetwork/ckb-sdk-utils'

import { CkbLiveCell, CkbOutputCell } from './CkbCell'
import signWitnesses, { SignatureProvider } from './sign/signWitnesses'
import { StructuredWitness } from './sign/signWitnessGroup'

const depHash = {
  ckb_dev: '0xace5ea83c478bb866edf122ff862085789158f5cbff155b7bb5f13058555b708',
  ckb_testnet: '0xf8de3bb47d055cdf460d93a2a6e1b05f7432f9777c8c474abf4eec1d4aee5d37',
  ckb: '0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c',
}

export default class CkbTransaction {
  chain: string;

  constructor(
    readonly inputs: CkbLiveCell[],
    readonly deps: CkbLiveCell[],
    readonly outputs: CkbOutputCell[],
    chain: string = 'ckb_dev',
  ) {
    this.chain = chain;
  }

  private serializeOutputs (outputCells: CkbOutputCell[]) {
    const outputs = outputCells.map(output => output.serializeAsOutput())
    const outputs_data = outputCells.map(output => output.serializeAsOutputData())
    return { outputs, outputs_data }
  }

  hash (tx = this.serialize()) {
    const value = new values.RawTransactionValue(tx)
    return value.hash()
  }

  public serialize () {
    const { inputs, deps, outputs } = this

    const cell_deps = [{
      dep_type: 'dep_group',
      out_point: { tx_hash: depHash[this.chain] || depHash.ckb_dev, index: '0x0' },
    }].concat(deps.map(cell => cell.serializeAsDep())) as CellDep[]

    return {
      version: '0x0',
      cell_deps,
      header_deps: [],
      inputs: inputs.map(input => input.serialize()),
      ...this.serializeOutputs(outputs),
    } as RawTransaction
  }

  public getSigners () {
    return this.inputs.map(input => input.lock.isAddress({ secp256k1Only: true }) && input.lock.getAddress())
  }

  public getUniqueSigners () {
    return uniq(this.getSigners().filter(Boolean))
  }

  public async sign (signatureProvider: SignatureProvider, tx = this.serialize()) {
    const transactionHash = this.hash(tx)

    const witnesses: StructuredWitness[] = tx.inputs.map(() => '0x')
    this.getSigners().forEach((address, i) => {
      if (address) {
        witnesses[i] = {
          lock: '',
          inputType: '',
          outputType: '',
        }
      }
    })

    const signer = signWitnesses(signatureProvider)

    const signedWitnesses = await signer({
      transactionHash,
      witnesses,
      inputCells: this.inputs.map(input => input.toCachedCell()),
      skipMissingKeys: true,
    })

    return {
      ...tx,
      witnesses: signedWitnesses.map(witness =>
        typeof witness === 'string' ? witness : serializeWitnessArgs(witness)
      ),
    }
  }

  updateInputsCellStatus (status) {
    this.inputs.forEach(input => input.setStatus(status))
  }
}

// new Reader(core.SerializeWitnessArgs(witness)).serializeJson()