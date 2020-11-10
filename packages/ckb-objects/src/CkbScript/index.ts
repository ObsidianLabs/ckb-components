import { utils, Hash, HashType, Script } from '@ckb-lumos/base'

import CkbArgs from './CkbArgs'
import CkbData from './CkbData'

import { BLOCK_ASSEMBLER_CODE_HASH, ANYONE_CAN_PAY_CODE_HASH } from '../lib/constants'

export default class CkbScript {
  hash_type: HashType
  code_hash: Hash
  args: CkbArgs

  constructor ();
  constructor (param: string | CkbScript | Script);
  constructor (hash_type: HashType, code_hash: Hash, args: string | CkbData | CkbArgs);

  constructor (param?: string | CkbScript | Script, param2?: Hash, param3?: string | CkbData | CkbArgs) {
    if (param3) {
      if (param !== 'data' && param !== 'type') {
        throw new Error(`Hash type must be 'data' or 'type'.`)
      }
      utils.assertHexString('script.code_hash', param2)
      this.hash_type = param
      this.code_hash = param2
      this.args = new CkbArgs(param3)
    } else if (typeof param === 'string') {
      this.hash_type = 'type'
      this.code_hash = BLOCK_ASSEMBLER_CODE_HASH
      this.args = CkbArgs.FromAddress(param)
    } else if (!param) {
      this.hash_type = 'data'
      this.code_hash = ''
      this.args = new CkbArgs()
    } else if (param instanceof CkbScript) {
      this.hash_type = param.hash_type
      this.code_hash = param.code_hash
      this.args = new CkbArgs(param.args)
    } else {
      utils.assertHexString('script.code_hash', param.code_hash)
      this.hash_type = param.hash_type
      this.code_hash = param.code_hash
      this.args = new CkbArgs(param.args, 'hex')
    }
  }

  get isNull () {
    return !this.code_hash || this.code_hash === '0x'
  }

  get isValid () {
    if (this.hash_type !== 'data' && this.hash_type !== 'type') {
      return false
    }
    if (!this.code_hash) {
      return true
    }
    try {
      utils.assertHexString('script.code_hash', this.code_hash)
    } catch (e) {
      return false
    }
    return true
  }

  get hash () {
    return !this.isNull ? utils.computeScriptHash(this.serialize()) : ''
  }

  isAddress (opts) {
    return (
      !this.isNull &&
      (
        (this.hash_type === 'type' && this.code_hash === BLOCK_ASSEMBLER_CODE_HASH) ||
        (!opts?.secp256k1Only && this.hash_type === 'data' && this.code_hash === ANYONE_CAN_PAY_CODE_HASH)
      ) &&
      this.args.value.length === 1 &&
      this.args.value[0].format === 'hex' &&
      this.args.value[0].size() < 200
    )
  }

  getAddress (prefix = 'ckt') {
    if (this.code_hash !== BLOCK_ASSEMBLER_CODE_HASH) {
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
    return this.args.size() + Math.ceil((this.code_hash.length - 2) / 2) + 1
  }

  serialize () {
    if (this.isNull || !this.isValid) {
      return null
    }
    return {
      code_hash: this.code_hash,
      hash_type: this.hash_type,
      args: this.args.serialize(),
    } as Script
  }

  serialize2 () {
    if (this.isNull || !this.isValid) {
      return null
    }
    return {
      codeHash: this.code_hash,
      hashType: this.hash_type,
      args: this.args.serialize(),
    }
  }
}
