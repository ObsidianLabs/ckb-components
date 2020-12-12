import React, { PureComponent } from 'react'

import {
  Modal,
  CustomInput,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-objects'
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
      signers: [],
      selected: {},
      serializedTx: '',
      witnesses: [],
      signed: false,
      signing: false,
      pushing: false,
    }

    this.tx = null
    this.modal = React.createRef()
    this.witnessModal = React.createRef()
  }

  openModal = tx => {
    tx.chain = networkManager?.chain || 'ckb_dev'
    this.tx = tx

    this.setState({
      signers: tx.getUniqueSigners(),
      selected: {},
      serializedTx: JSON.stringify(tx.serialize(), null, 2),
      witnesses: [],
      signed: false,
      pushing: false,
    })
    this.modal.current.openModal()
    return new Promise(resolve => this.onResolve = resolve)
  }

  signTransaction = async () => {
    this.setState({ signing: true })
    const signers = this.state.signers
    try {
      const signatureProvider = new Map()
      await Promise.all(signers.map(async address => {
        if (!this.state.selected[address]) {
          return
        }
        const lock = new CkbScript(address)
        const secret = await keypairManager.getSecret(address)
        const keypair = CkbKeypair.fromPrivateKey(secret)
        const signer = message => keypair.sign(message)
        signatureProvider.set(lock.hash, signer)
      }))
      const signedTx = await this.tx.sign(signatureProvider)
      this.setState({
        signed: true,
        signing: false,
        witnesses: signedTx.witnesses,
      })
    } catch (e) {
      console.warn(e)
      this.setState({ signing: false })
      notification.error('Sign Transaction Failed', e.message)
    }
  }

  pushTransaction = () => {
    const { serializedTx, witnesses } = this.state
    const tx = {
      ...JSON.parse(serializedTx),
      witnesses,
    }
    this.setState({ pushing: true })

    queue.add(
      () => ({
        txHash: this.tx.hash(),
        push: () => networkManager.sdk.ckbClient.sendTransaction(tx)
      }),
      { tx },
      {
        pending: () => {
          this.tx.updateInputsCellStatus('pending')
          this.setState({ pushing: false })
          this.onResolve()
          this.modal.current.closeModal()
        },
        failed: () => {
          this.tx.updateInputsCellStatus('live')
          this.setState({ pushing: false })
        },
        proposed: () => {
          this.tx.updateInputsCellStatus('used')
        }
      }
    )
  }
  
  renderSigners = () => {
    const { signed, signers, selected } = this.state
    return signers.map(address => (
      <CustomInput
        type='checkbox'
        key={`signer-${address}`}
        id={`signer-${address}`}
        className='text-body'
        label={<code>{address}</code>}
        disabled={signed}
        checked={!!selected[address]}
        onChange={event => this.setState({ selected: { ...selected, [address]: event.target.checked } })}
      />
    ))
  }

  openWitnessModal = () => {
    this.witnessModal.current.openModal()
  }

  onChangeWitness = index => value => {
    const witnesses = [...this.state.witnesses]
    witnesses[index] = value
    this.setState({ witnesses })
  }

  render () {
    const { signed, serializedTx, witnesses, signing, pushing } = this.state

    const actions = signed ? [this.openWitnessModal] : []

    return (
      <>
        <Modal
          ref={this.modal}
          h100
          title='Transaction'
          textConfirm={signed ? 'Push transaction' : 'Sign transaction'}
          pending={signing ? 'Signing...' : pushing && 'Pushing...'}
          onConfirm={signed ? this.pushTransaction : this.signTransaction}
          textActions={signed ? ['Witnesses'] : []}
          onActions={actions}
        >
          <Highlight language='javascript' className='pre-box bg2 pre-wrap break-all small' element='pre'>
            <code>{serializedTx}</code>
          </Highlight>
          <div className='mt-2'>
            {this.renderSigners()}
          </div>
        </Modal>
        <Modal
          ref={this.witnessModal}
          title='Witnesses'
          textCancel='Close'
        >
          {witnesses.map((w, index) => (
            <DebouncedFormGroup
              key={`witness-input-${index}`}
              size='sm'
              label={`Witness ${index + 1}`}
              className='code'
              value={w}
              onChange={this.onChangeWitness(index)}
            />
          ))}
        </Modal>
      </>
    )
  }
}
