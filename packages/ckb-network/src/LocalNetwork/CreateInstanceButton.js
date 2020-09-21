import React, { PureComponent } from 'react'

import {
  Button,
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import { KeypairSelector } from '@obsidians/keypair'
import { DockerImageInputSelector } from '@obsidians/docker'
import { CkbKeypair } from '@obsidians/ckb-sdk'

import instanceChannel from './instanceChannel'

export default class CreateInstanceButton extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      version: '',
      address: '',
      pending: false,
    }

    this.modal = React.createRef()
  }

  onClickButton = () => {
    this.modal.current.openModal()
  }

  onCreateInstance = async () => {
    const lockArg = CkbKeypair.fromAddress(this.state.address).publicKeyHash

    this.setState({ pending: 'Creating...' })
    await instanceChannel.invoke('create', {
      name: this.state.name,
      version: this.state.version,
      chain: this.props.chain,
      lockArg,
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
      <KeypairSelector
        label='Block assembler (miner)'
        value={this.state.address}
        onChange={address => this.setState({ address })}
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
          confirmDisabled={!this.state.name || !this.state.version || !this.state.address}
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
