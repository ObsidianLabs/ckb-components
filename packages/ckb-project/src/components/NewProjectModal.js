import React, { Component } from 'react'

import {
  Modal,
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  Input,
  CustomInput,
  Button,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { IpcChannel } from '@obsidians/ipc'
import Terminal from '@obsidians/terminal'

import actions from '../actions'

export default class NewCkbProjectModal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      projectRoot: '',
      template: 'moleculec-es-template',
      creating: false
    }

    this.modal = React.createRef()
    this.terminal = React.createRef()
    this.path = fileOps.current.path
    this.fs = fileOps.current.fs
    this.channel = new IpcChannel('ckb-project')

    actions.newProjectModal = this
  }

  openModal () {
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
      this.setState({ name: '', projectRoot: '', template: 'moleculec-es-template' })
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
      const compilerVersion = 'v0.1.4'
      const { dir, name: projectName } = this.path.parse(projectRoot)
      const cmd = [
        `docker run --rm -it`,
        `--name ckb-create-project`,
        `-v /var/run/docker.sock:/var/run/docker.sock`,
        `-v "${dir}":"${dir}"`,
        `-w "${dir}"`,
        `obsidians/capsule:${compilerVersion}`,
        `capsule new ${projectName}`,
      ].join(' ')

      const result = await this.terminal.current.exec(cmd)

      if (result.code) {
        notification.error('Canno Create the Projectt')
        return false
      }
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

  render () {
    const { name, creating } = this.state

    let placeholder = 'Project path'
    if (!this.state.projectRoot) {
      placeholder = this.path.join(fileOps.current.homePath, 'CKB Studio', this.state.name || '')
    }

    return (
      <Modal
        ref={this.modal}
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
        <FormGroup>
          <Label>Template</Label>
          <CustomInput
            type='select'
            id='ckb-settings-template'
            value={this.state.template}
            onChange={event => this.setState({ template: event.target.value })}
          >
            <option value='rust'>[Rust] Empty rust project</option>
            <option value='moleculec-es-template'>[JavaScript] moleculec-es</option>
            <option value='molecule-javascript-template'>[JavaScript] molecule-javascript</option>
            <option value='js-minimal'>[JavaScript] minimal</option>
            <option value='htlc'>[JavaScript] HTLC</option>
            <option value='carrot'>[C] carrot</option>
            <option value='simple-udt'>[C] Simple UDT</option>
            <option value='duktape'>Duktape</option>
          </CustomInput>
        </FormGroup>
        <div style={{ display: this.state.creating ? 'block' : 'none'}}>
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
