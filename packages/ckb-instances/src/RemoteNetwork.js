import React, { PureComponent } from 'react'

import {
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

import nodeManager from '@obsidians/ckb-node'
import moment from 'moment'

export default class RemoteNetwork extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      nodeInfo: null,
      blockchainInfo: null,
      block: null,
      epoch: null,
    }
  }

  componentDidMount () {
    this.refresh()
    this.h = setInterval(() => this.refreshBlock(), 1000)
  }

  componentDidUpdate (prevProps) {
    if (this.props.chain !== prevProps.chain) {
      this.refresh()
    }
  }

  componentWillUnmount () {
    clearInterval(this.h)
    this.h = undefined
  }

  async refresh () {
    this.setState({
      nodeInfo: null,
      blockchainInfo: null,
      block: null,
    })
    if (!nodeManager.sdk) {
      return
    }
    const nodeInfo = await nodeManager.sdk?.ckbClient.core.rpc.localNodeInfo()
    const blockchainInfo = await nodeManager.sdk?.ckbClient.core.rpc.getBlockchainInfo()
    this.setState({ nodeInfo, blockchainInfo })
  }

  async refreshBlock () {
    if (!nodeManager.sdk) {
      return
    }
    const block = await nodeManager.sdk?.ckbClient.core.rpc.getTipHeader()
    const epoch = await nodeManager.sdk?.ckbClient.core.rpc.getCurrentEpoch()
    this.setState({ block, epoch })
  }

  render () {
    const { chain } = this.props

    return (
      <div className='d-flex flex-1 flex-column overflow-auto'>
        <div className='d-flex'>
          <div className='col-6 p-0 border-right-black'>
            <TableCard title={`CKB Instances (${chain})`}>
              <TableCardRow
                name='Node URL'
                badge={nodeManager.sdk?.ckbClient.nodeUrl}
                badgeColor='primary'
              />
              <TableCardRow
                name='Chain'
                badge={this.state.blockchainInfo?.chain}
              />
              <TableCardRow
                name='Chain ID'
                badge={this.state.nodeInfo?.nodeId}
              />
              <TableCardRow
                name='Version'
                badge={this.state.nodeInfo?.version}
              />
            </TableCard>
          </div>
          <div className='col-6 p-0'>
            <TableCard title='Blocks'>
              <TableCardRow
                name='Block Number'
                badge={this.state.block && parseInt(this.state.block.number, 16)}
              />
              <TableCardRow
                name='Timestamp'
                badge={this.state.block && moment(parseInt(this.state.block.timestamp, 16)).format('LL LTS')}
              />
              <TableCardRow
                name='Epoch'
                badge={this.state.epoch && Number(this.state.epoch.number)}
              />
              <TableCardRow
                name='Difficulty'
                badge={this.state.blockchainInfo && `${(Number(this.state.blockchainInfo.difficulty)/1000000).toFixed(2)} MH`}
              />
            </TableCard>
          </div>
        </div>
        <div className='d-flex flex-fill'>
          <div className='col-12 p-0 border-top-black'>
          </div>
        </div>
      </div>
    )
  }
}


