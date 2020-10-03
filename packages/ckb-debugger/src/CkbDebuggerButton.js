import React, { PureComponent } from 'react'

import {
  Button,
  UncontrolledTooltip
} from '@obsidians/ui-components'

import ckbDebugger from './ckbDebugger'

export default class CkbDebuggerButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      debugging: false
    }
  }

  componentDidMount () {
    ckbDebugger.button = this
  }

  onClick = () => {
    if (this.state.debugging) {
      ckbDebugger.stop()
    } else if (this.props.onClick) {
      this.props.onClick()
    }
  }

  render () {
    const {
      className,
      size = 'sm',
      color = 'default',
    } = this.props

    let icon = this.state.debugging
      ? <span key='ckb-debugging-icon'><i className='fas fa-spinner fa-spin' /></span>
      : <span key='ckb-debug-icon'><i className='fas fa-bug' /></span>

    return <>
      <Button
        color={color}
        size={size}
        id='tooltip-ckb-debug-btn'
        key='tooltip-ckb-debug-btn'
        className={className}
        onClick={this.onClick}
      >
        {icon}
      </Button>
      <UncontrolledTooltip trigger='hover' delay={0} placement='bottom' target='tooltip-ckb-debug-btn'>
        { this.state.debugging ? 'Debugging' : `Debug`}
      </UncontrolledTooltip>
    </>
  }
}