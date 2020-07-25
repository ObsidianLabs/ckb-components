import React, { PureComponent } from 'react'

import {
  Modal,
  CustomInput,
  DebouncedInput,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-tx-builder'
import keypairManager from '@obsidians/keypair'
import notification from '@obsidians/notification'
import { kp } from '@obsidians/ckb-sdk'
import nodeManager from '@obsidians/ckb-node'

import CkbWalletContext from '../../CkbWalletContext'

export default class CkbTransactionDetailModal extends PureComponent {
  static contextType = CkbWalletContext

  constructor (props) {
    super(props)
    this.state = {
      tx: null,
      signers: [],
      selected: {},
      value: '',
      signed: false,
      signedTx: null,
      pushing: false,
    }
    this.modal = React.createRef()
  }

  openModal = tx => {
    const signers = tx.getSigners()
    tx.network = nodeManager.network?.id || 'local'
    const value = JSON.stringify(tx.serialize(), null, 2)
    this.setState({ tx, value, signers, selected: {}, signed: false, signedTx: null, pushing: false })
    this.modal.current.openModal()
    return new Promise(resolve => this.onResolve = resolve)
  }

  signTransaction = async () => {
    const signers = this.state.signers
    try {
      const signatureProvider = new Map()
      await Promise.all(signers.map(async address => {
        if (!this.state.selected[address]) {
          return
        }
        const lock = new CkbScript(address)
        const secret = await keypairManager.getSigner(address)
        const keypair = kp.importKeypair(secret)
        const signer = message => keypair.sign(message)
        signatureProvider.set(lock.hash, signer)
      }))
      const witnessesSigner = nodeManager.sdk.ckbClient.core.signWitnesses(signatureProvider)
      const signedTx = await this.state.tx.sign(witnessesSigner, JSON.parse(this.state.value))
      const value = JSON.stringify(signedTx, null, 2)
      this.setState({ value, signed: true, signedTx })
    } catch (e) {
      console.warn(e)
      notification.error('Push Transaction Failed', e.message)
    }
  }

  pushTransaction = async () => {
    this.setState({ pushing: true })
    try {
      const txHash = await nodeManager.sdk.ckbClient.core.rpc.sendTransaction(this.state.signedTx)
      notification.success('Transaction Pushed', `Transaction hash: ${txHash}`)
      this.onResolve()
      this.modal.current.closeModal()
    } catch (e) {
      notification.error('Push Transaction Failed', e.message)
    }
    this.setState({ pushing: false })
  }
  
  renderSigners = (signers, selected) => {
    return signers.map(address => (
      <CustomInput
        type='checkbox'
        key={`signer-${address}`}
        id={`signer-${address}`}
        className='text-body'
        label={<code>{address}</code>}
        disabled={this.state.signed}
        checked={!!selected[address]}
        onChange={event => this.setState({ selected: { ...selected, [address]: event.target.checked } })}
      />
    ))
  }

  onChange = value => {
    if (this.state.signed) {
      this.setState({ value, signedTx: value })
    } else {
      this.setState({ value })
    }
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        h100
        title='Transaction'
        textConfirm={this.state.signed ? 'Push transaction' : 'Sign transaction'}
        pending={this.state.pushing && 'Pushing...'}
        onConfirm={this.state.signed ? this.pushTransaction : this.signTransaction}
      >
        <DebouncedInput
          size='sm'
          type='textarea'
          inputGroupClassName='flex-grow-1'
          className='h-100 code'
          value={this.state.value}
          onChange={this.onChange}
        />
        <div className='mt-2'>
          {this.renderSigners(this.state.signers, this.state.selected)}
        </div>
      </Modal>
    )
  }
}
