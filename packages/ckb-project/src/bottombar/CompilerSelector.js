import React from 'react'

import notification from '@obsidians/notification'
import { DockerImageSelector } from '@obsidians/docker'
import ckbCompiler from '@obsidians/ckb-compiler'

import projectManager from '../projectManager'

export default props => {
  const [language, setLanguage] = React.useState('')
  const [selected, onSelected] = React.useState('')

  const onLanguage = React.useMemo(() => language => {
    setLanguage(language)
    onSelected(projectManager.compilerVersion)
  }, [])

  React.useEffect(() => {
    projectManager.channel.off('settings:language', onLanguage)
    projectManager.channel.on('settings:language', onLanguage)
  }, [props.match?.params?.project])

  React.useEffect(() => {
    projectManager.channel.off('settings:compilers.riscv')
    projectManager.channel.on('settings:compilers.riscv', v => {
      const language = projectManager.projectSettings?.get('language')
      if (language === 'c' || language === 'other') {
        if (!v) {
          notification.info('No Compiler Specified', 'Please select a version for the compiler.')
        }
        onSelected(v)
      }
    })
    projectManager.channel.off('settings:compilers.capsule')
    projectManager.channel.on('settings:compilers.capsule', v => {
      if (projectManager.projectSettings?.get('language') === 'rust') {
        if (!v) {
          notification.info('No Compiler Specified', 'Please select a version for capsule.')
        }
        onSelected(v)
      }
    })
  }, [props.match?.params?.project])

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
        onSelected={v => projectManager.projectSettings?.set('compilers.capsule', v)}
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
        onSelected={v => projectManager.projectSettings?.set('compilers.riscv', v)}
      />
    )
  }
  return null
}
