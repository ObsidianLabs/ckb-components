import React, { PureComponent } from 'react'

import Workspace, { ProjectLoading, ProjectInvalid } from '@obsidians/workspace'
import fileOps from '@obsidians/file-ops'
import { useBuiltinCustomTabs, modelSessionManager, defaultModeDetector } from '@obsidians/code-editor'
import ckbCompiler, { CkbCompilerTerminal } from '@obsidians/ckb-compiler'

import ProjectContext from './ProjectContext'
import projectManager from '../projectManager'

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


export default class Project extends PureComponent {
  constructor (props) {
    super(props)
    this.workspace = React.createRef()
    this.state = {
      loading: true,
      invalid: false,
      initialFile: undefined,
      terminal: false,
      context: {}
    }
  }

  async componentDidMount () {
    projectManager.project = this
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
    this.setState({ loading: true, invalid: false, context: {} })

    if (!await fileOps.current.isDirectory(projectRoot)) {
      this.setState({ loading: false, invalid: true })
      return
    }

    let projectSettings
    try {
      projectSettings = await projectManager.readProjectSettings()
    } catch (e) {
      console.warn(e)
      this.setState({
        loading: false,
        initialFile: projectManager.settingsFilePath,
      })
      return
    }

    this.setState({ context: {
      projectRoot,
      projectSettings,
    } })

    if (await projectManager.isMainValid()) {
      this.setState({
        loading: false,
        initialFile: projectManager.mainFilePath,
      })
      return
    }

    this.setState({
      loading: false,
      initialFile: projectManager.settingsFilePath,
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
    this.workspace.current.openFile(projectManager.settingsFilePath)
  }

  render () {
    const {
      projectRoot,
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
      <ProjectContext.Provider value={this.state.context}>
        <Workspace
          ref={this.workspace}
          theme={this.props.theme}
          projectRoot={projectRoot}
          initialFile={this.state.initialFile}
          terminal={terminal}
          defaultSize={272}
          ProjectToolbar={ProjectToolbar}
          onToggleTerminal={terminal => projectManager.toggleTerminal(terminal)}
          Terminal={<CkbCompilerTerminal active={terminal} cwd={projectRoot} />}
        />
      </ProjectContext.Provider>
    )
  }
}