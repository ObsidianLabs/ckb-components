import React, { PureComponent } from 'react'

import {
  Modal,
  CustomInput,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-tx-builder'
import keypairManager from '@obsidians/keypair'
import notification from '@obsidians/notification'
import { CkbKeypair } from '@obsidians/ckb-sdk'
import queue from '@obsidians/ckb-queue'
import { networkManager } from '@obsidians/ckb-network'

import Highlight from 'react-highlight'

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
      txHash: '',
      pushing: false,
    }
    this.modal = React.createRef()
    this.witnessModal = React.createRef()
  }

  openModal = tx => {
    const signers = tx.getUniqueSigners()
    tx.network = networkManager.network?.id || 'local'
    const value = JSON.stringify(tx.serialize(), null, 2)
    this.setState({ tx, value, signers, selected: {}, signed: false, pushing: false })
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
        const keypair = CkbKeypair.fromPrivateKey(secret)
        const signer = message => keypair.sign(message)
        signatureProvider.set(lock.hash, signer)
      }))
      const witnessesSigner = networkManager.sdk.ckbClient.core.signWitnesses(signatureProvider)
      const signedTx = await this.state.tx.sign(witnessesSigner)
      const value = JSON.stringify(signedTx, null, 2)
      this.setState({ signed: true, value, witnesses: signedTx.witnesses })
    } catch (e) {
      console.warn(e)
      notification.error('Push Transaction Failed', e.message)
    }
  }

  pushTransaction = () => {
    this.setState({ pushing: true })
    const { tx, value } = this.state
    const signedTx = JSON.parse(value)
    const txHash = tx.hash()
    queue.add(
      () => ({
        txHash,
        push: () => networkManager.sdk.ckbClient.sendTransaction(signedTx)
      }),
      { tx: signedTx },
      {
        pending: () => {
          this.setState({ pushing: false })
          this.onResolve()
          this.modal.current.closeModal()
        },
        failed: () => this.setState({ pushing: false })
      }
    )
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

  openWitnessModal = () => {
    this.witnessModal.current.openModal()
  }

  render () {
    const actions = this.state.signed ? [this.openWitnessModal] : []

    return (
      <>
        <Modal
          ref={this.modal}
          h100
          title='Transaction'
          textConfirm={this.state.signed ? 'Push transaction' : 'Sign transaction'}
          pending={this.state.pushing && 'Pushing...'}
          onConfirm={this.state.signed ? this.pushTransaction : this.signTransaction}
          textActions={this.state.signed ? ['Witnesses'] : []}
          onActions={actions}
        >
          <Highlight language='javascript' className='pre-box bg2 pre-wrap break-all small' element='pre'>
            <code>{this.state.value}</code>
          </Highlight>
          <div className='mt-2'>
            {this.renderSigners(this.state.signers, this.state.selected)}
          </div>
        </Modal>
        <Modal
          ref={this.witnessModal}
          title='Witnesses'
          onConfirm={() => {}}
        >
          <Highlight language='javascript' className='pre-box bg2 pre-wrap break-all small' element='pre'>
            <code>123123 123</code>
          </Highlight>
        </Modal>
      </>
    )
  }
}
