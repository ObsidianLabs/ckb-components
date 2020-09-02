import React, { PureComponent } from 'react'

import {
  Modal,
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  Input,
  Button,
  DebouncedFormGroup,
  DropdownInput,
  Badge,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { IpcChannel } from '@obsidians/ipc'
import Terminal from '@obsidians/terminal'
import { DockerImageInputSelector } from '@obsidians/docker'
import ckbCompiler from '@obsidians/ckb-compiler'

import actions from '../actions'

export default class NewCkbProjectModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      projectRoot: '',
      template: 'moleculec-es-template',
      capsuleVersion: '',
      creating: false,
      hasError: false,
    }

    this.modal = React.createRef()
    this.terminal = React.createRef()
    this.path = fileOps.current.path
    this.fs = fileOps.current.fs
    this.channel = new IpcChannel('ckb-project')

    actions.newProjectModal = this
  }

  openModal () {
    this.setState({ hasError: false })
    this.modal.current.openModal()
    return new Promise(resolve => { this.onConfirm = resolve })
  }

  chooseProjectPath = async () => {
    try {
      const projectRoot = await fileOps.current.chooseFolder('CKB Studio')
      this.setState({ projectRoot })
    } catch (e) {

    }
  }

  onCreateProject = async () => {
    this.setState({ creating: true })

    let created = await this.createProject()

    if (created) {
      this.modal.current.closeModal()
      this.onConfirm(created)
      this.setState({ name: '', projectRoot: '', template: 'moleculec-es-template', hasError: false })
    } else {
      this.setState({ hasError: true })
    }
    this.setState({ creating: false })
  }

  createProject = async () => {
    let projectRoot
    const { name, template } = this.state
    if (!this.state.projectRoot) {
      projectRoot = this.path.join(fileOps.current.homePath, 'CKB Studio', name)
    } else if (!this.path.isAbsolute(this.state.projectRoot)) {
      projectRoot = this.path.join(fileOps.current.homePath, 'CKB Studio', this.state.projectRoot)
    } else {
      projectRoot = this.state.projectRoot
    }

    if (await fileOps.current.isDirectoryNotEmpty(projectRoot)) {
      notification.error('Cannot Create the Project', `<b>${projectRoot}</b> is not an empty directory.`)
      return false
    }

    if (template === 'rust') {
      const capsuleVersion = this.state.capsuleVersion
      if (!capsuleVersion) {
        notification.error('Cannot Create the Project', 'Please select a version for Capsule.')
        return false
      }
      const { dir, name: projectName } = this.path.parse(projectRoot)
      await fileOps.current.ensureDirectory(dir)
      const projectDir = fileOps.current.getDockerMountPath(dir)
      const cmd = [
        `docker run --rm -it`,
        `--name ckb-create-project`,
        '-v /var/run/docker.sock:/var/run/docker.sock',
        `-v "${projectDir}:${projectDir}"`,
        `-w "${projectDir}"`,
        `obsidians/capsule:${capsuleVersion}`,
        `capsule new ${projectName}`,
      ].join(' ')

      const result = await this.terminal.current.exec(cmd)

      if (result.code) {
        notification.error('Cannot Create the Project')
        return false
      }

      const ckbconfig = {
        language: 'rust',
        main: `contracts/${projectName}/src/main.rs`,
      }
      await this.fs.writeFile(this.path.join(projectRoot, 'ckbconfig.json'), JSON.stringify(ckbconfig, null, 2))
    } else {
      try {
        await this.channel.invoke('createProject', { projectRoot, name, template })
      } catch (e) {
        notification.error('Cannot Create the Project', e.message)
        return false
      }
    }

    notification.success('Successful', `New project <b>${name}</b> is created.`)
    return { projectRoot, name }
  }

  renderCapsuleVersion = () => {
    if (this.state.template !== 'rust') {
      return null
    }
    return (
      <DockerImageInputSelector
        channel={ckbCompiler.capsule}
        label='Capsule version'
        noneName='Capsule'
        modalTitle='Capsule Manager'
        downloadingTitle='Downloading Capsule'
        selected={this.state.capsuleVersion}
        onSelected={capsuleVersion => this.setState({ capsuleVersion })}
      />
    )
  }

  render () {
    const { name, creating } = this.state

    let placeholder = 'Project path'
    if (!this.state.projectRoot) {
      placeholder = this.path.join(fileOps.current.homePath, 'CKB Studio', this.state.name || '')
    }

    return (
      <Modal
        ref={this.modal}
        overflow
        title='Create a New Project'
        textConfirm='Create Project'
        onConfirm={this.onCreateProject}
        pending={creating && 'Creating...'}
        confirmDisabled={!name}
      >
        <FormGroup>
          <Label>Project location</Label>
          <InputGroup>
            <Input
              placeholder={placeholder}
              value={this.state.projectRoot}
              onChange={e => this.setState({ projectRoot: e.target.value })}
            />
            <InputGroupAddon addonType='append'>
              <Button color='secondary' onClick={this.chooseProjectPath}>
                Choose...
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </FormGroup>
        <DebouncedFormGroup
          label='Project name'
          onChange={name => this.setState({ name })}
        />
        <DropdownInput
          label='Template'
          options={[
            {
              group: 'Rust',
              children: [
                { id: 'rust', display: 'CKB project in Rust' },
              ],
            },
            {
              group: 'JavaScript',
              children: [
                { id: 'moleculec-es-template', display: 'moleculec-es' },
                { id: 'molecule-javascript-template', display: 'molecule-javascript' },
                { id: 'js-minimal', display: 'minimal' },
                { id: 'htlc', display: 'HTLC' },
              ],
            },
            {
              group: 'C',
              children: [
                { id: 'carrot', display: 'carrot' },
                { id: 'simple-udt', display: 'Simple UDT' },
              ],
            },
            {
              group: 'Other',
              children: [
                { id: 'duktape', display: 'Duktape' },
              ],
            },
          ]}
          renderText={option => (
            <div className='w-100 mr-1 d-flex align-items-center justify-content-between'>
              <span>{option.display}</span><Badge color='info' style={{ top: 0 }}>{option.group}</Badge>
            </div>
          )}
          value={this.state.template}
          onChange={template => this.setState({ template })}
        />
        {this.renderCapsuleVersion()}
        <div style={{ display: this.state.creating || this.state.hasError ? 'block' : 'none'}}>
          <Terminal
            ref={this.terminal}
            active={this.state.creating}
            height='200px'
            logId='create-project'
            className='rounded overflow-hidden'
          />
        </div>
      </Modal>
    )
  }
}
