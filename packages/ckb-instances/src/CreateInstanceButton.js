import React, { PureComponent } from 'react'

import {
  Button,
  Modal,
  FormGroup,
  Label,
  DebouncedFormGroup,
  CustomInput,
} from '@obsidians/ui-components'

import ckbKeypair from '@obsidians/keypair'
import { CkbKeypair } from '@obsidians/ckb-sdk'

import ckbInstancesChannel from './ckbInstancesChannel'

export default class CreateInstanceButton extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      ckbVersions: [],
      keypairs: [],
      name: '',
      version: '',
      lockArg: '',
      pending: false,
    }

    this.modal = React.createRef()
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = async () => {
    this.setState({ loading: true })
    const ckbVersions = await ckbInstancesChannel.invoke('versions')
    const keypairs = (await ckbKeypair.loadAllKeypairs()).map(k => CkbKeypair.fromAddress(k.address))
    this.setState({
      ckbVersions,
      keypairs,
      loading: false,
      version: ckbVersions[0] ? ckbVersions[0].Tag : '',
      lockArg: keypairs[0] ? keypairs[0].publicKeyHash : '',
    })
  }

  onClickButton = () => {
    this.refresh()
    this.modal.current.openModal()
  }

  onCreateInstance = async () => {
    this.setState({ pending: 'Creating...' })
    await ckbInstancesChannel.invoke('create', {
      name: this.state.name,
      version: this.state.version,
      chain: this.props.chain,
      lockArg: this.state.lockArg,
    })
    this.modal.current.closeModal()
    this.setState({ pending: false })
    this.props.onRefresh()
  }

  renderCkbVersionOptions = () => {
    if (this.state.loading) {
      return 'Loading'
    }

    if (!this.state.ckbVersions.length) {
      return <option disabled key='' value=''>(No CKB installed)</option>
    }

    return this.state.ckbVersions.map(v => <option key={v.Tag} value={v.Tag}>{v.Tag}</option>)
  }

  renderBlockAssemberInput = () => {
    if (this.props.chain !== 'dev') {
      return null
    }
    return (
      <FormGroup>
        <Label>Block assembler (miner)</Label>
        <CustomInput
          type='select'
          className='form-control'
          value={this.state.lockArg}
          onChange={event => this.setState({ lockArg: event.target.value })}
        >
          {this.renderLockArgOptions()}
        </CustomInput>
      </FormGroup>
    )
  }

  renderLockArgOptions = () => {
    if (this.state.loading) {
      return 'Loading'
    }

    if (!this.state.keypairs.length) {
      return <option disabled key='' value=''>(No CKB keypairs)</option>
    }

    return this.state.keypairs.map(k => <option key={k.publicKeyHash} value={k.publicKeyHash}>{k.address}</option>)
  }

  render () {
    return (
      <React.Fragment>
        <Button
          key='ckb-new-instance'
          color='success'
          className={this.props.className}
          onClick={this.onClickButton}
        >
          <i className='fas fa-plus mr-1' />
          New Instance
        </Button>
        <Modal
          ref={this.modal}
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
          <FormGroup>
            <Label>CKB version</Label>
            <CustomInput
              type='select'
              className='form-control'
              value={this.state.version}
              onChange={event => this.setState({ version: event.target.value })}
            >
              {this.renderCkbVersionOptions()}
            </CustomInput>
          </FormGroup>
          {this.renderBlockAssemberInput()}
        </Modal>
      </React.Fragment>
    )
  }
}
