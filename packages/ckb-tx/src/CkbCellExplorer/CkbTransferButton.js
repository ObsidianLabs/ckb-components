import React, { PureComponent } from 'react'

import {
  Modal,
  ToolbarButton,
  FormGroup,
  Label,
  CustomInput,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { CkbLiveCell, CkbScript, SIMPLE_UDT_CODE_HASH } from '@obsidians/ckb-tx-builder'
import { networkManager } from '@obsidians/ckb-network'

import CkbWalletContext from '../CkbWalletContext'
import ckbTxManager from '../ckbTxManager'

import ScriptInput from '../components/inputs/ScriptInput'
import CapacityInput from '../components/inputs/CapacityInput'

export default class CkbTransferButton extends PureComponent {
  static contextType = CkbWalletContext

  constructor(props) {
    super(props)

    this.state = {
      udts: [],
      token: 'CKB',
      errorInCapacity: true,
      errorInReceiver: true,
    }

    this.modal = React.createRef()
    this.capacityInput = React.createRef()
  }

  openModal = () => {
    try {
      new CkbScript(this.props.sender)
    } catch (e) {
      notification.error('Error', 'Not a valid CKB address.')
      return
    }
    this.modal.current.openModal()
    setTimeout(() => this.capacityInput.current.focus(), 100)
    ckbTxManager.loadUdtManifest().then(udts => this.setState({ udts }))
  }

  onChangeCapacity = (errorInCapacity, capacity) => {
    this.setState({ errorInCapacity })
    this.capacity = capacity
  }

  onChangeReceiver = (errorInReceiver, lock) => {
    this.setState({ errorInReceiver })
    this.lock = lock
  }

  preview = () => {
    if (this.state.token === 'CKB') {
      this.previewCkbTransfer()
    } else {
      this.previewUdtTransfer()
    }
  }

  previewCkbTransfer = async () => {
    if (this.props.sender === this.lock.getAddress()) {
      notification.error('Error in transfer', 'Cannot transfer to yourself.')
      return
    }
    try {
      const tx = window.txBuilder.newTx()
        .transfer(this.props.sender, this.lock, this.capacity)
        .generate()

      ckbTxManager.visualizeTransaction(tx)
    } catch (e) {
      notification.error('Error in transfer', e.message)
      return
    }
    this.modal.current.closeModal()
  }

  previewUdtTransfer = async () => {
    if (this.props.sender === this.lock.getAddress()) {
      notification.error('Error in transfer', 'Cannot transfer to yourself.')
      return
    }
    const rawTx = window.txBuilder.newTx()

    try {
      const sudtCellInfo = await ckbTxManager.getCellInfo(SIMPLE_UDT_CODE_HASH)
      if (sudtCellInfo && sudtCellInfo.outPoint) {
        const cell = await networkManager.sdk.ckbClient.loadOutpoint(sudtCellInfo.outPoint)
        rawTx.provideDep(SIMPLE_UDT_CODE_HASH, new CkbLiveCell(cell))
      }
      
      const tx = rawTx
        .transferUdt(this.props.sender, this.lock, this.capacity.value, this.state.token)
        .generate()

      ckbTxManager.visualizeTransaction(tx)
    } catch (e) {
      notification.error('Error in transfer', e.message)
      return
    }
    this.modal.current.closeModal()
  }

  render () {
    const { udts, token, errorInCapacity, errorInReceiver } = this.state

    return <>
      <ToolbarButton
        id='navbar-transfer'
        size='md'
        icon='fas fa-sign-out-alt'
        tooltip='Transfer'
        onClick={this.openModal}
      />
      <Modal
        ref={this.modal}
        overflow
        title='Transfer'
        textConfirm='Preview'
        confirmDisabled={errorInCapacity || errorInReceiver}
        onConfirm={this.preview}
      >
        <FormGroup>
          <Label>Token</Label>
          <CustomInput
            id='transfer-token'
            type='select'
            value={token}
            onChange={event => this.setState({ token: event.target.value })}
          >
            <option value='CKB'>CKB</option>
            {udts.map(udt => (
              <option key={`transfer-token-${udt.issuer}`} value={udt.issuer}>
                [UDT] {udt.symbol ? `${udt.symbol}${udt.name ? ` - ${udt.name}` : ''}` : udt.issuer}
              </option>
            ))}
          </CustomInput>
        </FormGroup>
        <CapacityInput ref={this.capacityInput} label='Amount' onChange={this.onChangeCapacity} decimals={token === 'CKB' ? 8 : 0} />
        <ScriptInput label='Receiver' addressOnly onChange={this.onChangeReceiver} />
      </Modal>
    </>
  }
}
