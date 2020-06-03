import React from 'react'

import {
  DebouncedFormGroup,
} from '@obsidians/ui-components'

export default function OtherLanguageSettings (props) {
  const { settings, onChange } = props

  const readonly = false

  return (
    <DebouncedFormGroup
      code
      label='Build script'
      className='bg-black'
      value={settings.scripts.build}
      onChange={onChange('scripts.build')}
      placeholder={`Required`}
      disabled={readonly}
    />
  )
}
