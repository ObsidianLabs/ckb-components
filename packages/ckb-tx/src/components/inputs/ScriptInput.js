import React, { PureComponent } from 'react'

import {
  FormGroup,
  ButtonOptions,
  DebouncedInput,
  Dropdown,
  FormText,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-objects'

import CkbWalletContext from '../../CkbWalletContext'

import AddressLockScriptInput from './AddressLockScriptInput'
import ArgsInput from './ArgsInput'

export default class ScriptInput extends PureComponent {
  static contextType = CkbWalletContext
  
  constructor (props) {
    super(props)

    this.script = new CkbScript(props.initialScript)
    let type
    if (props.initialScript) {
      if (props.noAddress) {
        type = this.script.hash_type
      } else {
        type = this.script.isAddress({ secp256k1Only: true }) ? 'address' : this.script.hash_type
      }
    } else {
      type = props.noAddress ? 'data' : 'address'
    }

    this.state = { type }

    this.options = [
      { key: 'data', text: 'Data' },
      { key: 'type', text: 'Type' },
    ]
    if (!props.noAddress) {
      this.options.unshift({ key: 'address', text: 'Address' })
    }
  }

  onChange = updater => {
    if (updater.type) {
      this.script.hash_type = updater.type === 'address' ? 'type' : updater.type
      this.setState({ type: updater.type })
    } else if (typeof updater.code_hash !== 'undefined') {
      this.script.code_hash = updater.code_hash
      this.forceUpdate()
    } else if (updater.args) {
      this.script.args = updater.args
      this.forceUpdate()
    }
    this.props.onChange(!this.script.isValid, this.script)
  }

  onAddressScript = (errorInScript, script) => {
    this.script = script || new CkbScript()
    this.forceUpdate()
    this.props.onChange(errorInScript, script)
  }

  renderScriptInput = () => {
    const type = this.state.type

    if (type === 'address') {
      return (
        <AddressLockScriptInput
          initialScript={this.script}
          onChange={this.onAddressScript}
          addressBook={this.context.addressBook}
        />
      )
    }

    const hashs = this.props.depCells.map(cell => cell[type].hash).filter(Boolean)

    return <>
      <DebouncedInput
        size='sm'
        inputGroupClassName='mb-2'
        addon={<span key='code-hash'><i className='fas fa-hashtag' /></span>}
        placeholder='Code Hash - hex string starts with 0x'
        maxLength='66'
        value={this.script.code_hash}
        invalid={!this.script.isValid || undefined}
        onChange={code_hash => this.onChange({ code_hash })}
      >
        <Dropdown
          header={`Deps' ${type} hash`}
          items={hashs}
          onChange={code_hash => this.onChange({ code_hash })}
        />
      </DebouncedInput>
      <ArgsInput
        args={this.script.args}
        onChange={args => this.onChange({ args })}
      />
    </>
  }

  renderScriptHash = () => {
    if (!this.script.code_hash || !this.script.isValid) {
      return null
    }
    if (this.script.size() > 1000) {
      return <FormText>Script hash calculation skipped due to large file size.</FormText>
    }
    return <FormText>Script hash: <code>{this.script.hash}</code></FormText>
  }

  render () {
    return (
      <FormGroup>
        <div className={this.props.addressOnly ? 'mb-2' : 'mb-1'}>
          {this.props.label}
        </div>
        {
          this.props.addressOnly ? null : (
            <ButtonOptions
              size='sm'
              options={this.options}
              selected={this.state.type}
              onSelect={type => this.onChange({ type })}
            />
          )
        }
        {this.renderScriptInput()}
        {this.renderScriptHash()}
      </FormGroup>
    )
  }
}
