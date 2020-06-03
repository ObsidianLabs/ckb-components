import React, { PureComponent } from 'react'
import {
  FormGroup,
  ButtonOptions,
} from '@obsidians/ui-components'

import { CkbData, lib } from '@obsidians/ckb-tx-builder'

import NonHexInput from './NonHexInput'
import HexInput from './HexInput'
import FileInput from './FileInput'

export default class DataInput extends PureComponent {
  constructor (props) {
    super(props)

    this.state = this.stateFromData(props.initialData)

    this.input = React.createRef()

    this.options = [
      { key: 'utf8', icon: 'fas fa-font-case', text: 'UTF8' },
      { key: 'uint8', text: 'uint8' },
      { key: 'uint16', text: 'uint16' },
      { key: 'uint32', text: 'uint32' },
      { key: 'uint64', text: 'uint64' },
      { key: 'uint128', text: 'uint128' },
      { key: 'uint256', text: 'uint256' },
      { key: 'hex', icon: 'fas fa-code', text: 'Hex' },
    ]
    if (!props.noFile) {
      this.options.push({ key: 'file', icon: 'fas fa-file', text: 'File' })
    }
  }

  stateFromData = data => {
    if (!data) {
      return {
        format: 'utf8',
        value: '',
        hex: '',
        filePath: '',
      }
    }
    const { format, value } = data
    return {
      format,
      value: format !== 'hex' && format !== 'file' ? value : '',
      hex: format === 'hex' ? value : '',
      filePath: format === 'file' ? value : '',
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState === this.state) {
      return
    }

    const { format, value, hex, filePath } = this.state

    let ckbDataParam = value
    if (format === 'file') {
      ckbDataParam = filePath
    } else if (format === 'hex') {
      ckbDataParam = hex
    }

    let data
    try {
      data = new CkbData(ckbDataParam, format)
    } catch (e) {
      this.props.onChange(true)
      return
    }
    this.props.onChange(false, data)
  }

  focus = () => this.input.current && this.input.current.focus()

  updateData = data => {
    this.setState(this.stateFromData(data))
  }

  toggleFormat = format => {
    if (format === this.state.format) {
      return
    }

    if (format.startsWith('uint') && !this.state.value) {
      this.setState({ value: '0' })
    }

    if (format === 'file') {

    } else if (format === 'hex') {
      try {
        const hex = lib.toHex(this.state.value, this.state.format)
        this.setState({ hex })
      } catch (e) {
        this.setState({ hex: '' })
      }
    } else if (this.state.format === 'hex') {
      try {
        const value = lib.fromHex(this.state.hex, format)
        this.setState({ value })
      } catch (e) {}
    }
    
    this.setState({ format }, () => {
      this.input.current && this.input.current.focus()
    })
  }
  
  onChange = value => this.setState({ value })

  onChangeHex = hex => this.setState({ hex })

  onSelectFile = filePath => this.setState({ filePath })

  renderInput = () => {
    const { format } = this.state
    if (format === 'file') {
      return <FileInput filePath={this.state.filePath} onSelectFile={this.onSelectFile} />
    } else if (format === 'hex') {
      return <HexInput ref={this.input} value={this.state.hex} onChange={this.onChangeHex} />
    } else {
      return <NonHexInput ref={this.input} format={format} value={this.state.value} onChange={this.onChange} />
    }
  }

  render () {
    return (
      <FormGroup>
        <div className='mb-1'>Data</div>
        <ButtonOptions
          size='sm'
          options={this.options}
          selected={this.state.format}
          onSelect={this.toggleFormat}
        />
        {this.renderInput()}
      </FormGroup>
    )
  }
}
