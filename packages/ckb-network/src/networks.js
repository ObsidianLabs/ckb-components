import { List } from 'immutable'

export default List([
  {
    id: 'local',
    group: 'default',
    name: 'Local',
    fullName: 'Local Network',
    icon: 'fas fa-laptop-code',
    notification: 'Switched to <b>Local</b> network.',
  }, {
    id: 'custom',
    group: 'default',
    name: 'Custom',
    fullName: 'Custom Network',
    icon: 'fas fa-edit',
    notification: 'Switched to <b>Custom</b> network.',
  }, {
    id: "ckb-aggron",
    group: "testnet",
    name: "Aggron",
    fullName: "Testnet Aggron",
    icon: "far fa-clouds",
    notification: "Switched to <b>Testnet Aggron</b>.",
    url: 'http://ckb-aggron.obsidians.io',
    indexer: 'http://ckb-aggron.obsidians.io:81',
    explorer: 'https://api.explorer.nervos.org/testnet/api/v1',
  }, {
    id: "ckb-mainnet",
    group: "mainnet",
    name: "Mainnet",
    fullName: "CKB Mainnet",
    icon: "far fa-globe",
    notification: "Switched to <b>CKB Mainnet</b>.",
    url: 'http://ckb-mainnet.obsidians.io',
    indexer: 'http://ckb-mainnet.obsidians.io:81',
    explorer: 'https://api.explorer.nervos.org/api/v1',
  }
])