import notification from '@obsidians/notification'
import { ProjectManager, BaseProjectManager } from '@obsidians/workspace'

import ckbCompiler from '@obsidians/ckb-compiler'
import ckbDebugger from '@obsidians/ckb-debugger'
import { networkManager } from '@obsidians/ckb-network'

import CkbProjectSettings from './CkbProjectSettings'

BaseProjectManager.ProjectSettings = CkbProjectSettings

function makeProjectManager (Base) {
  return class CkbProjectManager extends Base {
    constructor (project, projectRoot) {
      super(project, projectRoot)
      this.createCellButton = null
    }
  
    get settingsFilePath () {
      return this.pathForProjectFile('ckbconfig.json')
    }
    
    get compilerVersion () {
      const language = this.projectSettings?.get('language')
      const compilers = this.projectSettings?.get('compilers')
      if (language === 'c' || language === 'other') {
        return compilers.riscv
      } else if (language === 'rust') {
        return compilers.capsule
      }
      return ''
    }
    
    async compile () {
      let settings
      try {
        settings = await this.checkSettings()
      } catch (e) {
        return false
      }
  
      if (!this.compilerVersion) {
        if (settings.language === 'c' || settings.language === 'other') {
          notification.error('No CKB Compiler', 'Please install and select a CKB compiler.')
          return false
        } else if (settings.language === 'rust') {
          notification.error('No Capsule', 'Please install Capsule and select a version.')
          return false
        }
      }
  
      const main = settings.main
      if (!main) {
        notification.error('No Main File', 'Please specify a main file in project settings.')
        return false
      }
  
      await this.project.saveAll()
      this.toggleTerminal(true)
  
      try {
        await ckbCompiler.build(this.compilerVersion, settings)
      } catch (e) {
        return false
      }
  
      return true
    }
  
    async test () {
      let settings
      try {
        settings = await this.checkSettings()
      } catch (e) {
        return false
      }
  
      if (!this.compilerVersion) {
        notification.error('No Capsule', 'Please install Capsule and select a version.')
        return false
      }
  
      await this.project.saveAll()
      this.toggleTerminal(true)
  
      try {
        await ckbCompiler.build(this.compilerVersion, settings)
        await ckbCompiler.test(this.compilerVersion, settings)
      } catch (e) {
        return false
      }
  
      return true
    }
  
    async debug () {
      let settings
      try {
        settings = await this.checkSettings()
      } catch (e) {
        return false
      }
  
      if (settings.language !== 'c' && settings.language !== 'javascript') {
        notification.error('Cannot Debug', 'Debug is only supported for C or JavaScript projects.')
        return false
      }
  
      if (!settings.debug) {
        notification.error('No Debug Configurations', 'Please specify debug configurations in project settings.')
        return false
      }
  
      ckbDebugger.setDebugState(true)
      const result = await this.compile()
      if (!result) {
        ckbDebugger.setDebugState(false)
        return false
      }
  
      try {
        await ckbDebugger.debug(settings.debug, this.projectRoot)
      } catch (e) {
        ckbDebugger.setDebugState(false)
        notification.error('Debug Failed', e.message)
        return false
      }
  
      return true
    }

    async createCell (node) {
      if (!networkManager.sdk) {
        notification.error('No Network', 'Please connect to a network.')
        return
      }
      this.createCellButton.open(node)
    }
  }
}

export default {
  Local: makeProjectManager(ProjectManager.Local),
  Remote: makeProjectManager(ProjectManager.Remote),
}