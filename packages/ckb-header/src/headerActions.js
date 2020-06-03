import notification from '@obsidians/notification'

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
  }, {
    id: "ckb-mainnet",
    group: "mainnet",
    name: "Mainnet",
    fullName: "CKB Mainnet",
    icon: "far fa-globe",
    notification: "Switched to <b>CKB Mainnet</b>.",
  }
])


export class HeaderActions {
  constructor() {
    this.redux = null
    this.history = null
    this.newProjectModal = null
  }

  selectContract (network, contract) {
    this.redux.dispatch('SELECT_CONTRACT', { network, contract })
  }

  selectAccount (network, account) {
    this.redux.dispatch('SELECT_ACCOUNT', { network, account })
  }

  removeFromStarred (network, account) {
    this.redux.dispatch('REMOVE_ACCOUNT', { network, account })
  }

  async setNetwork (newtorkId) {
    if (newtorkId === this.redux.getState().network) {
      return
    }
    const network = networks.find(n => n.id === newtorkId)
    if (!network) {
      return
    }
    this.redux.dispatch('SELECT_NETWORK', network.id)
    notification.success(`Network`, network.notification)
    this.history.push(`/network/${network.id}`)
  }
}

export default new HeaderActions()
