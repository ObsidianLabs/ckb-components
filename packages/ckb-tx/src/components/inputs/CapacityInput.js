import React, { forwardRef, useState } from 'react'
import {
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import { CkbCapacity } from '@obsidians/ckb-tx-builder'

export default forwardRef(CapacityInput)

function CapacityInput ({ label = 'Capacity', initial, placeholder, onChange, decimals = 8 }, ref) {
  const [value, setValue] = useState(initial ? initial.toString() : '')
  const [invalid, setInvalid] = useState()
  const [feedback, setFeedback] = useState('')

  const onChangeValue = value => {
    setValue(value)

    let capacity
    try {
      capacity = new CkbCapacity(value, decimals)
    } catch (e) {
      setFeedback(e.message)
      setInvalid(true)
      onChange(true)
      return
    }

    if (!value) {
      setFeedback()
      setInvalid()
      onChange(false, null)
      return
    }
    
    if (!capacity.value) {
      setFeedback('Cannot be zero.')
      setInvalid(true)
      onChange(true)
      return
    }
    
    if (value !== capacity.toString()) {
      setFeedback(capacity.toString())
    } else {
      setFeedback()
    }
    setInvalid()
    onChange(false, capacity)
  }

  return (
    <DebouncedFormGroup
      ref={ref}
      label={label}
      maxLength='50'
      value={value}
      onChange={onChangeValue}
      placeholder={placeholder}
      feedback={feedback}
      invalid={invalid}
    />
  )
}
