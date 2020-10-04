import React from 'react'

import {
  DebouncedFormGroup,
} from '@obsidians/ui-components'

export default function OtherLanguageSettings (props) {
  const { projectSettings, onChange } = props

  const readonly = false

  return (
    <DebouncedFormGroup
      code
      label='Build script'
      className='bg-black'
      value={projectSettings?.get('scripts.build')}
      onChange={onChange('scripts.build')}
      placeholder={`Required`}
      disabled={readonly}
    />
  )
}
