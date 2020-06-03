import React from 'react'

import { CkbDebuggerWindow } from '@obsidians/ckb-debugger'

import CkbProject from './CkbProject'

export { default as projectManager } from './ckbProjectManager'
export { default as TerminalButton } from './TerminalButton'

export { default as NewProjectModal } from './components/NewProjectModal'
export { default as ProjectList } from './components/ProjectList'
export { default as ProjectPath } from './components/ProjectPath'

export { default as actions } from './actions'
export { default as navbarItem } from './navbarItem'
export { default as redux } from './redux'

export default function (props) {
  return (
    <React.Fragment>
      <CkbProject {...props} />
      <CkbDebuggerWindow />
    </React.Fragment>
  )
}