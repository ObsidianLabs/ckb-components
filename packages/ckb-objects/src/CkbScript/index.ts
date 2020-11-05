import { scriptToHash, AddressPrefix } from '@nervosnetwork/ckb-sdk-utils'
import { assertToBeHexString } from '@nervosnetwork/ckb-sdk-utils/lib/validators'

import CkbArgs from './CkbArgs'
import CkbData from './CkbData'

import { BLOCK_ASSEMBLER_CODE_HASH, ANYONE_CAN_PAY_CODE_HASH } from '../lib/constants'

export default class CkbScript {
  hashType: 'data' | 'type'
  codeHash: string
  args: CkbArgs

  constructor ();
  constructor (param: string | CkbScript | CKBComponents.Script);
  constructor (hashType: string, codeHash: string, args: string | CkbData | CkbArgs);

  constructor (param?: string | CkbScript | CKBComponents.Script, param2?: string, param3?: string | CkbData | CkbArgs) {
    if (param3) {
      if (param !== 'data' && param !== 'type') {
        throw new Error(`Hash type must be 'data' or 'type'.`)
      }
      assertToBeHexString(param2)
      this.hashType = param
      this.codeHash = param2
      this.args = new CkbArgs(param3)
    } else if (typeof param === 'string') {
      this.hashType = 'type'
      this.codeHash = BLOCK_ASSEMBLER_CODE_HASH
      this.args = CkbArgs.FromAddress(param)
    } else if (!param) {
      this.hashType = 'data'
      this.codeHash = ''
      this.args = new CkbArgs()
    } else if (param instanceof CkbScript) {
      this.hashType = param.hashType
      this.codeHash = param.codeHash
      this.args = new CkbArgs(param.args)
    } else {
      assertToBeHexString(param.codeHash)
      this.hashType = param.hashType
      this.codeHash = param.codeHash
      this.args = new CkbArgs(param.args, 'hex')
    }
  }

  get isNull () {
    return !this.codeHash || this.codeHash === '0x'
  }

  get isValid () {
    if (this.hashType !== 'data' && this.hashType !== 'type') {
      return false
    }
    if (!this.codeHash) {
      return true
    }
    try {
      assertToBeHexString(this.codeHash)
    } catch (e) {
      return false
    }
    return true
  }

  get hash () {
    return !this.isNull ? scriptToHash(this.serialize()) : ''
  }

  isAddress (opts) {
    return (
      !this.isNull &&
      (
        (this.hashType === 'type' && this.codeHash === BLOCK_ASSEMBLER_CODE_HASH) ||
        (!opts?.secp256k1Only && this.hashType === 'data' && this.codeHash === ANYONE_CAN_PAY_CODE_HASH)
      ) &&
      this.args.value.length === 1 &&
      this.args.value[0].format === 'hex' &&
      this.args.value[0].size() < 200
    )
  }

  getAddress (prefix = AddressPrefix.Testnet) {
    if (this.codeHash !== BLOCK_ASSEMBLER_CODE_HASH) {
      throw new Error('The lock script is not an address')
    }
    try {
      return this.args.toAddress(prefix)
    } catch (e) {
      throw new Error('The lock script is not an address')
    }
  }

  size () {
    if (this.isNull || !this.isValid) {
      return 0
    }
    return this.args.size() + Math.ceil((this.codeHash.length - 2) / 2) + 1
  }

  serialize (): CKBComponents.Script {
    if (this.isNull || !this.isValid) {
      return null
    }
    return {
      hashType: this.hashType.toString() as CKBComponents.ScriptHashType,
      codeHash: this.codeHash as CKBComponents.Hash256,
      args: this.args.serialize() as CKBComponents.Bytes,
    }
  }
}
