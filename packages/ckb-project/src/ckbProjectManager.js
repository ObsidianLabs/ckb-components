import notification from '@obsidians/notification'
import ckbCompiler from '@obsidians/ckb-compiler'
import ckbDebugger from '@obsidians/ckb-debugger'

class CkbProjectManager {
  constructor () {
    this.project = null
    this.modal = null
    this.button = null
  }
  
  set ckbProject (project) {
    this.project = project
  }
  get ckbProject () {
    return this.project
  }

  set terminalButton (button) {
    this.button = button
  }

  get projectRoot () {
    return this.project.props.projectRoot
  }

  get compilerVersion () {
    return this.project.props.compilerVersion
  }

  openProjectSettings () {
    if (this.project) {
      this.project.openProjectSettings()
    }
  }

  async checkSettings () {
    if (!this.project) {
      return
    }

    // notification.info('Not in Code Editor', 'Please switch to code editor and build.')
    // return

    const projectRoot = this.projectRoot
    if (!projectRoot) {
      notification.error('No Project', 'Please open a project first.')
      return
    }

    const settings = await this.project.ckbSettings.readSettings()
    return settings
  }

  async compile () {
    let settings
    try {
      settings = await this.checkSettings()
    } catch (e) {
      return false
    }

    if (settings.language !== 'javascript' && !this.compilerVersion) {
      notification.error('No CKB Compiler', 'Please install and select a CKB compiler.')
      return false
    }

    const main = settings.main
    if (!main) {
      notification.error('No Main File', 'Please specify a main file in project settings.')
      return false
    }

    await this.project.saveAll()
    this.toggleTerminal(true)

    try {
      await ckbCompiler.build(settings)
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

  toggleTerminal (terminal) {
    if (this.button) {
      this.button.setState({ terminal })
    }
    if (this.project) {
      this.project.toggleTerminal(terminal)
    }
  }
}

export default new CkbProjectManager()