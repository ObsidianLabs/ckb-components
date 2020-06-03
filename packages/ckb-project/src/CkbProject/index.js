import React, { PureComponent } from 'react'

import Workspace, { ProjectLoading, ProjectInvalid } from '@obsidians/workspace'
import fileOps from '@obsidians/file-ops'
import { useBuiltinCustomTabs, modelSessionManager, defaultModeDetector } from '@obsidians/code-editor'
import ckbCompiler, { CkbCompilerTerminal } from '@obsidians/ckb-compiler'

import ckbProjectManager from '../ckbProjectManager'
import CkbSettings from './CkbSettings'

import CkbToolbar from './CkbToolbar'
import CkbSettingsTab from './CkbSettingsTab'

useBuiltinCustomTabs(['markdown'])
modelSessionManager.registerCustomTab('settings', CkbSettingsTab, 'Project Settings')
modelSessionManager.registerModeDetector(filePath => {
  const { base } = fileOps.current.path.parse(filePath)
  if (base === 'ckbconfig.json') {
    return 'settings'
  } else {
    return defaultModeDetector(filePath)
  }
})


export default class CkbProject extends PureComponent {
  constructor (props) {
    super(props)
    this.workspace = React.createRef()
    this.state = {
      loading: true,
      invalid: false,
      initialFile: undefined,
      terminal: false,
    }
  }

  async componentDidMount () {
    ckbProjectManager.ckbProject = this
    this.prepareProject(this.props.projectRoot)
  }

  async componentDidUpdate (prevProps, prevState) {
    if (this.state.terminal !== prevState.terminal) {
      window.dispatchEvent(new Event('resize'))
    }
    if (this.props.projectRoot !== prevProps.projectRoot) {
      this.prepareProject(this.props.projectRoot)
    }
  }

  async prepareProject (projectRoot) {
    this.setState({ loading: true, invalid: false })

    if (!await fileOps.current.isDirectory(projectRoot)) {
      this.setState({ loading: false, invalid: true })
      return
    }

    this.ckbSettings = new CkbSettings(projectRoot)

    try {
      await this.ckbSettings.readSettings()
    } catch (e) {
      this.setState({
        loading: false,
        initialFile: this.ckbSettings.configPath,
      })
      return
    }

    if (await this.ckbSettings.isMainValid()) {
      this.setState({
        loading: false,
        initialFile: this.ckbSettings.mainPath,
      })
      return
    }

    this.setState({
      loading: false,
      initialFile: this.ckbSettings.configPath,
    })
  }

  saveAll = async () => {
    return await this.workspace.current.saveAll()
  }

  toggleTerminal = terminal => {
    this.setState({ terminal })
    if (terminal) {
      ckbCompiler.focus()
    }
  }

  openProjectSettings = () => {
    this.workspace.current.openFile(this.ckbSettings.configPath)
  }

  render () {
    const {
      projectRoot,
      compilerVersion,
      InvalidProjectActions = null,
    } = this.props
    const { terminal } = this.state

    if (this.state.loading) {
      return <ProjectLoading projectRoot={projectRoot} />
    }

    if (this.state.invalid) {
      return (
        <ProjectInvalid projectRoot={projectRoot || '(undefined)'}>
          {InvalidProjectActions}
        </ProjectInvalid>
      )
    }

    return (
      <Workspace
        ref={this.workspace}
        theme={this.props.theme}
        projectRoot={projectRoot}
        initialFile={this.state.initialFile}
        terminal={terminal}
        defaultSize={272}
        Toolbar={(
          <CkbToolbar
            projectRoot={projectRoot}
            compilerVersion={compilerVersion}
          />
        )}
        onToggleTerminal={terminal => ckbProjectManager.toggleTerminal(terminal)}
        Terminal={<CkbCompilerTerminal active={terminal} cwd={projectRoot} />}
      />
    )
  }
}