import Workspace from '@obsidians/workspace'
import fileOps from '@obsidians/file-ops'
import { useBuiltinCustomTabs, modelSessionManager, defaultModeDetector } from '@obsidians/code-editor'
import ckbCompiler, { CkbCompilerTerminal } from '@obsidians/ckb-compiler'

import CkbProjectManager from '../CkbProjectManager'

import ProjectToolbar from './ProjectToolbar'
import ProjectSettingsTab from './ProjectSettingsTab'

useBuiltinCustomTabs(['markdown'])
modelSessionManager.registerCustomTab('settings', ProjectSettingsTab, 'Project Settings')
modelSessionManager.registerModeDetector(filePath => {
  const { base } = fileOps.current.path.parse(filePath)
  if (base === 'ckbconfig.json') {
    return 'settings'
  } else {
    return defaultModeDetector(filePath)
  }
})

Workspace.defaultProps = {
  ProjectManager: CkbProjectManager,
  compilerManager: ckbCompiler,
  ProjectToolbar,
  CompilerTerminal: CkbCompilerTerminal,
}

export default Workspace
