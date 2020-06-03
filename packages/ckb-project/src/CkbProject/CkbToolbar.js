import React from 'react'

import { ToolbarButton } from '@obsidians/ui-components'
import { CkbCompilerButton } from '@obsidians/ckb-compiler'
import { CkbDebuggerButton } from '@obsidians/ckb-debugger'

import ckbProjectManager from '../ckbProjectManager'

export default function CkbToolbar ({ projectRoot, compilerVersion }) {
  return (
    <React.Fragment>
      <CkbCompilerButton
        className='rounded-0 border-0 flex-none w-5'
        version={compilerVersion}
        onClick={() => ckbProjectManager.compile()}
      />
      <CkbDebuggerButton
        className='rounded-0 border-0 flex-none w-5'
        projectRoot={projectRoot}
        onClick={() => ckbProjectManager.debug()}
      />
      <div className='flex-1' />
      <ToolbarButton
        id='settings'
        icon='fas fa-cog'
        tooltip='Project Settings'
        onClick={() => ckbProjectManager.openProjectSettings()}
      />
    </React.Fragment>
  )
}
