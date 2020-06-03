import React, { PureComponent } from 'react'

import {
  Modal,
  Button,
} from '@obsidians/ui-components'

import moment from 'moment'

import ckbDebugger from './ckbDebugger'

export default class CkbDebuggerWindow extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      debugging: false,
      result: null,
      debugMsgs: {}
    }
    this.modal = React.createRef()
  }

  componentDidMount () {
    ckbDebugger.window = this
  }

  openDebugger = () => {
    this.modal.current.openModal()
    this.setState({ debugMsgs: {}, result: null })
  }

  pushDebugMsg = ({ hash, message }) => {
    this.setState({
      debugMsgs: {
        ...this.state.debugMsgs,
        [hash]: [...(this.state.debugMsgs[hash] || []), { ts: moment().format('HH:mm:ss:SSS'), message }]
      }
    })
  }

  setDebugResult = result => {
    this.setState({ result })
  }

  renderDebugResult = (result, debugging) => {
    if (debugging) {
      return (
        <div>
          <Button size='sm' color='warning' key='debugging'>
            <i className='fas fa-spin fa-spinner mr-1' />Debugging...
          </Button>
        </div>
      )
    }

    if (!result) {
      return null
    }

    if (result.error) {
      return (
        <div>
          <Button size='sm' color='danger' key='debug-fail' className='mb-2'>
            <i className='far fa-times mr-1' />Fail
          </Button>
          <div style={{ wordBreak: 'break-all' }}>
            {result.error}
          </div>
        </div>
      )
    }

    return (
      <div className='d-flex flex-row align-items-center mb-2'>
        <Button size='sm' color='success' key='debug-success' className='mr-2'>
          <i className='far fa-check mr-1' />Success
        </Button>
        {result.cycle} cycles
      </div>
    )
  }

  renderDebugGroups = debugMsgs => {
    return Object.keys(debugMsgs).map(hash => {
      return (
        <div key={`debug-group-${hash}`}>
          <div className='text-overflow-dots'>{hash}</div>
          <pre className='pre-box small'>
            {this.renderDebugMsgs(debugMsgs[hash])}
          </pre>
        </div>
      )
    })
  }

  renderDebugMsgs = msgs => {
    return msgs.map((msg, index) => {
      return (
        <div key={`debug-msg-${index}`} className='break-all pre-wrap'>
          <span className='text-info'>[{msg.ts}] </span>{msg.message}
        </div>
      )
    })
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        title='CKB Script Debugger'
        textCancel='Close'
      >
        {this.renderDebugResult(this.state.result, this.state.debugging)}
        {this.renderDebugGroups(this.state.debugMsgs)}
      </Modal>
    )
  }
}
