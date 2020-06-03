import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import CkbKeypair from './CkbKeypair'

const isPrivateKey = str => /^0x[0-9A-Fa-f]{64}$/.test(str)

export default class ImportKeypairModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      valid: false,
      feedback: '',
      ckbKeypair: null,
    }

    this.modal = React.createRef()
  }
  

  openModal () {
    this.modal.current.openModal()
    this.setState({ ckbKeypair: null, valid: false, feedback: '' })
    return new Promise(resolve => this.onResolve = resolve)
  }

  onChange = privateKey => {
    if (!privateKey) {
      this.setState({ ckbKeypair: null, valid: false, feedback: '' })
    } else if (!isPrivateKey(privateKey)) {
      this.setState({ ckbKeypair: null, valid: false, feedback: 'Not a valid private key' })
    } else {
      try {
        const ckbKeypair = CkbKeypair.fromPrivateKey(privateKey)
        const testnetAddress = ckbKeypair.testnetAddress
        this.setState({
          ckbKeypair,
          valid: true,
          feedback: `Address: ${testnetAddress}`
        })
      } catch (e) {
        this.setState({ ckbKeypair: null, valid: false, feedback: 'Not a valid private key' })
      }
    }
  }

  onConfirm = async () => {
    const { ckbKeypair } = this.state

    if (!ckbKeypair) {
      this.onResolve()
      return
    }

    this.modal.current.closeModal()
    this.onResolve(ckbKeypair)
  }

  render () {
    const {
      ckbKeypair = {},
      valid,
      feedback,
    } = this.state

    return (
      <Modal
        ref={this.modal}
        title='Import Keypair'
        textConfirm='Import'
        onConfirm={this.onConfirm}
        confirmDisabled={!valid}
      >
        <DebouncedFormGroup
          label='Enter the private key you want to import'
          maxLength='66'
          onChange={this.onChange}
          feedback={feedback}
          valid={valid}
        />
      </Modal>
    )
  }
}
