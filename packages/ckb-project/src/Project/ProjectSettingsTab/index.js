import React from 'react'

import {
  FormGroup,
  Label,
  CustomInput,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import {
  WorkspaceContext,
  AbstractProjectSettingsTab,
  ProjectPath,
} from '@obsidians/workspace'

import { DockerImageInputSelector } from '@obsidians/docker'
import ckbCompiler from '@obsidians/ckb-compiler'

import CSpecificSettings from './CSpecificSettings'
import JsSpecificSettings from './JsSpecificSettings'
import OtherLanguageSettings from './OtherLanguageSettings'

import projectManager from '../../projectManager'

export default class ProjectSettingsTab extends AbstractProjectSettingsTab {
  static contextType = WorkspaceContext

  componentDidMount () {
    projectManager.channel.on('settings', this.debouncedUpdate)
  }
  
  componentWillUnmount () {
    projectManager.channel.off('settings', this.debouncedUpdate)
  }

  renderCompilerSelector = projectSettings => {
    const language = projectSettings?.get('language')

    if (language === 'c' || language === 'other') {
      return (
        <DockerImageInputSelector
          key='compiler-selector-riscv'
          channel={ckbCompiler.regular}
          disableAutoSelection
          inputClassName='bg-black'
          label='RISC-V compiler version'
          noneName='CKB compiler'
          modalTitle='CKB Compiler Manager'
          downloadingTitle='Downloading CKB Compiler'
          selected={projectSettings?.get('compilers.riscv')}
          onSelected={v => this.onChange('compilers.riscv')(v)}
        />
      )
    } else if (language === 'rust') {
      return (
        <DockerImageInputSelector
          key='compiler-selector-capsule'
          channel={ckbCompiler.capsule}
          disableAutoSelection
          inputClassName='bg-black'
          label='Capsule version'
          noneName='Capsule'
          modalTitle='Capsule Manager'
          downloadingTitle='Downloading Capsule'
          selected={projectSettings?.get('compilers.capsule')}
          onSelected={v => this.onChange('compilers.capsule')(v)}
        />
      )
    }
  }

  renderOtherSettings = projectSettings => {
    const language = projectSettings?.get('language')
    if (language === 'javascript') {
      return <JsSpecificSettings projectSettings={projectSettings} onChange={this.onChange} />
    } else if (language === 'c') {
      return <CSpecificSettings projectSettings={projectSettings} onChange={this.onChange} />
    } else if (language === 'rust') {
      return null
    } else {
      return <OtherLanguageSettings projectSettings={projectSettings} onChange={this.onChange} />
    }
  }

  render () {
    const { projectRoot, projectSettings } = this.context

    return (
      <div className='custom-tab bg2'>
        <div className='jumbotron bg-transparent text-body'>
          <div className='container'>
            <h1>Project Settings</h1>
            <ProjectPath projectRoot={projectRoot} />

            <h4 className='mt-4'>General</h4>
            <FormGroup>
              <Label>Project language</Label>
              <CustomInput
                type='select'
                className='bg-black'
                value={projectSettings?.get('language')}
                onChange={event => this.onChange('language')(event.target.value)}
              >
                <option value='rust'>Rust</option>
                <option value='javascript'>JavaScript</option>
                <option value='c'>C</option>
                <option value='other'>Other</option>
              </CustomInput>
            </FormGroup>

            <h4 className='mt-4'>Build Settings</h4>
            <DebouncedFormGroup
              code
              label='Main file'
              className='bg-black'
              value={projectSettings?.get('main')}
              onChange={this.onChange('main')}
              placeholder='Required'
            />
            {this.renderCompilerSelector(projectSettings)}
            {this.renderOtherSettings(projectSettings)}
          </div>
        </div>
      </div>
    )
  }
}
