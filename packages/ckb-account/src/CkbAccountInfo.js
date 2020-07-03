import React, { PureComponent } from 'react'

import {
  Badge,
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-tx-builder'

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
    this.setState({ lockScript: null, loading: true })
    const lock = await wallet.lockScript()
    if (lock) {
      const lockScript = new CkbScript({ hashType: lock.hash_type, codeHash: lock.code_hash, args: lock.args })
      this.setState({ lockScript, loading: false })
    } else {
      this.setState({ loading: false })
    }
  }

  render () {
    const { wallet } = this.props
    const { loading, lockScript } = this.state
    let loadingIcon
    if (loading) {
      loadingIcon = <span key='loading'><i className='fas fa-spin fa-spinner' /></span>
    }

    let testnetAddress = <span className='text-muted'>(n/a)</span>
    let mainnetAddress = <span className='text-muted'>(n/a)</span>
    let hashType = <span className='text-muted'>(n/a)</span>
    let codeHash = <span className='text-muted'>(n/a)</span>
    let args = <span className='text-muted'>(n/a)</span>
    if (lockScript) {
      try {
        hashType = lockScript.hashType
        codeHash = <div className='text-overflow-dots'><code>{lockScript.codeHash}</code></div>
        args = <div className='text-overflow-dots'><code>{lockScript.args.serialize()}</code></div>
        testnetAddress = <code>{lockScript.getAddress('ckt')}</code>
        mainnetAddress = <code>{lockScript.getAddress('ckb')}</code>
      } catch (e) {}
    }


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
            {loadingIcon || hashType}
          </div>
          <div className='d-flex flex-row align-items-center '>
            <Badge color='info' className='mr-2'>CodeHash</Badge>
            {loadingIcon || codeHash}
          </div>
          <div className='d-flex flex-row align-items-center text-overflow-dots'>
            <Badge color='info' className='mr-2'>Args</Badge>
            {loadingIcon || args}
          </div>
        </TableCardRow>
        <TableCardRow
          name='Lock Hash'
          icon='far fa-hashtag'
        >
          {loadingIcon || <code>{lockScript ? lockScript.hash : wallet.value}</code>}
        </TableCardRow>
      </TableCard>
    )
  }
}

