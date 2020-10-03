import React from 'react'

import {
  DebouncedFormGroup,
} from '@obsidians/ui-components'

export default function CSpecificSettings (props) {
  const { settings, onChange } = props

  const textMode = false
  const handleCopy = () => {}

  return <>
    <DebouncedFormGroup
      code
      label={<div>Write output to <kbd>-o</kbd></div>}
      className='bg-black'
      value={settings.output}
      onChange={onChange('output')}
      inputType={textMode ? 'text' : 'input'}
      onTextClick={handleCopy}
      placeholder={`${textMode ? '' : 'Default: '}${settings.main.replace('.cpp', '.o').replace('.c', '.o')}`}
    />
    <h4 className='mt-4'>Debug Settings</h4>
    <DebouncedFormGroup
      code
      label='Mock file'
      className='bg-black'
      value={settings.debug.mock}
      onChange={onChange('debug.mock')}
      placeholder={`Default: mock/tx.json`}
    />
    <DebouncedFormGroup
      code
      label='Debug target'
      className='bg-black'
      value={settings.debug.target}
      onChange={onChange('debug.target')}
      placeholder={`Required`}
    />
    <DebouncedFormGroup
      code
      label='Cycles'
      className='bg-black'
      value={settings.debug.cycles}
      onChange={onChange('debug.cycles')}
      placeholder={`Default: 1000000000 (1 Billion)`}
    />
  </>
}
