import React, { PureComponent } from 'react'

import {
  Badge,
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

export default class CkbAccountInfo extends PureComponent {
  state = {
    loading: true,
    lockScript: null,
  }

  componentDidMount () {
    this.refresh(this.props.wallet)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.wallet !== this.props.wallet) {
      this.refresh(this.props.wallet)
    }
  }

  refresh = async wallet => {
    this.setState({ loading: true })
    const lockScript = await wallet.lockScript()
    this.setState({ lockScript, loading: false })
  }

  render () {
    const { loading, lockScript } = this.state
    let loadingIcon
    if (loading) {
      loadingIcon = <span key='loading'><i className='fas fa-spin fa-spinner' /></span>
    }

    let testnetAddress = <span className='text-muted'>(n/a)</span>
    try {
      testnetAddress = <code>{lockScript.getAddress('ckt')}</code>
    } catch (e) {}

    let mainnetAddress = <span className='text-muted'>(n/a)</span>
    try {
      mainnetAddress = <code>{lockScript.getAddress('ckb')}</code>
    } catch (e) {}

    return (
      <TableCard title='Account Info'>
        <TableCardRow
          name='Addresses'
          icon='far fa-map-marker-alt'
        >
          <div className='d-flex flex-row align-items-center text-overflow-dots'>
            <Badge color='info' className='mr-2'>Testnet</Badge>
            {loadingIcon || testnetAddress}
          </div>
          <div className='d-flex flex-row align-items-center text-overflow-dots'>
            <Badge color='success' className='mr-1'>Mainnet</Badge>
            {loadingIcon || mainnetAddress}
          </div>
        </TableCardRow>
        <TableCardRow
          name='Lock Script'
          icon='far fa-lock-alt'
        >
          <div className='d-flex flex-row align-items-center'>
            <Badge color='info' className='mr-2'>HashType</Badge>
            {loadingIcon || lockScript.hashType}
          </div>
          <div className='d-flex flex-row align-items-center '>
            <Badge color='info' className='mr-2'>CodeHash</Badge>
            {loadingIcon || <div className='text-overflow-dots'><code>{lockScript.codeHash}</code></div>}
          </div>
          <div className='d-flex flex-row align-items-center text-overflow-dots'>
            <Badge color='info' className='mr-2'>Args</Badge>
            {loadingIcon || <div className='text-overflow-dots'><code>{lockScript.args.serialize()}</code></div>}
          </div>
        </TableCardRow>
        <TableCardRow
          name='Lock Hash'
          icon='far fa-hashtag'
        >
          {loadingIcon || <code>{lockScript.hash}</code>}
        </TableCardRow>
      </TableCard>
    )
  }
}

