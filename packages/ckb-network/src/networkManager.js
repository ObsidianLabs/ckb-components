import notification from '@obsidians/notification'
import redux from '@obsidians/redux'
import Sdk from '@obsidians/ckb-sdk'
import CkbTxBuilder from '@obsidians/ckb-tx-builder'

import { getCachingKeys, dropByCacheKey } from 'react-router-cache-route'

import networks from './networks'

class NetworkManager {
  constructor () {
    this._sdk = null
    this._txBuilder = null
    this.chain = ''
  }

  get sdk () {
    return this._sdk
  }

  get txBuilder () {
    return this._txBuilder
  }

  async createSdk (params) {
    const sdk = new Sdk(params)
    try {
      const blockchainInfo = await sdk.ckbClient.rpc.get_blockchain_info()
      this.chain = blockchainInfo.chain
      this._sdk = sdk
      this._txBuilder = new CkbTxBuilder(sdk.ckbIndexer)
      return blockchainInfo
    } catch (e) {
      console.warn(e)
      notification.error('Invalid Node URL', params.url)
    }
  }

  async updateSdk (params) {
    this._sdk = new Sdk(params)
    this._txBuilder = new CkbTxBuilder(this._sdk.ckbIndexer)
  }

  async setNetwork (networkId) {
    if (networkId === redux.getState().network) {
      return
    }

    const cachingKeys = getCachingKeys()
    cachingKeys.filter(key => key.startsWith('tx-') || key.startsWith('account-')).forEach(dropByCacheKey)

    const network = networks.find(n => n.id === networkId)
    if (!network) {
      return
    }

    this.network = network
    if (network.url) {
      await this.createSdk(network)
    } else {
      this._sdk = null
      this._txBuilder = null
    }

    redux.dispatch('SELECT_NETWORK', network.id)
    notification.success(`Network`, network.notification)
  }

  async updateCustomNetwork ({ url, indexer }) {
    const blockchainInfo = await this.createSdk({ url, indexer })
    
    if (blockchainInfo) {
      redux.dispatch('SELECT_NETWORK', `custom:${this.chain}`)
      notification.success(`Network Connected`, `Connected to ckb rpc at <b>${url}</b>`)
    }

    return blockchainInfo
  }
}

export default new NetworkManager()