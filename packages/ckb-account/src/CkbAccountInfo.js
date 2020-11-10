import React, { PureComponent } from 'react'

import {
  Badge,
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-objects'

export default class CkbAccountInfo extends PureComponent {
  state = {
    loading: true,
    lock_script: null,
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
    this.setState({ lock_script: null, loading: true })
    const lock = await wallet.lock_script()
    if (lock) {
      const lock_script = new CkbScript(lock)
      this.setState({ lock_script, loading: false })
    } else {
      this.setState({ loading: false })
    }
  }

  render () {
    const { wallet } = this.props
    const { loading, lock_script } = this.state
    let loadingIcon
    if (loading) {
      loadingIcon = <span key='loading'><i className='fas fa-spin fa-spinner' /></span>
    }

    let testnetAddress = <span className='text-muted'>(n/a)</span>
    let mainnetAddress = <span className='text-muted'>(n/a)</span>
    let hash_type = <span className='text-muted'>(n/a)</span>
    let code_hash = <span className='text-muted'>(n/a)</span>
    let args = <span className='text-muted'>(n/a)</span>
    if (lock_script) {
      try {
        hash_type = lock_script.hash_type
        code_hash = <div className='text-overflow-dots'><code>{lock_script.code_hash}</code></div>
        args = <div className='text-overflow-dots'><code>{lock_script.args.serialize()}</code></div>
        testnetAddress = <code>{lock_script.getAddress('ckt')}</code>
        mainnetAddress = <code>{lock_script.getAddress('ckb')}</code>
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
            {loadingIcon || hash_type}
          </div>
          <div className='d-flex flex-row align-items-center '>
            <Badge color='info' className='mr-2'>CodeHash</Badge>
            {loadingIcon || code_hash}
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
          {loadingIcon || <code>{lock_script ? lock_script.hash : wallet.value}</code>}
        </TableCardRow>
      </TableCard>
    )
  }
}

