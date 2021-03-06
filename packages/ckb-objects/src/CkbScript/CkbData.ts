import { utils } from '@ckb-lumos/base'

import { hex2Blake2b, toHex, fromHex } from '../lib'
import FileReaderInterface, { FileData } from './FileReader'

export type ckbDataFormat = 'file' | 'utf8' | 'hex' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256'

export default class CkbData {
  static fileReader : FileReaderInterface

  readonly format: ckbDataFormat
  #value?: string
  #file?: FileData
  #size: number
  #hash: string

  constructor (value?: string | number | bigint, format: ckbDataFormat = 'utf8') {
    if (typeof value === 'undefined') {
      this.format = 'utf8'
      this.#value = ''
    } else if (format === 'file') {
      this.format = 'file'
      if (!CkbData.fileReader) {
        throw new Error('CkbData.fileReader is not specified')
      }
      this.#file = CkbData.fileReader.open(value.toString())
    } else if (format === 'utf8') {
      this.format = 'utf8'
      this.#value = value.toString()
    } else if (format === 'hex') {
      if (value.toString() !== '0x') {
        utils.assertHexadecimal(`CkbData(..., 'hex')`, value.toString())
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

  display (length = 1000, format?: ckbDataFormat) {
    let value = this.value
    if (format) {
      value = this.toString(format)
    }
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
