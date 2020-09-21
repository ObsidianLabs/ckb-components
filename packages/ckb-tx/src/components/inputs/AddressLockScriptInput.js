import React, { useState } from 'react'
import PropTypes from 'prop-types'

import {
  DebouncedInput,
  Dropdown,
} from '@obsidians/ui-components'

import { KeypairSelector } from '@obsidians/keypair'
import { CkbScript } from '@obsidians/ckb-tx-builder'

export default function AddressLockScriptInput ({ initialScript, onChange }) {
  const [value, setValue] = useState(initialScript.isAddress() ? initialScript.getAddress() : '')
  const [invalid, setInvalid] = useState()

  const onChangeScript = script => {
    setInvalid(script ? undefined : true)
    onChange(!script, script)
  }

  const onChangeValue = address => {
    setValue(address)
    try {
      const script = new CkbScript(address)
      onChangeScript(script)
    } catch (e) {
      onChangeScript()
    }
  }

  return (
    <KeypairSelector
      editable
      noCaret
      icon='fas fa-map-marker-alt'
      placeholder='Address starts with ckt/ckb'
      maxLength={66}
      value={value}
      onChange={onChangeValue}
      invalid={invalid}
    />
  )
}

AddressLockScriptInput.propTypes = {
  initialScript: PropTypes.instanceOf(CkbScript),
  onChange: PropTypes.func,
}

AddressLockScriptInput.defaultProps = {
  initialScript: new CkbScript(),
  onChange: () => {},
}