import React, { PureComponent } from 'react'

import networkManager from './networkManager'

import LocalNetwork from './LocalNetwork'
import CustomNetwork from './CustomNetwork'
import RemoteNetwork from './RemoteNetwork'

const chains = {
  local: 'dev',
  'ckb-aggron': 'aggron',
  'ckb-mainnet': 'mainnet',
}

export default class Network extends PureComponent {
  componentDidMount () {
    
  }

  componentDidUpdate (prevProps) {
    if (prevProps.network !== this.props.network) {
      // networkManager.updateNetwork()
    }
  }

  render () {
    const { active, network = 'local', onLifecycle } = this.props
    const chain = chains[network]
    if (chain === 'dev') {
      return <LocalNetwork chain={chain} active={active} onLifecycle={onLifecycle} />
    } else if (network === 'custom') {
      return <CustomNetwork />
    }
    return <RemoteNetwork chain={chain} />
  }
}
