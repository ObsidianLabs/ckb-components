import React from 'react'

import {
  DebouncedFormGroup,
} from '@obsidians/ui-components'

export default function JsSpecificSettings (props) {
  const { projectSettings, onChange } = props

  return <>
    <DebouncedFormGroup
      code
      label='Build script'
      className='bg-black'
      value={projectSettings?.get('scripts.build')}
      onChange={onChange('scripts.build')}
      placeholder={`Required`}
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
