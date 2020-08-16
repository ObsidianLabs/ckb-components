import React, { PureComponent } from 'react'

import {
  Screen,
} from '@obsidians/ui-components'

import { networkManager } from '@obsidians/ckb-network'

import CkbBalance from './CkbBalance'
import CkbAccountInfo from './CkbAccountInfo'
import CkbTransactions from './CkbTransactions'

export default class CkbAccountPage extends PureComponent {
  state = {
    error: null,
    wallet: null,
  }

  componentDidMount () {
    this.refresh()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.value !== this.props.value) {
      this.refresh()
    }
  }

  refresh = async () => {
    const value = this.props.value

    if (!value) {
      this.setState({ error: null, wallet: null })
      return
    }

    const wallet = networkManager.sdk?.walletFrom(value)
    try {
      await wallet.info()
      this.setState({ error: null, wallet })
    } catch (e) {
      let error = e.message
      if (error === `Cannot read property 'attributes' of undefined`) {
        error = 'Invalid value, expected a lock hash or CKB address.'
      }
      this.setState({ error, wallet: null })
      return
    }
  }

  render () {
    const { error, wallet } = this.state

    if (!this.props.value) {
      return (
        <Screen>
          <h4 className='display-4'>New Page</h4>
          <p className='lead'>Please enter a CKB address or lock hash.</p>
        </Screen>
      )
    }

    if (error) {
      return (
        <Screen>
          <h4 className='display-4'>Invalid Value</h4>
          <p>{error}</p>
          <p className='lead'><kbd>{this.props.value}</kbd></p>
        </Screen>
      )
    }

    if (!wallet) {
      return null
    }

    return (
      <div className='d-flex flex-1 flex-column overflow-auto'>
        <div className='d-flex'>
          <div className='col-4 p-0 border-right-black'>
            <CkbBalance wallet={wallet} />
          </div>
          <div className='col-8 p-0'>
            <CkbAccountInfo wallet={wallet} />
          </div>
        </div>
        <div className='d-flex flex-fill'>
          <div className='col-12 p-0 border-top-black'>
            <CkbTransactions wallet={wallet} />
          </div>
        </div>
      </div>
    )
  }
}
