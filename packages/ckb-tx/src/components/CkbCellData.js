import React, { PureComponent } from 'react'
import {
  Modal,
  Button,
} from '@obsidians/ui-components'

import DataInput from './inputs/DataInput'

export default class CkbCellData extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      errorInData: false,
    }
    this.data = props.data
    this.modal = React.createRef()
    this.input = React.createRef()
  }

  openModal = () => {
    this.modal.current.openModal()
    setTimeout(() => this.input.current.focus(), 100)
  }

  onModifyData = () => {
    this.props.onModifyData(this.data)
    this.modal.current.closeModal()
  }

  onChangeData = (errorInData, data) => {
    this.setState({ errorInData })
    this.data = data
  }

  renderModifyData = () => {
    if (!this.props.onModifyData) {
      return null
    }

    return (
      <React.Fragment>
        <Button
          size='sm'
          color='transparent'
          className='hover-show'
          onClick={this.openModal}
        >
          <i className='text-muted fas fa-pencil-alt' />
        </Button>
        <Modal
          ref={this.modal}
          title='Modify Data'
          onConfirm={this.onModifyData}
          confirmDisabled={this.state.errorInData}
        >
          <DataInput
            ref={this.input}
            initialData={this.props.data}
            onChange={this.onChangeData}
          />
        </Modal>
      </React.Fragment>
    )
  }

  render () {
    const { data } = this.props

    if (!data || !data.size()) {
      return (
        <div className='d-flex flex-row align-items-center justify-content-between'>
          <div className='text-muted'>(None)</div>
          {this.renderModifyData()}
        </div>
      )
    }

    const { format } = data

    let icon
    let text = data.display(100)
    if (format === 'file') {
      icon = <span key='icon-file' className='mr-1'><i className='fas fa-file' /></span>
    } else if (format === 'hex') {
      icon = <span key='icon-hex' className='mr-1'><i className='fas fa-code' /></span>
      text = <code>{data.display(100)}</code>
    } else if (format === 'utf8') {
      icon = <span key='icon-utf8' className='mr-1'><i className='fas fa-font-case' /></span>
    } else if (format.startsWith('uint')) {
      icon = null
    }

    return (
      <div className='d-flex flex-row align-items-center justify-content-between h-100'>
        <div className='small text-overflow-dots'>
          {icon}
          {text}
        </div>
        {this.renderModifyData()}
      </div>
    )
  }
}
