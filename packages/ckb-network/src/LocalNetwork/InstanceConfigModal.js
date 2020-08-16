import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedInput,
} from '@obsidians/ui-components'

import instanceChannel from './instanceChannel'

export default class InstanceConfigModal extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      saving: false,
      value: '',
    }
    this.modal = React.createRef()
  }

  async openModal (data) {
    this.data = data
    this.setState({ value: '', loading: true })

    this.modal.current.openModal()

    const config = await instanceChannel.invoke('readConfig', {
      name: this.data.Name,
      version: this.data.Labels.version
    })
    this.setState({ value: config, loading: false })
  }

  onChange = value => this.setState({ value })

  onConfirm = async () => {
    this.setState({ saving: true })
    await instanceChannel.invoke('writeConfig', {
      name: this.data.Name,
      version: this.data.Labels.version,
      content: this.state.value,
    })
    this.modal.current.closeModal()
    this.setState({ saving: false })
  }
  
  delete = async () => {
    const name = this.data.Name.substr(4)
    await instanceChannel.invoke('delete', name)
    this.modal.current.closeModal()
    this.props.onRefresh()
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        h100
        wide
        title='Node Configuration'
        onConfirm={this.onConfirm}
        textConfirm='Save Configuration'
        confirmDisabled={this.state.loading}
        pending={this.state.saving && 'Saving...'}
        textCancel='Close'
        // textActions={['Delete Instance']}
        // colorActions={['danger']}
        // onActions={[this.delete]}
      >
        <DebouncedInput
          size='sm'
          type='textarea'
          className='h-100 code'
          inputGroupClassName='flex-grow-1'
          disabled={this.state.loading}
          placeholder={this.state.loading ? 'Loading...' : ''}
          value={this.state.value}
          onChange={this.onChange}
        />
      </Modal>
    )
  }
}
