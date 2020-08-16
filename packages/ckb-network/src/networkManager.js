import notification from '@obsidians/notification'
import redux from '@obsidians/redux'
import Sdk from '@obsidians/ckb-sdk'

import networks from './networks'

class NetworkManager {
  constructor () {
    this._sdk = null
  }

  get sdk () {
    return this._sdk
  }

  async createSdk (params) {
    const sdk = new Sdk(params)
    try {
      const nodeInfo = await sdk.ckbClient.core.rpc.localNodeInfo()
      this._sdk = sdk
      return nodeInfo
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
    const network = networks.find(n => n.id === networkId)
    if (!network) {
      return
    }

    this.network = network
    if (network.url) {
      this._sdk = new Sdk(network)
    } else {
      this._sdk = null
    }

    redux.dispatch('SELECT_NETWORK', network.id)
    notification.success(`Network`, network.notification)
  }
}

export default new NetworkManager()