import * as ckbUtils from '@nervosnetwork/ckb-sdk-utils'
import ECPair from '@nervosnetwork/ckb-sdk-utils/lib/ecpair'

export const BLOCK_ASSEMBLER_CODE_HASH = '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8'

export default class CkbKeypair {
  constructor(privateKey, address, name) {
    this.name = name
    if (privateKey) {
      this._privateKey = privateKey
    } else if (address.startsWith('ckt')) {
      this._testnetAddress = address
      const parsed = ckbUtils.parseAddress(address, 'hex')
      this._publicKeyHash = '0x' + parsed.slice(6)
    } else if (address.startsWith('ckb')) {
      this._mainnetAddress = address
      const parsed = ckbUtils.parseAddress(address, 'hex')
      this._publicKeyHash = '0x' + parsed.slice(6)
    } else {
      throw new Error(`Invalid address: ${address}`)
    }
  }

  static fromPrivateKey (privateKey) {
    return new CkbKeypair(privateKey)
  }

  static fromAddress (address, name) {
    return new CkbKeypair(null, address, name)
  }

  static addressToPublicKeyHash (address) {
    const ckbKeypair = CkbKeypair.fromAddress(address)
    return ckbKeypair.publicKeyHash
  }

  static publicKeyHashToAddress (publicKeyHash, prefix = 'ckt') {
    if (/^0x[0-9A-Fa-f]+$/.test(publicKeyHash)) {
      try {
        return ckbUtils.bech32Address(publicKeyHash, { prefix })
      } catch (e) {
        return false
      }
    }
    return false
  }

  get publicKey () {
    if (!this._publicKey) {
      if (!this._privateKey) {
        throw new Error('No private key or public key given')
      }
      this._publicKey = ckbUtils.privateKeyToPublicKey(this._privateKey)
    }
    return this._publicKey
  }

  get publicKeyHash () {
    if (!this._publicKeyHash) {
      this._publicKeyHash = `0x${ckbUtils.blake160(this.publicKey, 'hex')}`
    }
    return this._publicKeyHash
  }

  get mainnetAddress () {
    if (!this._mainnetAddress) {
      this._mainnetAddress = ckbUtils.pubkeyToAddress(this.publicKey, { prefix: 'ckb' })
    }
    return this._mainnetAddress
  }

  get testnetAddress () {
    if (!this._testnetAddress) {
      this._testnetAddress = ckbUtils.pubkeyToAddress(this.publicKey, { prefix: 'ckt' })
    }
    return this._testnetAddress
  }

  get lock_script () {
    if (!this._lock_script) {
      /**
       * calculate the lockHash by the address publicKeyHash
       * 1. the publicKeyHash of the address is required in the args field of lock script
       * 2. compose the lock script with the code hash(as a miner, we use BLOCK_ASSEMBLER_CODE_HASH here), and args
       * 3. calculate the hash of lock script via core.ckbUtils.scriptToHash method
       */
      this._lock_script = {
        hash_type: 'type',
        code_hash: BLOCK_ASSEMBLER_CODE_HASH,
        args: this.publicKeyHash,
      }
    }
    return this._lock_script
  }

  get address () {
    return this.testnetAddress || ''
  }

  get secret () {
    return this._privateKey || ''
  }

  get lock_hash () {
    if (!this._lock_hash) {
      this._lock_hash = ckbUtils.scriptToHash(this.lock_script)
    }
    return this._lock_hash
  }

  sign (message) {
    if (!this._privateKey) {
      throw new Error('No private key')
    }
    const keyPair = new ECPair(this._privateKey)
    return keyPair.signRecoverable(message)
  }
}