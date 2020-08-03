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
      value: ''
    }
    this.modal = React.createRef()
  }

  async openModal (data) {
    this.data = data
    this.setState({ value: '' })

    this.modal.current.openModal()

    const config = await instanceChannel.invoke('readConfig', {
      name: this.data.Name,
      version: this.data.Labels.version
    })
    this.setState({ value: config })
  }

  onChange = value => this.setState({ value })

  onConfirm = async () => {
    await instanceChannel.invoke('writeConfig', {
      name: this.data.Name,
      version: this.data.Labels.version,
      content: this.state.value,
    })
    this.modal.current.closeModal()
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
        textActions={['Delete Instance']}
        colorActions={['danger']}
        onActions={[this.delete]}
      >
        <DebouncedInput
          size='sm'
          type='textarea'
          inputGroupClassName='flex-grow-1'
          className='h-100 code'
          value={this.state.value}
          onChange={this.onChange}
        />
      </Modal>
    )
  }
}
