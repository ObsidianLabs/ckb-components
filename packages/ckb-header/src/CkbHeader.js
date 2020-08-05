import React, { PureComponent } from 'react'

import Navbar from '@obsidians/navbar'
import { NewProjectModal, navbarItem } from '@obsidians/ckb-project' 
import { networkManager } from '@obsidians/ckb-network'

import headerActions from './headerActions'

export default class CkbHeader extends PureComponent {
  render () {
    const {
      projects,
      selectedProject,
      starred,
      selectedContract,
      selectedAccount,
      network,
      networkList,
    } = this.props

    const navbarLeft = [
      navbarItem(projects, selectedProject)
    ]

    const dropdownItems = starred.length
      ? starred.map(item => ({ id: item, name: <code>{item}</code> }))
      : [{ none: true }]
    const navbarRight = [
      {
        route: 'contract',
        title: 'TX Constructor',
        icon: 'fa-file-invoice',
        selected: { id: selectedContract, name: selectedContract && <code>{selectedContract}</code> },
        dropdown: [{ header: 'starred' }, ...dropdownItems],
        onClickItem: contract => headerActions.selectContract(network.id, contract),
        contextMenu: () => [{
          text: 'Remove from Starred',
          onClick: ({ id }) => headerActions.removeFromStarred(network.id, id),
        }],
      },
      {
        route: 'account',
        title: 'Explorer',
        icon: 'fa-file-invoice',
        selected: { id: selectedAccount, name: selectedAccount && <code>{selectedAccount}</code> },
        dropdown: [{ header: 'starred' }, ...dropdownItems],
        onClickItem: account => headerActions.selectAccount(network.id, account),
        contextMenu: () => [{
          text: 'Remove from Starred',
          onClick: ({ id }) => headerActions.removeFromStarred(network.id, id),
        }],
      },
      {
        route: 'network',
        title: 'Network',
        icon: network.icon,
        selected: network,
        dropdown: networkList,
        onClickItem: newtorkId => {
          headerActions.updateNetwork(newtorkId)
          networkManager.setNetwork(newtorkId)
        }
      },
    ]

    return (
      <React.Fragment>
        <Navbar
          navbarLeft={navbarLeft}
          navbarRight={navbarRight}
        />
        <NewProjectModal />
      </React.Fragment>
    )
  }
}
