import React, { PureComponent } from 'react'

import {
  Button,
  Modal,
} from '@obsidians/ui-components'

import { CkbOutputCell, CkbCapacity, CkbScript, CkbData } from '@obsidians/ckb-tx-builder'

import CapacityInput from '../../components/inputs/CapacityInput'
import ScriptInput from '../../components/inputs/ScriptInput'
import DataInput from '../../components/inputs/DataInput'

export default class CkbOutputNewButton extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      errorInCapacity: true,
      errorInLock: true,
      errorInType: false,
      errorInData: false,
    }

    this.modal = React.createRef()
    this.capacityInput = React.createRef()
  }

  onClickButton = () => {
    this.capacity = new CkbCapacity()
    this.lock = new CkbScript()
    this.type = new CkbScript()
    this.data = new CkbData()
    this.modal.current.openModal()
    setTimeout(() => this.capacityInput.current.focus(), 100)
  }

  onConfirmNewOutput = async () => {
    const outputCell = new CkbOutputCell(this.capacity, this.lock, this.type, this.data)
    this.props.onNewOutput(outputCell)
    this.setState({
      errorInCapacity: true,
      errorInLock: true,
      errorInType: false,
      errorInData: false,
    })
    this.modal.current.closeModal()
  }

  onChangeCapacity = (errorInCapacity, capacity) => {
    this.setState({ errorInCapacity: errorInCapacity || !capacity })
    this.capacity = capacity
  }

  onChangeLock = (errorInLock, lock) => {
    this.setState({ errorInLock })
    this.lock = lock
  }

  onChangeType = (errorInType, type) => {
    this.setState({ errorInType })
    this.type = type
  }

  onChangeData = (errorInData, data) => {
    this.setState({ errorInData })
    this.data = data
  }

  render () {
    const { errorInCapacity, errorInLock, errorInType, errorInData } = this.state

    return (
      <React.Fragment>
        <Button size='sm' color='success' className='ml-2' onClick={this.onClickButton}>
          <i className='fas fa-plus mr-1' />New
        </Button>
        <Modal
          ref={this.modal}
          title='New Output'
          onConfirm={this.onConfirmNewOutput}
          confirmDisabled={errorInCapacity || errorInLock || errorInType || errorInData}
        >
          <CapacityInput ref={this.capacityInput} onChange={this.onChangeCapacity} />
          <ScriptInput
            label='Lock script'
            depCells={this.props.depCells}
            onChange={this.onChangeLock}
          />
          <ScriptInput
            label='Type script'
            noAddress
            depCells={this.props.depCells}
            onChange={this.onChangeType}
          />
          <DataInput onChange={this.onChangeData} />
        </Modal>
      </React.Fragment>
    )
  }
}
