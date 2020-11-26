import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
  TableCard,
  TableCardRow,
  IconButton,
} from '@obsidians/ui-components'

import redux from '@obsidians/redux'

import moment from 'moment'
import networkManager from './networkManager'

export default class CustomNetwork extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      nodeUrl: '',
      indexerUrl: '',
      explorerUrl: '',
      nodeInfo: null,
      blockchainInfo: null,
      block: null,
      epoch: null,
    }
    this.modal = React.createRef()
  }

  componentDidMount () {
    if (!this.props.customNetwork) {
      this.modal.current.openModal()
    } else {
      const { node, indexer, explorer } = this.props.customNetwork
      this.setState({ nodeUrl: node, indexerUrl: indexer, explorerUrl: explorer })
      this.tryCreateSdk({ url: node, indexer, explorer })
    }
  }

  componentWillUnmount () {
    if (this.h) {
      clearInterval(this.h)
      this.h = undefined
    }
  }

  tryCreateSdk = async ({ url, indexer, explorer }) => {
    const blockchainInfo = await networkManager.updateCustomNetwork({ url, indexer, explorer })
    if (blockchainInfo) {
      this.refresh(blockchainInfo)
      if (this.h) {
        clearInterval(this.h)
      }
      this.h = setInterval(() => this.refreshBlock(), 3000)
    }
    return !!blockchainInfo
  }

  onConfirmCustomNetwork = async () => {
    const valid = await this.tryCreateSdk({
      url: this.state.nodeUrl,
      indexer: this.state.indexerUrl,
      explorer: this.state.explorerUrl,
    })

    if (!valid) {
      return
    }

    redux.dispatch('UPDATE_GLOBAL_CONFIG', {
      customNetwork: {
        node: this.state.nodeUrl,
        indexer: this.state.indexerUrl,
        explorer:  this.state.explorerUrl,
      }
    })
    this.modal.current.closeModal()
  }

  async refresh (blockchainInfo) {
    this.setState({
      nodeInfo: null,
      blockchainInfo,
      block: null,
      epoch: null,
    })
    if (!networkManager.sdk) {
      return
    }
    const nodeInfo = await networkManager.sdk?.ckbClient.rpc.local_node_info()
    this.setState({ nodeInfo })
  }

  async refreshBlock () {
    if (!networkManager.sdk) {
      return
    }
    const block = await networkManager.sdk?.ckbClient.rpc.get_tip_header()
    const epoch = await networkManager.sdk?.ckbClient.rpc.get_current_epoch()
    this.setState({ block, epoch })
  }

  renderEditButton = () => {
    return (
      <IconButton
        color='default'
        className='text-muted'
        icon='fas fa-cog'
        onClick={() => this.modal.current.openModal()}
      />
    )
  }

  render () {
    return <>
      <div className='d-flex flex-1 flex-column overflow-auto'>
        <div className='d-flex'>
          <div className='col-6 p-0 border-right-black'>
            <TableCard title='Custom Network' right={this.renderEditButton()}>
              <TableCardRow
                name='Node URL'
                badge={this.props.customNetwork?.node}
                badgeColor='primary'
              />
              <TableCardRow
                name='Indexer URL'
                badge={this.props.customNetwork?.indexer}
                badgeColor='primary'
              />
              {
                this.props.customNetwork?.explorer &&
                <TableCardRow
                  name='Explorer URL'
                  badge={this.props.customNetwork?.explorer}
                  badgeColor='primary'
                />
              }
              <TableCardRow
                name='Chain'
                badge={this.state.blockchainInfo?.chain}
              />
              <TableCardRow
                name='Node ID'
                badge={this.state.nodeInfo?.node_id}
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
      <Modal
        ref={this.modal}
        title='Custom Network'
        onConfirm={this.onConfirmCustomNetwork}
      >
        <DebouncedFormGroup
          label='Node URL'
          placeholder='http://localhost:8114'
          maxLength='200'
          value={this.state.nodeUrl}
          onChange={nodeUrl => this.setState({ nodeUrl })}
        />
        <DebouncedFormGroup
          label='Indexer URL'
          placeholder='http://localhost:8116'
          maxLength='200'
          value={this.state.indexerUrl}
          onChange={indexerUrl => this.setState({ indexerUrl })}
        />
        <DebouncedFormGroup
          label='Explorer URL'
          placeholder='Optional'
          maxLength='200'
          value={this.state.explorerUrl}
          onChange={explorerUrl => this.setState({ explorerUrl })}
        />
      </Modal>
    </>
  }
}


