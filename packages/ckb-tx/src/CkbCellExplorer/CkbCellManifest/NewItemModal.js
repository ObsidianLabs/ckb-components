import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
  DebouncedInput,
} from '@obsidians/ui-components'

export default class CkbCellManifest extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      key: 'network',
      name: '',
      code_hash: '',
    }

    this.modal = React.createRef()
    this.nameInput = React.createRef()
  }

  openModal = () => {
    this.modal.current.openModal()
    setTimeout(() => this.nameInput.current.focus(), 100)
  }

  newItem = () => {
  }

  deleteItem = item => {
  }

  onConfirm = () => {}

  render () {
    return (
      <Modal
        ref={this.modal}
        title='New Item'
        onConfirm={this.onConfirm}
      >
        <DebouncedFormGroup
          ref={this.nameInput}
          label='Name'
          maxLength='50'
          value={this.state.name}
          onChange={name => this.setState({ name })}
        />
        <DebouncedFormGroup
          label='Data Hash'
          placeholder='Hex string starts with 0x'
          maxLength='66'
          value={this.state.code_hash}
          onChange={code_hash => this.setState({ code_hash })}
        />
      </Modal>
    )
  }
}
