import React from 'react'

import Project from './Project'
import { CkbDebuggerWindow } from '@obsidians/ckb-debugger'

export default function (props) {
  return <>
    <Project {...props} />
    <CkbDebuggerWindow />
  </>
}

export { default as CompilerSelector } from './bottombar/CompilerSelector'

export { default as NewProjectModal } from './components/NewProjectModal'
export { default as ProjectList } from './components/ProjectList'

export { default as actions } from './actions'
export { default as navbarItem } from './navbarItem'
export { default as redux } from './redux'
