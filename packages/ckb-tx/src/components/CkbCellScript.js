import React, { PureComponent } from 'react'
import {
  Modal,
  Button,
} from '@obsidians/ui-components'

import ScriptInput from './inputs/ScriptInput'

export default class CkbCellScript extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      errorInScript: false,
    }

    this.script = null
    this.modal = React.createRef()
  }

  openModal = () => {
    this.modal.current.openModal()
  }

  onModifyScript = () => {
    this.props.onModifyScript(this.script)
    this.modal.current.closeModal()
  }

  onChangeScript = (errorInScript, script) => {
    this.setState({ errorInScript })
    this.script = script
  }

  renderModifyScript = () => {
    if (!this.props.onModifyScript) {
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
        overflow
        title={`Modify ${this.props.type ? 'Type' : 'Lock'} Script`}
        onConfirm={this.onModifyScript}
        confirmDisabled={this.state.errorInScript}
      >
        <ScriptInput
          label={`${this.props.type ? 'Type' : 'Lock'} Script`}
          noAddress={this.props.type}
          initialScript={this.props.script}
          depCells={this.props.depCells}
          onChange={this.onChangeScript}
        />
      </Modal>
    </>
  }

  render () {
    const { script } = this.props

    if (!script || script.isNull) {
      return (
        <div className='d-flex flex-row align-items-center justify-content-between'>
          <div className='text-muted'>(None)</div>
          {this.renderModifyScript()}
        </div>
      )
    }

    if (script.isAddress()) {
      let icon = null
      if (script.isAddress({ secp256k1Only: true })) {
        icon = <span key='icon-address'><i className='fas fa-map-marker-alt' /></span>
      } else {
        icon = <span key='icon-wallet'><i className='fas fa-wallet' /></span>
      }

      return (
        <div className='d-flex flex-row align-items-center justify-content-between h-100'>
          <div className='d-flex overflow-hidden small'>
            <div className='flex-none mr-1 text-center' style={{ width: '0.9rem' }}>{icon}</div>
            <div className='text-overflow-dots'><code>{script.getAddress()}</code></div>
          </div>
          {this.renderModifyScript()}
        </div>
      )
    }

    const scriptHash = script.size() <= 1000
      ? <code>{script.hash}</code>
      : 'Hash skipped for large args.'

    return (
      <div className='d-flex flex-row align-items-center justify-content-between h-100'>
        <div className='small text-overflow-dots'>
          {scriptHash}
        </div>
        {this.renderModifyScript()}
      </div>
    )
  }
}