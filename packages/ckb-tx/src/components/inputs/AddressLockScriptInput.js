import React, { useState } from 'react'
import PropTypes from 'prop-types'

import {
  DebouncedInput,
  Dropdown,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-tx-builder'

export default function AddressLockScriptInput ({ initialScript, onChange, addressBook }) {
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
    <React.Fragment>
      <DebouncedInput
        placeholder='Address starts with ckt/ckb'
        maxLength='66'
        value={value}
        onChange={onChangeValue}
        invalid={invalid}
      >
        <Dropdown
          header='Address Book'
          icon='fas fa-address-book'
          items={addressBook.map(item => item.testnetAddress)}
          onChange={onChangeValue}
        />
      </DebouncedInput>
    </React.Fragment>
  )
}

AddressLockScriptInput.propTypes = {
  initialScript: PropTypes.instanceOf(CkbScript),
  onChange: PropTypes.func,
  addressBook: PropTypes.array,
}

AddressLockScriptInput.defaultProps = {
  initialScript: new CkbScript(),
  onChange: () => {},
  addressBook: [],
}