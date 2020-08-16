import React, { PureComponent } from 'react'

import {
  Button,
  UncontrolledTooltip
} from '@obsidians/ui-components'

import ckbCompiler from './ckbCompiler'

export default class CkbTestButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      testing: false
    }
  }

  componentDidMount () {
    ckbCompiler.testButton = this
  }

  onClick = () => {
    if (!this.state.testing) {
      this.props.onClick()
    }
  }

  render () {
    const {
      className,
      size = 'sm',
      color = 'default',
    } = this.props

    let icon = <span key='test-icon'><i className='fas fa-vial' /></span>
    if (this.state.testing) {
      icon = (
        <React.Fragment>
          <span key='testing-icon'><i className='fas fa-spinner fa-spin' /></span>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <Button
          color={color}
          size={size}
          id='tooltip-test-btn'
          key='tooltip-test-btn'
          className={`hover-block ${className}`}
          onClick={this.onClick}
        >
          {icon}
        </Button>
        <UncontrolledTooltip trigger='hover' delay={0} placement='bottom' target='tooltip-test-btn'>
          { this.state.testing ? 'Testing' : 'Test'}
        </UncontrolledTooltip>
      </React.Fragment>
    )
  }
}