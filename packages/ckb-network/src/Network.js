import React, { PureComponent } from 'react'

import LocalNetwork from './LocalNetwork'
import CustomNetwork from './CustomNetwork'
import RemoteNetwork from './RemoteNetwork'

const chains = {
  local: 'dev',
  'ckb-aggron': 'aggron',
  'ckb-mainnet': 'mainnet',
}

export default props => {
  const {
    active,
    network = 'local',
    customNetwork,
  } = props
  const chain = chains[network]
  if (chain === 'dev') {
    return <LocalNetwork chain={chain} active={active} />
  } else if (network === 'custom') {
    return <CustomNetwork customNetwork={customNetwork} />
  }
  return <RemoteNetwork chain={chain} />
}
