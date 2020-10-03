import React, { PureComponent } from 'react'

import { Card } from '@obsidians/ui-components'
import redux from '@obsidians/redux'
import { DockerImageButton } from '@obsidians/docker'
import notification from '@obsidians/notification'

import CreateInstanceButton from './CreateInstanceButton'

import InstanceHeader from './InstanceHeader'
import InstanceRow from './InstanceRow'
import InstanceConfigModal from './InstanceConfigModal'

import instanceChannel from './instanceChannel'

export default class InstanceList extends PureComponent {
  static defaultProps = {
    chain: 'dev',
  }

  constructor (props) {
    super(props)

    this.state = {
      lifecycle: 'stopped',
      runningInstance: '',
      instances: [],
    }

    this.configModal = React.createRef()
  }

  componentDidMount() {
    this.refreshInstances()
  }
  
  componentDidUpdate (prevProps) {
    if (this.props.chain !== prevProps.chain) {
      this.refreshInstances()
    }
  }

  refreshInstances = async () => {
    const instances = await instanceChannel.invoke('list', this.props.chain)
    this.setState({ instances })
  }

  onNodeLifecycle = (name, lifecycle, params) => {
    const runningState = {
      lifecycle,
      params,
      runningInstance: name,
    }
    this.setState(runningState)
    if (lifecycle === 'stopped') {
      redux.dispatch('UPDATE_UI_STATE', { localNetwork: '' })
      notification.info(`CKB Instance Stopped`, `CKB instance <b>${name}</b> stops to run.`)
    } else if (lifecycle === 'started') {
      redux.dispatch('UPDATE_UI_STATE', { localNetwork: runningState })
      notification.success(`CKB Instance Started`, `CKB instance <b>${name}</b> is running now.`)
    }
  }

  renderTable = () => {
    return (
      <table className='table table-sm table-hover table-striped'>
        <InstanceHeader />
        <tbody>
          {this.renderTableBody()}
        </tbody>
      </table>
    )
  }

  renderTableBody = () => {
    if (!this.state.instances.length) {
      return <tr><td align='middle' colSpan={6}>(No CKB instance)</td></tr>
    }

    return this.state.instances.map(data => (
      <InstanceRow
        key={`instance-${data.Name}`}
        data={data}
        miner={this.props.chain === 'dev'}
        runningInstance={this.state.runningInstance}
        lifecycle={this.state.lifecycle}
        onRefresh={this.refreshInstances}
        onNodeLifecycle={this.onNodeLifecycle}
        onOpenConfig={data => this.configModal.current.openModal(data)}
      />
    ))
  }

  render () {
    return <>
      <Card
        title={`CKB Instances (${this.props.chain})`}
        right={<>
          <DockerImageButton
            channel={instanceChannel.ckbNode}
            icon='fas fa-server'
            title='CKB Version Manager'
            noneName='CKB node'
            modalTitle='CKB Version Manager'
            downloadingTitle='Downloading CKB'
          />
          <CreateInstanceButton
            className='ml-2'
            chain={this.props.chain}
            onRefresh={this.refreshInstances}
          />
        </>}
      >
        <div className='flex-grow-1 overflow-auto'>
          {this.renderTable()}
        </div>
      </Card>
      <InstanceConfigModal
        ref={this.configModal}
        onRefresh={this.refreshInstances}
      />
    </>
  }
}
