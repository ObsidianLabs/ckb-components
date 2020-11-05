import React, { PureComponent } from 'react'

import {
  Modal,
  Button,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

import { CkbCapacity, CkbData } from '@obsidians/ckb-objects'

import CapacityInput from '../../components/inputs/CapacityInput'
import DataInput from '../../components/inputs/DataInput'

import ckbTxManager from '../../ckbTxManager'

export default class CkbNewCellButton extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      errorInCapacity: false,
      errorInData: false,
      errorInFee: false,
      minCapacity: new CkbCapacity(61),
    }

    this.capacity = null
    this.data = null
    this.fee = null

    this.modal = React.createRef()
    this.capacityInput = React.createRef()
  }

  openModal = () => {
    this.modal.current.openModal()
    setTimeout(() => this.capacityInput.current.focus(), 100)
  }

  onChangeCapacity = (errorInCapacity, capacity) => {
    this.setState({ errorInCapacity })
    this.capacity = capacity
  }

  onChangeData = (errorInData, data) => {
    this.data = data
    const tx = window.txBuilder.newTx()
      .to(this.props.address, this.capacity, data || new CkbData())
    this.setState({
      errorInData,
      minCapacity: tx.estimate().out
    })
  }

  onChangeFee = (errorInFee, fee) => {
    this.setState({ errorInFee })
    this.fee = fee
  }

  preview = async () => {
    const rawTx = window.txBuilder.newTx()
      .to(this.props.address, this.capacity, this.data || new CkbData())

    if (this.fee && this.fee.value) {
      rawTx.fee(this.fee)
    } else {
      rawTx.fee(0.001)
    }

    rawTx.from(this.props.address, this.capacity || this.state.minCapacity)

    try {
      ckbTxManager.visualizeTransaction(rawTx.generate())
    } catch (e) {
      notification.error('Error', e.message)
      return
    }
    this.modal.current.closeModal()
  }

  render () {
    const { minCapacity } = this.state
    const { errorInCapacity, errorInData, errorInFee } = this.state

    return <>
      <Button size='sm' color='success' className='ml-2' onClick={this.openModal}>
        <i className='fas fa-plus mr-1' />New Cell
      </Button>
      <Modal
        ref={this.modal}
        overflow
        title='New Cell'
        textConfirm='Preview'
        onConfirm={this.preview}
        confirmDisabled={errorInCapacity || errorInData || errorInFee}
      >
        <CapacityInput
          ref={this.capacityInput}
          onChange={this.onChangeCapacity}
          placeholder={`Minimal: ${minCapacity.toString()}`}
        />
        <DataInput initialData={this.data} onChange={this.onChangeData} />
        <CapacityInput
          label='Fee'
          onChange={this.onChangeFee}
          placeholder='Default: 0.001'
        />
      </Modal>
    </>
  }
}
