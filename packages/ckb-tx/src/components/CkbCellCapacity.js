import React, { PureComponent } from 'react'
import {
  Modal,
  Button,
  Badge,
} from '@obsidians/ui-components'

import CapacityInput from './inputs/CapacityInput'

export default class CkbCellCapacity extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      errorInCapacity: false,
    }

    this.capacity = null
    this.modal = React.createRef()
    this.capacityInput = React.createRef()
  }

  openModal = () => {
    this.modal.current.openModal()
    setTimeout(() => this.capacityInput.current.focus(), 100)
  }

  onModifyCapacity = () => {
    this.props.onModifyCapacity(this.capacity)
    this.modal.current.closeModal()
  }

  onChangeCapacity = (errorInCapacity, capacity) => {
    this.setState({ errorInCapacity: errorInCapacity || !capacity })
    this.capacity = capacity
  }

  renderModifyCapacity = () => {
    if (!this.props.onModifyCapacity) {
      return null
    }

    return <>
      <Button
        size='sm'
        color='transparent'
        className='text-muted hover-show ml-1'
        onClick={this.openModal}
      >
        <i className='fas fa-pencil-alt' />
      </Button>
      <Modal
        ref={this.modal}
        title='Modify Capacity'
        onConfirm={this.onModifyCapacity}
        confirmDisabled={this.state.errorInCapacity}
      >
        <CapacityInput ref={this.capacityInput} initial={this.props.capacity} onChange={this.onChangeCapacity} />
      </Modal>
    </>
  }

  render () {
    return (
      <div className='d-flex flex-row align-items-center h-100'>
        <div>
          <Badge color='success'>{this.props.capacity.display()}</Badge>
        </div>
        {this.renderModifyCapacity()}
      </div>
    )
  }
}