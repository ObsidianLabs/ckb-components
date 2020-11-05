import React, { PureComponent } from 'react'

import {
  Modal,
  ToolbarButton,
  DebouncedFormGroup,
  Button,
} from '@obsidians/ui-components'

import { CkbLiveCell, CkbScript, CkbData, SIMPLE_UDT_CODE_HASH } from '@obsidians/ckb-objects'

import notification from '@obsidians/notification'
import { networkManager } from '@obsidians/ckb-network'

import CkbWalletContext from '../../CkbWalletContext'
import ckbTxManager from '../../ckbTxManager'

import ScriptInput from '../../components/inputs/ScriptInput'
import CapacityInput from '../../components/inputs/CapacityInput'
import IconInput from '../../components/inputs/IconInput'

export default class CkbMintUdtButton extends PureComponent {
  static contextType = CkbWalletContext

  constructor(props) {
    super(props)

    this.state = {
      udt: {},
      udtName: '',
      udtSymbol: '',
      udtIcon: '',
      errorInCapacity: true,
      errorInReceiver: true,
    }

    this.modal = React.createRef()
    this.udtInfoModal = React.createRef()
    this.capacityInput = React.createRef()
  }

  openModal = () => {
    let lock
    try {
      lock = new CkbScript(this.props.issuer)
    } catch (e) {
      notification.error('Error', 'Not a valid CKB address.')
      return
    }
    this.issuer = lock.hash
    ckbTxManager.getUdtInfo(lock.hash).then(udt => {
      this.setState({
        udt,
        udtName: udt.name || '',
        udtSymbol: udt.symbol || '',
        udtIcon: udt.icon || '',
      })
    })
    this.modal.current.openModal()
    setTimeout(() => this.capacityInput.current.focus(), 100)
  }

  onChangeCapacity = (errorInCapacity, capacity) => {
    this.setState({ errorInCapacity })
    this.capacity = capacity
  }

  onChangeReceiver = (errorInReceiver, lock) => {
    this.setState({ errorInReceiver })
    this.lock = lock
  }

  preview = async () => {
    const rawTx = this.context.txBuilder.newTx()

    try {
      const sudtCellInfo = await ckbTxManager.getCellInfo(SIMPLE_UDT_CODE_HASH)
      if (sudtCellInfo && sudtCellInfo.outPoint) {
        const cell = await networkManager.sdk.ckbClient.loadOutpoint(sudtCellInfo.outPoint)
        rawTx.provideDep(SIMPLE_UDT_CODE_HASH, new CkbLiveCell(cell))
      }
      
      const tx = rawTx
        .from(this.props.issuer, 142)
        .to(
          this.lock, 142,
          new CkbData(this.capacity.value, 'uint128'),
          new CkbScript('data', SIMPLE_UDT_CODE_HASH, new CkbData(this.issuer, 'hex'))
        )
        .generate()

      ckbTxManager.visualizeTransaction(tx)
    } catch (e) {
      notification.error('Error in transfer', e.message)
      return
    }
    this.modal.current.closeModal()
  }

  renderUdtIcon = udt => {
    return udt.icon ?
      <img src={udt.icon} className="mr-3" width="32" height="32"/> :
      <span key="udt-icon"><i className='fad fa-coins fa-2x mr-3'/></span>
  }

  renderUdtInfo = udt => {
    const udtSymbol = udt.symbol || '(Unknown)'
    const udtName = udt.name ? <span className='ml-1'>- {udt.name}</span> : ''
    return (
      <div key='udt-info' className='d-flex align-items-center mb-2'>
        {this.renderUdtIcon(udt)}
        <div>
          <div className='d-flex align-items-center'>
            <b>{udtSymbol}</b><span>{udtName}</span>
            <Button
              size='sm'
              color='default'
              className='text-muted ml-1 px-1 py-0'
              onClick={this.openUdtModal}
            >
              <i className='fas fa-pencil-alt' />
            </Button>
          </div>
          <div className='text-muted small'><code>{this.issuer}</code></div>
        </div>
      </div>
    )
  }

  openUdtModal = () => {
    this.udtInfoModal.current.openModal()
  }

  updateUdtInfo = () => {
    const udt = {
      name: this.state.udtName,
      symbol: this.state.udtSymbol,
      issuer: this.issuer,
      icon: this.state.udtIcon
    }
    this.setState({ udt })
    ckbTxManager.updateUdtInfo(udt)
    this.udtInfoModal.current.closeModal()
  }

  render () {
    const { udt, errorInCapacity, errorInReceiver } = this.state

    return <>
      <ToolbarButton
        id='navbar-mint-udt'
        size='md'
        icon='far fa-coins'
        tooltip='Mint UDT'
        onClick={this.openModal}
      />
      <Modal
        ref={this.modal}
        overflow
        title='Mint UDT'
        textConfirm='Preview'
        confirmDisabled={errorInCapacity || errorInReceiver}
        onConfirm={this.preview}
      >
        {this.renderUdtInfo(udt)}
        <CapacityInput ref={this.capacityInput} label='Amount' onChange={this.onChangeCapacity} decimals={0} />
        <ScriptInput label='Receiver' addressOnly onChange={this.onChangeReceiver} />
      </Modal>
      <Modal
        ref={this.udtInfoModal}
        overflow
        title='Update UDT Information'
        textConfirm='Update'
        onConfirm={this.updateUdtInfo}
      >
        <DebouncedFormGroup
          label='Symbol'
          value={this.state.udtSymbol}
          onChange={udtSymbol => this.setState({ udtSymbol })}
        />
        <DebouncedFormGroup
          label='Name'
          value={this.state.udtName}
          onChange={udtName => this.setState({ udtName })}
        />
        <IconInput
          value={this.state.udtIcon}
          onChange={udtIcon => this.setState({ udtIcon })}
        />
      </Modal>
    </>
  }
}
