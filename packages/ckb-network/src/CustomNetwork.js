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
      const { node, indexer } = this.props.customNetwork
      this.setState({ nodeUrl: node, indexerUrl: indexer })
      this.tryCreateSdk({ url: node, indexer })
    }
  }

  componentWillUnmount () {
    if (this.h) {
      clearInterval(this.h)
      this.h = undefined
    }
  }

  tryCreateSdk = async ({ url, indexer }) => {
    const nodeInfo = await networkManager.createSdk({ url, indexer })
    if (nodeInfo) {
      this.refresh(nodeInfo)
      if (this.h) {
        clearInterval(this.h)
      }
      this.h = setInterval(() => this.refreshBlock(), 3000)
    }
    return !!nodeInfo
  }

  onConfirmCustomNetwork = async () => {
    const valid = await this.tryCreateSdk({
      url: this.state.nodeUrl,
      indexer: this.state.indexerUrl,
    })

    if (!valid) {
      return
    }

    redux.dispatch('UPDATE_GLOBAL_CONFIG', {
      customNetwork: {
        node: this.state.nodeUrl,
        indexer: this.state.indexerUrl,
      }
    })
    this.modal.current.closeModal()
  }

  async refresh (nodeInfo) {
    this.setState({
      nodeInfo,
      blockchainInfo: null,
      block: null,
      epoch: null,
    })
    if (!networkManager.sdk) {
      return
    }
    const blockchainInfo = await networkManager.sdk?.ckbClient.rpc.get_blockchain_info()
    this.setState({ blockchainInfo })
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
      <Modal
        ref={this.modal}
        title='Custom Network'
        onConfirm={this.onConfirmCustomNetwork}
      >
        <DebouncedFormGroup
          label='Node URL'
          placeholder='https://...'
          maxLength='200'
          value={this.state.nodeUrl}
          onChange={nodeUrl => this.setState({ nodeUrl })}
        />
        <DebouncedFormGroup
          label='Indexer URL'
          placeholder='https://...'
          maxLength='200'
          value={this.state.indexerUrl}
          onChange={indexerUrl => this.setState({ indexerUrl })}
        />
      </Modal>
    </>
  }
}


