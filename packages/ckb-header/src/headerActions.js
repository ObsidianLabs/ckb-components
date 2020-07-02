import notification from '@obsidians/notification'
import redux from '@obsidians/redux'
import nodeManager from '@obsidians/ckb-node'

import { List } from 'immutable'

export const networks = List([
  {
    id: 'local',
    group: 'default',
    name: 'Local',
    fullName: 'Local Network',
    icon: 'fas fa-laptop-code',
    notification: 'Switched to <b>Local</b> network.',
  }, {
    id: "ckb-aggron",
    group: "testnet",
    name: "Aggron",
    fullName: "Testnet Aggron",
    icon: "far fa-clouds",
    notification: "Switched to <b>Testnet Aggron</b>.",
    url: 'http://ckb-aggron.obsidians.io',
    indexer: 'http://ckb-aggron.obsidians.io:81'
  }, {
    id: "ckb-mainnet",
    group: "mainnet",
    name: "Mainnet",
    fullName: "CKB Mainnet",
    icon: "far fa-globe",
    notification: "Switched to <b>CKB Mainnet</b>.",
    url: 'http://ckb-mainnet.obsidians.io',
    indexer: 'http://ckb-mainnet.obsidians.io:81'
  }
])


export class HeaderActions {
  constructor() {
    this.history = null
    this.newProjectModal = null
  }

  selectContract (network, contract) {
    redux.dispatch('SELECT_CONTRACT', { network, contract })
  }

  selectAccount (network, account) {
    redux.dispatch('SELECT_ACCOUNT', { network, account })
  }

  removeFromStarred (network, account) {
    redux.dispatch('REMOVE_ACCOUNT', { network, account })
  }

  async setNetwork (newtorkId) {
    if (newtorkId === redux.getState().network) {
      return
    }
    const network = networks.find(n => n.id === newtorkId)
    if (!network) {
      return
    }
    nodeManager.switchNetwork(network)
    redux.dispatch('SELECT_NETWORK', network.id)
    notification.success(`Network`, network.notification)
    this.history.push(`/network/${network.id}`)
  }
}

export default new HeaderActions()
