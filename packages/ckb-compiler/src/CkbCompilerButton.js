import React, { PureComponent } from 'react'

import {
  Button,
  UncontrolledTooltip
} from '@obsidians/ui-components'

import ckbCompiler from './ckbCompiler'

export default class CkbCompilerButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      building: false
    }
  }

  componentDidMount () {
    ckbCompiler.button = this
  }

  onClick = () => {
    if (this.state.building) {
      ckbCompiler.stop()
    } else if (this.props.onClick) {
      this.props.onClick()
    } else {
      ckbCompiler.build({})
    }
  }

  render () {
    const {
      version = 'none',
      className,
      size = 'sm',
      color = 'default',
    } = this.props

    let icon = <span key='ckb-build-icon'><i className='fas fa-hammer' /></span>
    if (this.state.building) {
      icon = (
        <React.Fragment>
          <span key='ckb-building-icon' className='hover-hide'><i className='fas fa-spinner fa-spin' /></span>
          <span key='ckb-stop-build-icon' className='hover-show'><i className='fas fa-stop-circle' /></span>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <Button
          color={color}
          size={size}
          id='tooltip-ckb-build-btn'
          key='tooltip-ckb-build-btn'
          className={`hover-block ${className}`}
          onClick={this.onClick}
        >
          {icon}
        </Button>
        <UncontrolledTooltip trigger='hover' delay={0} placement='bottom' target='tooltip-ckb-build-btn'>
          { this.state.building ? 'Stop Build' : `Build (${version})`}
        </UncontrolledTooltip>
      </React.Fragment>
    )
  }
}