import React from 'react'

import notification from '@obsidians/notification'
import { DockerImageSelector } from '@obsidians/docker'
import { BaseProjectManager } from '@obsidians/workspace'
import ckbCompiler from '@obsidians/ckb-compiler'

export default () => {
  const [language, setLanguage] = React.useState('')
  const [selected, onSelected] = React.useState('')

  React.useEffect(BaseProjectManager.effect('settings:language', language => {
    setLanguage(language)
    onSelected(BaseProjectManager.instance.compilerVersion)
  }), [])

  React.useEffect(BaseProjectManager.effect('settings:compilers.riscv', v => {
    const language = BaseProjectManager.instance.projectSettings?.get('language')
    if (language === 'c' || language === 'other') {
      if (!v) {
        notification.info('No Compiler Specified', 'Please select a version for the compiler.')
      }
      onSelected(v)
    }
  }), [])

  React.useEffect(BaseProjectManager.effect('settings:compilers.capsule', v => {
    if (BaseProjectManager.instance.projectSettings?.get('language') === 'rust') {
      if (!v) {
        notification.info('No Compiler Specified', 'Please select a version for capsule.')
      }
      onSelected(v)
    }
  }), [])

  if (language === 'rust') {
    return (
      <DockerImageSelector
        key='compiler-capsule'
        channel={ckbCompiler.capsule}
        disableAutoSelection
        size='sm'
        icon='fas fa-hammer'
        title='Capsule'
        noneName='Capsule'
        modalTitle='Capsule Manager'
        downloadingTitle='Downloading Capsule'
        selected={selected}
        onSelected={v => BaseProjectManager.instance.projectSettings?.set('compilers.capsule', v)}
      />
    )
  } else if (language === 'c' || language === 'other') {
    return (
      <DockerImageSelector
        key='compiler-regular'
        channel={ckbCompiler.regular}
        disableAutoSelection
        size='sm'
        icon='fas fa-hammer'
        title='Compiler'
        noneName='CKB compiler'
        modalTitle='CKB Compiler Manager'
        downloadingTitle='Downloading CKB Compiler'
        selected={selected}
        onSelected={v => BaseProjectManager.instance.projectSettings?.set('compilers.riscv', v)}
      />
    )
  }
  return null
}
