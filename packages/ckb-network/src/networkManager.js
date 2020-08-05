import notification from '@obsidians/notification'
import redux from '@obsidians/redux'
import nodeManager from '@obsidians/ckb-node'

import networks from './networks'

class NetworkManager {
  constructor () {

  }

  async setNetwork (networkId) {
    if (networkId === redux.getState().network) {
      return
    }
    const network = networks.find(n => n.id === networkId)
    if (!network) {
      return
    }
    nodeManager.switchNetwork(network)
    redux.dispatch('SELECT_NETWORK', network.id)
    notification.success(`Network`, network.notification)
  }
}

export default new NetworkManager()