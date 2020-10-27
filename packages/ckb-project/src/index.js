import React from 'react'

import Project from './Project'
import { CkbDebuggerWindow } from '@obsidians/ckb-debugger'

export default function (props) {
  return <>
    <Project {...props} />
    <CkbDebuggerWindow />
  </>
}

export { navbarItem } from '@obsidians/workspace'
export { default as redux } from './redux'

export { default as NewProjectModal } from './components/NewProjectModal'

export { default as CompilerSelector } from './bottombar/CompilerSelector'