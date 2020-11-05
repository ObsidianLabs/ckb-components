import React, { forwardRef } from 'react'
import {
  DebouncedInput,
} from '@obsidians/ui-components'

import { lib } from '@obsidians/ckb-objects'

export default forwardRef(HexInput)

function HexInput ({ value, onChange }, ref) {
  const invalid = (value && !lib.isHexString(value)) || undefined
  const feedback = invalid ? 'Not a valid hex string.' : ''

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
