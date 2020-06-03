import React, { PureComponent } from 'react'

import { Card } from '@obsidians/ui-components'
import notification from '@obsidians/notification'

import CkbVersionManager from './CkbVersionManager'
import CreateInstanceButton from './CreateInstanceButton'

import InstanceHeader from './InstanceHeader'
import InstanceRow from './InstanceRow'

import ckbInstancesChannel from './ckbInstancesChannel'

export default class InstanceList extends PureComponent {
  static defaultProps = {
    chain: 'dev',
    onLifecycle: () => {},
  }

  constructor (props) {
    super(props)

    this.state = {
      lifecycle: 'stopped',
      runningInstance: '',
      instances: [],
    }
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
    const instances = await ckbInstancesChannel.invoke('list', this.props.chain)
    this.setState({ instances })
  }

  onNodeLifecycle = (name, lifecycle) => {
    const runningState = {
      lifecycle,
      runningInstance: name,
    }
    this.setState(runningState)
    if (lifecycle === 'stopped') {
      notification.info(`CKB Instance Stopped`, `CKB instance <b>${name}</b> stops to run.`)
    } else if (lifecycle === 'started') {
      notification.success(`CKB Instance Started`, `CKB instance <b>${name}</b> is running now.`)
    }
    this.props.onLifecycle(runningState)
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
      />
    ))
  }

  render () {
    return (
      <Card
        title={`CKB Instances (${this.props.chain})`}
        right={(
          <React.Fragment>
            <CkbVersionManager
              onRefresh={this.refreshInstances}
            />
            <CreateInstanceButton
              className='ml-2'
              chain={this.props.chain}
              onRefresh={this.refreshInstances}
            />
          </React.Fragment>
        )}
      >
        <div className='flex-grow-1 overflow-auto'>
          {this.renderTable()}
        </div>
      </Card>
    )
  }
}
