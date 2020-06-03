import { assertToBeHexString } from '@nervosnetwork/ckb-sdk-utils/lib/validators'

import { hex2Blake2b, toHex, fromHex } from './lib'
import FileReader, { LocalFile } from './FileReader'

export type ckbDataFormat = 'file' | 'utf8' | 'hex' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256'

let fileReader: FileReader
export const setFs = fs => {
  fileReader = new FileReader(fs)
}

export default class CkbData {
  readonly format: ckbDataFormat
  #value?: string
  #file?: LocalFile
  #size: number
  #hash: string

  constructor (value?: string | number | bigint, format: ckbDataFormat = 'utf8') {
    if (typeof value === 'undefined') {
      this.format = 'utf8'
      this.#value = ''
    } else if (format === 'file') {
      this.format = 'file'
      this.#file = fileReader.open(value.toString())
    } else if (format === 'utf8') {
      this.format = 'utf8'
      this.#value = value.toString()
    } else if (format === 'hex') {
      if (value.toString() !== '0x') {
        assertToBeHexString(value.toString())
      }
      this.format = 'hex'
      this.#value = value.toString()
    } else if (format.startsWith('uint')) {
      toHex(value.toString(), format)
      this.format = format
      this.#value = value.toString()
    }
  }

  get value () {
    if (this.#file) {
      return this.#file.filePath
    }
    return this.#value
  }

  size () {
    if (!this.#size) {
      if (this.#file) {
        this.#size = this.#file.getSize()
      } else {
        this.#size = Math.ceil((this.serialize().length - 2) / 2)
      }
    }
    return this.#size
  }

  get hash () {
    if (!this.#hash) {
      const hex = this.serialize()
      this.#hash = hex !== '0x' ? hex2Blake2b(hex) : ''
    }
    return this.#hash
  }

  toString (format?: ckbDataFormat) {
    if (!format) {
      return `[CkbData ${this.format}:${this.value}]`
    }
    return fromHex(this.serialize(), format)
  }

  display (length = 1000) {
    let value = this.value
    if (value.length > length) {
      value = value.slice(0, length) + '...'
    }
    return value
  }

  serialize () {
    if (this.#file) {
      if (!this.#value) {
        this.#value = `0x${this.#file.getValue('hex')}`
      }
      return this.#value
    }
    return toHex(this.#value, this.format)
  }
}
