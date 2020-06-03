import React, { PureComponent } from 'react'

import {
  Modal,
  Badge,
} from '@obsidians/ui-components'

import ckbKeypairManager from './ckbKeypairManager'

export default class CreateKeypairModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      ckbKeypair: null,
    }

    this.modal = React.createRef()
  }
  

  openModal () {
    this.modal.current.openModal()
    setTimeout(() => this.regenerateKeypair(), 500)
    return new Promise(resolve => this.onResolve = resolve)
  }

  regenerateKeypair = async () => {
    const ckbKeypair = await ckbKeypairManager.newKeypair()
    this.setState({ ckbKeypair })
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
      _privateKey = '',
      publicKey = '',
      testnetAddress = '',
    } = this.state.ckbKeypair || {}
    
    return (
      <Modal
        ref={this.modal}
        title='Create Keypair'
        textConfirm='Save'
        onConfirm={this.onConfirm}
        confirmDisabled={!publicKey}
        textActions={['Regenerate']}
        onActions={[this.regenerateKeypair]}
      >
        <div className='row align-items-center'>
          <div className='col-2'>
            <Badge pill color='success' className='ml-1'>Private</Badge>
          </div>
          <div className='col-10 pl-0'>
            <small><code>{_privateKey}</code></small>
          </div>
        </div>
        <div className='row align-items-center'>
          <div className='col-2'>
            <Badge pill color='info' className='ml-1'>Public</Badge>
          </div>
          <div className='col-10 pl-0'>
            <small><code>{publicKey}</code></small>
          </div>
        </div>
        <div className='row align-items-center'>
          <div className='col-2'>
            <Badge pill color='info' className='ml-1'>Address</Badge>
          </div>
          <div className='col-10 pl-0'>
            <small><code>{testnetAddress}</code></small>
          </div>
        </div>
      </Modal>
    )
  }
}
