import React, { PureComponent } from 'react'

import {
  Modal,
  MultiSelect,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import { CkbArgs, CkbData } from '@obsidians/ckb-tx-builder'

import DataInput from './DataInput'

const optionItemFromData = data => {
  const { format, value } = data

  let icon = null
  let label = value.length > 10 ? `${value.substr(0, 8)}...` : value

  if (format === 'file') {
    icon = <i className='fas fa-file mr-1' />
    label = fileOps.current.path.parse(value).base
  } else if (format === 'utf8') {
    icon = <i className='fas fa-font-case mr-1'/>
  } else if (format === 'hex') {
    icon = <i className='fas fa-code mr-1'/>
  }

  return {
    data,
    value: data.toString(),
    label: <span key={`arg-${format}`}>{icon}{label}</span>
  }
}

const getFileArg = async defaultPath => {
  const file = await fileOps.current.openNewFile(defaultPath)
  return optionItemFromData(new CkbData(file.path, 'file'))
}

export default class ArgsInput extends PureComponent {
  constructor (props) {
    super(props)

    this.modal = React.createRef()
    this.input = React.createRef()
    
    this.state = {
      errorInData: false,
    }

    this.options = [
      {
        label: 'Enter Manually',
        options: [
          { label: 'Enter Arg...', getValue: this.getTextArg },
        ]
      },
      { type: 'divider' },
      {
        label: 'File',
        options: [
          { label: 'Select File...', getValue: getFileArg }
        ]
      },
    ]
  }

  onClickLabel = async ({ data }) => {
    if (data.format === 'file') {
      return await getFileArg(fileOps.current.path.parse(data.value).dir)
    }
    this.data = data
    this.modal.current.openModal()
    setTimeout(() => {
      this.input.current.focus()
      this.input.current.updateData(data)
    }, 100)
    return new Promise(resolve=> this.onResolve = resolve)
  }

  getTextArg = async () => {
    this.modal.current.openModal()
    setTimeout(() => this.input.current.focus(), 100)
    return new Promise(resolve=> this.onResolve = resolve)
  }

  onConfirm = () => {
    this.onResolve(optionItemFromData(this.data))
    this.input.current.updateData()
    this.modal.current.closeModal()
  }

  onChangeData = (errorInData, data) => {
    this.setState({ errorInData })
    this.data = data
  }

  onChange = items => {
    this.props.onChange(new CkbArgs(items.map(item => item.data)))
  }

  render () {
    return (
      <React.Fragment>
        <MultiSelect
          addon='Args'
          options={this.options}
          value={this.props.args.value.map(optionItemFromData)}
          onChange={this.onChange}
          onClickLabel={this.onClickLabel}
        />
        <Modal
          ref={this.modal}
          title='Enter Arg...'
          onConfirm={this.onConfirm}
          confirmDisabled={this.state.errorInData}
        >
          <DataInput
            ref={this.input}
            noFile
            initialData={this.data}
            onChange={this.onChangeData}
          />
        </Modal>
      </React.Fragment>
    )
  }
}