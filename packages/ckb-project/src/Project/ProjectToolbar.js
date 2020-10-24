import React, { PureComponent } from 'react'

import { WorkspaceContext, BaseProjectManager } from '@obsidians/workspace'
import { ToolbarButton } from '@obsidians/ui-components'
import { CkbCompilerButton, CkbTestButton } from '@obsidians/ckb-compiler'
import { CkbDebuggerButton } from '@obsidians/ckb-debugger'

export default class ProjectToolbar extends PureComponent {
  static contextType = WorkspaceContext

  state = {
    language: ''
  }

  componentDidMount () {
    const language = this.context.projectSettings?.get('language') || ''
    this.setState({ language })

    BaseProjectManager.channel.on('settings:language', this.onLanguage)
  }

  componentWillUnmount () {
    BaseProjectManager.channel.off('settings:language', this.onLanguage)
  }

  onLanguage = language => this.setState({ language })

  render () {
    const { projectRoot } = this.context
    const language = this.state.language

    return <>
      <CkbCompilerButton
        className='rounded-0 border-0 flex-none w-5'
        projectLanguage={language}
        onClick={() => this.context.projectManager.compile()}
      />
      {
        language === 'rust' &&
        <CkbTestButton
          className='rounded-0 border-0 flex-none w-5'
          onClick={() => this.context.projectManager.test()}
        />
      }
      {
        (language === 'c' || language === 'javascript') &&
        <CkbDebuggerButton
          className='rounded-0 border-0 flex-none w-5'
          projectRoot={projectRoot}
          onClick={() => this.context.projectManager.debug()}
        />
      }
      <div className='flex-1' />
      <ToolbarButton
        id='settings'
        icon='fas fa-cog'
        tooltip='Project Settings'
        onClick={() => this.context.projectManager.openProjectSettings()}
      />
    </>
  }
}
