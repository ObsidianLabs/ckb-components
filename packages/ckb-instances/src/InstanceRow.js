import React, { PureComponent } from 'react'

import {
  Button,
  DeleteButton,
} from '@obsidians/ui-components'

import { NodeButton, NodeStatus } from '@obsidians/ckb-node'

import instanceChannel from './instanceChannel'

export default class InstanceRow extends PureComponent {
  renderStartStopBtn = (name, version, miner) => {
    if (this.props.lifecycle !== 'stopped' && this.props.runningInstance !== name) {
      return null
    }
    return (
      <NodeButton
        name={name}
        version={version}
        miner={miner}
        onLifecycle={(lifecycle, params) => this.props.onNodeLifecycle(name, lifecycle, params)}
      />
    )
  }

  renderVersionBtn = version => {
    return (
      <div className='btn btn-sm btn-secondary'>
        <i className='fas fa-code-merge mr-1' />
        <b>{version}</b>
      </div>
    )
  }

  renderChainBtn = chain => {
    return (
      <div className='btn btn-sm btn-secondary'>
        <b>{chain}</b>
      </div>
    )
  }

  renderBlockNumber = name => {
    if (this.props.runningInstance !== name) {
      return null
    }
    return <NodeStatus />
  }

  deleteInstance = async name => {
    await instanceChannel.invoke('delete', name)
    this.props.onRefresh()
  }

  render () {
    const data = this.props.data
    const miner = this.props.miner
    const name = data.Name.substr(4)
    const labels = data.Labels

    return (
      <tr>
        <td>
          <div className='flex-row align-items-center'>
            {name}
          </div>
        </td>
        <td>{this.renderStartStopBtn(name, labels.version, miner)}</td>
        <td>{this.renderVersionBtn(labels.version)}</td>
        <td>{this.renderChainBtn(labels.chain)}</td>
        <td>{this.renderBlockNumber(name)}</td>
        <td align='right'>
          <DeleteButton onConfirm={() => this.deleteInstance(name)} />
        </td>
      </tr>
    )
  }
}
