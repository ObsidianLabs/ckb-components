import React, { PureComponent } from 'react'

import {
  Button,
  UncontrolledTooltip,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '@obsidians/ui-components'

import ckbCompiler from './ckbCompiler'

import './style.scss'

const modeText = {
  debug: 'Debug',
  release: 'Release',
  'release-w-debug-output': 'Release w/ Output',
}

export default class CkbCompilerButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      building: false,
      mode: 'debug',
    }
  }

  componentDidMount () {
    ckbCompiler.button = this
  }

  onClick = () => {
    if (this.state.building) {
      ckbCompiler.stop()
    } else if (this.props.onClick) {
      this.props.onClick(this.state.mode)
    } else {
      ckbCompiler.build({})
    }
  }

  renderModeSwitcher = projectLanguage => {
    if (projectLanguage !== 'rust' || this.state.building) {
      return null
    }
    const mode = this.state.mode
    return (
      <UncontrolledDropdown direction='down'>
        <DropdownToggle tag='div' className='btn text-muted btn-compiler-dropdown hover-show'>
          <i className='fas fa-caret-down' />
        </DropdownToggle>
        <DropdownMenu className='dropdown-menu-sm'>
          <DropdownItem header>Build Mode</DropdownItem>
          <DropdownItem
            active={mode === 'debug'}
            onClick={() => this.setState({ mode: 'debug' })}
          >
            Debug
          </DropdownItem>
          <DropdownItem
            active={mode === 'release'}
            onClick={() => this.setState({ mode: 'release' })}
          >
            Release
          </DropdownItem>
          <DropdownItem
            active={mode === 'release-w-debug-output'}
            onClick={() => this.setState({ mode: 'release-w-debug-output' })}
          >
            Release with Debug Output
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  renderTooltipText = (version, projectLanguage) => {
    if (this.state.building) {
      return 'Stop Build'
    }
    if (projectLanguage === 'javascript') {
      return 'Build'
    }
    return `${modeText[this.state.mode]} (${version || 'none'})`
  }

  render () {
    const {
      version = 'none',
      className,
      size = 'sm',
      color = 'default',
      projectLanguage,
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
      <div className='p-relative hover-block'>
        <Button
          color={color}
          size={size}
          id='tooltip-ckb-build-btn'
          key='tooltip-ckb-build-btn'
          className={className}
          onClick={this.onClick}
        >
          {icon}
        </Button>
        {this.renderModeSwitcher(projectLanguage)}
        <UncontrolledTooltip trigger='hover' delay={0} placement='bottom' target='tooltip-ckb-build-btn'>
          {this.renderTooltipText(version, projectLanguage)}
        </UncontrolledTooltip>
      </div>
    )
  }
}