import React from 'react'

import {
  DebouncedFormGroup,
} from '@obsidians/ui-components'

export default function CSpecificSettings (props) {
  const { projectSettings, onChange } = props

  const textMode = false
  const handleCopy = () => {}

  const mainFile = projectSettings?.get('main') || ''
  const outFile = mainFile.replace('.cpp', '.o').replace('.c', '.o')

  return <>
    <DebouncedFormGroup
      code
      label={<div>Write output to <kbd>-o</kbd></div>}
      className='bg-black'
      value={projectSettings?.get('output')}
      onChange={onChange('output')}
      inputType={textMode ? 'text' : 'input'}
      onTextClick={handleCopy}
      placeholder={`${textMode ? '' : 'Default: '}${outFile}`}
    />
    <h4 className='mt-4'>Debug Settings</h4>
    <DebouncedFormGroup
      code
      label='Mock file'
      className='bg-black'
      value={projectSettings?.get('debug.mock')}
      onChange={onChange('debug.mock')}
      placeholder={`Default: mock/tx.json`}
    />
    <DebouncedFormGroup
      code
      label='Debug target'
      className='bg-black'
      value={projectSettings?.get('debug.target')}
      onChange={onChange('debug.target')}
      placeholder={`Required`}
    />
    <DebouncedFormGroup
      code
      label='Cycles'
      className='bg-black'
      value={projectSettings?.get('debug.cycles')}
      onChange={onChange('debug.cycles')}
      placeholder={`Default: 1000000000 (1 Billion)`}
    />
  </>
}
