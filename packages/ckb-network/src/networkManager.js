import notification from '@obsidians/notification'
import redux from '@obsidians/redux'
import Sdk from '@obsidians/ckb-sdk'

import { getCachingKeys, dropByCacheKey } from 'react-router-cache-route'

import networks from './networks'

class NetworkManager {
  constructor () {
    this._sdk = null
    this.chain = ''
  }

  get sdk () {
    return this._sdk
  }

  async createSdk (params) {
    const sdk = new Sdk(params)
    try {
      const blockchainInfo = await sdk.ckbClient.rpc.get_blockchain_info()
      this.chain = blockchainInfo.chain
      this._sdk = sdk
      return blockchainInfo
    } catch (e) {
      console.warn(e)
      notification.error('Invalid Node URL', '')
    }
  }

  async updateSdk (params) {
    this._sdk = new Sdk(params)
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
    }

    redux.dispatch('SELECT_NETWORK', network.id)
    notification.success(`Network`, network.notification)
  }
}

export default new NetworkManager()