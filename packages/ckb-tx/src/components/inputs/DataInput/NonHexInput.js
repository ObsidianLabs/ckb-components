import React, { forwardRef } from 'react'
import {
  DebouncedInput,
} from '@obsidians/ui-components'

import { lib } from '@obsidians/ckb-tx-builder'

const toHex = (value, format) => {
  let hex
  try {
    hex = lib.toHex(value, format)
    if (hex.length > 66) {
      hex = hex.slice(0, 66) + '...'
    }
    return [null, hex]
  } catch (e) {
    return [e.message]
  }
}

export default forwardRef(NonHexInput)

function NonHexInput ({ value, format, onChange }, ref) {
  const [error, hex] = toHex(value, format)

  const invalid = error ? true : undefined

  let feedback = error
  if (!feedback && value) {
    feedback = <span>Hex: <code>{hex}</code></span>
  }

  return (
    <DebouncedInput
      ref={ref}
      type='textarea'
      maxLength='2000'
      value={value}
      onChange={onChange}
      feedback={feedback}
      invalid={invalid}
    />
  )
}
