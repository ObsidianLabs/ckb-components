import React, { PureComponent } from 'react'

import {
  Button,
  Modal,
  DebouncedFormGroup,
  DropdownInput,
  Badge,
} from '@obsidians/ui-components'

import keypairManager from '@obsidians/keypair'
import { DockerImageInputSelector } from '@obsidians/docker'
import { CkbKeypair } from '@obsidians/ckb-sdk'

import instanceChannel from './instanceChannel'

export default class CreateInstanceButton extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      version: '',
      keypairs: [],
      lockArg: '',
      pending: false,
    }

    this.modal = React.createRef()
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = async () => {
    const keypairs = (await keypairManager.loadAllKeypairs()).map(k => CkbKeypair.fromAddress(k.address, k.name))
    this.setState({
      keypairs,
      lockArg: keypairs[0] ? keypairs[0].publicKeyHash : '',
    })
  }

  onClickButton = () => {
    this.refresh()
    this.modal.current.openModal()
  }

  onCreateInstance = async () => {
    this.setState({ pending: 'Creating...' })
    await instanceChannel.invoke('create', {
      name: this.state.name,
      version: this.state.version,
      chain: this.props.chain,
      lockArg: this.state.lockArg,
    })
    this.modal.current.closeModal()
    this.setState({ name: '', pending: false })
    this.props.onRefresh()
  }

  renderBlockAssemberInput = () => {
    if (this.props.chain !== 'dev') {
      return null
    }
    return (
      <DropdownInput
        label='Block assembler (miner)'
        options={this.state.keypairs.map(k => ({
          id: k.publicKeyHash,
          display: (
            <div className='w-100 d-flex align-items-center justify-content-between'>
              <code>{k.address}</code><Badge color='info' style={{ top: 0 }}>{k.name}</Badge>
            </div>
          )
        }))}
        renderText={option => <div className='w-100 mr-1'>{option.display}</div>}
        placeholder='(No CKB keypairs)'
        value={this.state.lockArg}
        onChange={lockArg => this.setState({ lockArg })}
      />
    )
  }

  render () {
    return (
      <React.Fragment>
        <Button
          key='new-instance'
          color='success'
          className={this.props.className}
          onClick={this.onClickButton}
        >
          <i className='fas fa-plus mr-1' />
          New Instance
        </Button>
        <Modal
          ref={this.modal}
          overflow
          title={`New Instance (${this.props.chain})`}
          textConfirm='Create'
          onConfirm={this.onCreateInstance}
          pending={this.state.pending}
          confirmDisabled={!this.state.name || !this.state.version || !this.state.lockArg}
        >
          <DebouncedFormGroup
            label='Instance name'
            placeholder='Can only contain alphanumeric characters, dots, hyphens or underscores.'
            maxLength='50'
            value={this.state.name}
            onChange={name => this.setState({ name })}
          />
          <DockerImageInputSelector
            channel={instanceChannel.ckbNode}
            label='CKB version'
            noneName='CKB node'
            modalTitle='CKB Version Manager'
            downloadingTitle='Downloading CKB'
            selected={this.state.version}
            onSelected={version => this.setState({ version })}
          />
          {this.renderBlockAssemberInput()}
        </Modal>
      </React.Fragment>
    )
  }
}
