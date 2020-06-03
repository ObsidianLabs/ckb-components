import React, { PureComponent } from 'react'

import {
  Modal,
  DeleteButton,
} from '@obsidians/ui-components'

import ckbKeypairManager from './ckbKeypairManager'

import CreateKeypairModal from './CreateKeypairModal'
import ImportKeypairModal from './ImportKeypairModal'

export default class KeypairManagerModal extends PureComponent {
  constructor (props) {
    super(props)

    this.modal = React.createRef()
    this.createKeypairModal = React.createRef()
    this.importKeypairModal = React.createRef()

    this.state = {
      loading: false,
      keypairs: [],
      showPrivateKeys: false,
    }
  }

  openModal = () => {
    this.modal.current.openModal()
    this.refresh()
  }

  async refresh () {
    this.setState({ loading: true })
    const keypairs = await ckbKeypairManager.loadAllKeypairs()
    this.setState({ keypairs, loading: false })
  }

  createKeypair = async () => {
    const keypair = await this.createKeypairModal.current.openModal()
    if (keypair) {
      await ckbKeypairManager.saveKeypair(keypair)
      await this.refresh()
    }
  }

  importKeypair = async () => {
    const keypair = await this.importKeypairModal.current.openModal()
    if (keypair) {
      await ckbKeypairManager.saveKeypair(keypair)
      await this.refresh()
    }
  }

  deleteKey = async keypair => {
    await ckbKeypairManager.deleteKeypair(keypair)
    // $.notify.info(
    //   'Delete Keypair Successful',
    //   `The keypair is removed from ${typeStrings[type]}.`
    // )
    this.refresh()
  }

  renderKeypairTable = () => {
    if (this.state.loading) {
      return (
        <tr key='keys-loading' >
          <td align='middle' colSpan='3'>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    }
    if (!this.state.keypairs || !this.state.keypairs.length) {
      return (
        <tr key='keys-none' >
          <td align='middle' colSpan='3'>
            (No CKB keypairs)
          </td>
        </tr>
      )
    }
    return this.state.keypairs.map(this.renderKeypairRow)
  }

  renderKeypairRow = keypair => {
    return (
      <tr key={`key-${keypair.testnetAddress}`} className='hover-inline-block'>
        <td>
          <code style={{ fontSize: '13px' }}>{keypair.testnetAddress}</code>
        </td>
        <td align='right'>
          <DeleteButton onConfirm={() => this.deleteKey(keypair)} />
        </td>
      </tr>
    )
  }

  render () {
    return (
      <React.Fragment>
        <Modal
          ref={this.modal}
          title='Keypair Manager'
          textActions={['Create', 'Import']}
          textCancel='Close'
          onActions={[this.createKeypair, this.importKeypair]}
        >
          <div className='d-flex flex-row align-items-center mb-2'>
            <div className='h4 m-0 mr-3'><i className='fas fa-exclamation-triangle text-warning' /></div>
            <div>
              <div><b>DO NOT</b> use on mainnet! For development purpose only.</div>
              <div className='small text-muted'>
                For convenience in development, the private keys are saved unencrypted.
              </div>
            </div>
          </div>
          <table className='table table-sm table-hover table-striped'>
            <thead>
              <tr>
                <th style={{ width: '74%' }}>Keypairs</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.renderKeypairTable()}
            </tbody>
          </table>
        </Modal>
        <CreateKeypairModal ref={this.createKeypairModal} />
        <ImportKeypairModal ref={this.importKeypairModal} />
      </React.Fragment>
    )
  }
}