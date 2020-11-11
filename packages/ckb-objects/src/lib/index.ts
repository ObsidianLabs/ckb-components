import { Reader } from 'ckb-js-toolkit'
import { utils } from '@ckb-lumos/base'

export const hex2Blake2b = hex => {
  const buffer = new Reader(hex).toArrayBuffer()
  return utils.ckbHash(buffer).serializeJson()
}

export const uintNumberToHex = (value, byteLength) => {
  if (!value) {
    throw new Error('No number.')
  }
  let bigintValue
  try {
    bigintValue = BigInt(value)
  } catch (e) {
    throw new Error(`Cannot convert '${value}' to an integer.`)
  }
  if (bigintValue < BigInt(0)) {
    throw new Error(`No negative numbers.`)
  }
  let hex = bigintValue.toString(16)
  if (hex.length <= byteLength * 2) {
    hex = '0'.repeat(byteLength * 2 - hex.length) + hex
  } else {
    throw new Error(`Number too large.`)
  }
  let littleEndianHex = ''
  for (let i = byteLength - 1; i >= 0; i--) {
    littleEndianHex = littleEndianHex + hex.substr(i * 2, 2)
  }
  return `0x${littleEndianHex}`
}

export const hexToUintNumber = hex => {
  if (hex.length % 2 > 0) {
    hex = hex + '0'
  }
  const buffer = new Reader(hex).toArrayBuffer()
  const bytes = new Uint8Array(buffer)
  const byteLength = bytes.length

  if (byteLength !== 32 && byteLength !== 16 && byteLength !== 8 && byteLength !== 4 && byteLength !== 2 && byteLength !== 1) {
    throw new Error(`The input should be in the format of either 'uint8', 'uint16', 'uint32', 'uint64', 'uint128' or 'uint256'.`)
  }

  bytes.reverse()
  return BigInt(new Reader(bytes.buffer).serializeJson()).toString()
}

export const hexToUtf8 = (hex: string): string => {
  if (hex.length % 2 > 0) {
    hex = hex + '0'
  }
  const buffer = new Reader(hex).toArrayBuffer()
  return new TextDecoder().decode(buffer)
}

export const utf8ToHex = (utf8: string): string => {
  return Reader.fromRawString(utf8).serializeJson()
}

export const toHex = (value, format): string => {
  if (format === 'hex') {
    return value.toString()
  } else if (format === 'utf8') {
    return utf8ToHex(value)
  } else if (format === 'uint256') {
    return uintNumberToHex(value, 32)
  } else if (format === 'uint128') {
    return uintNumberToHex(value, 16)
  } else if (format === 'uint64') {
    return uintNumberToHex(value, 8)
  } else if (format === 'uint32') {
    return uintNumberToHex(value, 4)
  } else if (format === 'uint16') {
    return uintNumberToHex(value, 2)
  } else if (format === 'uint8') {
    return uintNumberToHex(value, 1)
  }
}

export const fromHex = (value, format) => {
  if (format === 'hex') {
    return value
  } else if (format === 'utf8') {
    return hexToUtf8(value)
  } else if (format.startsWith('uint')) {
    return hexToUintNumber(value)
  }
}

export const isHexString = value => {
  try {
    utils.assertHexadecimal('', value)
    return true
  } catch (e) {
    return value === '0x'
  }
}