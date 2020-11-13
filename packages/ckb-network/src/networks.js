import { List } from 'immutable'
import platform from '@obsidians/platform'

const networkList = [
  {
    id: "ckb-aggron",
    group: "testnet",
    name: "Aggron",
    fullName: "Testnet Aggron",
    icon: "far fa-clouds",
    notification: "Switched to <b>Testnet Aggron</b>.",
    url: 'https://ckb.obsidians.io/rpc/aggron',
    indexer: 'https://ckb.obsidians.io/indexer/aggron',
    explorer: 'https://ckb.obsidians.io/explorer/aggron',
  }, {
    id: "ckb-mainnet",
    group: "mainnet",
    name: "Mainnet",
    fullName: "CKB Mainnet",
    icon: "far fa-globe",
    notification: "Switched to <b>CKB Mainnet</b>.",
    url: 'https://ckb.obsidians.io/rpc/lina',
    indexer: 'https://ckb.obsidians.io/indexer/lina',
    explorer: 'https://ckb.obsidians.io/explorer/lina',
  }
]

if (platform.isDesktop) {
  networkList.unshift({
    id: 'custom',
    group: 'default',
    name: 'Custom',
    fullName: 'Custom Network',
    icon: 'fas fa-edit',
    notification: 'Switched to <b>Custom</b> network.',
  })
  networkList.unshift({
    id: 'local',
    group: 'default',
    name: 'Local',
    fullName: 'Local Network',
    icon: 'fas fa-laptop-code',
    notification: 'Switched to <b>Local</b> network.',
  })
} else {
  networkList.push({
    id: 'custom',
    group: 'others',
    name: 'Custom',
    fullName: 'Custom Network',
    icon: 'fas fa-edit',
    notification: 'Switched to <b>Custom</b> network.',
  })
}

export default List(networkList)