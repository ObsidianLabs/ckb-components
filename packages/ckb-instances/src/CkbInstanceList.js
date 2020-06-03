import React from 'react'

import {
  SplitPane
} from '@obsidians/ui-components'

import { CkbNodeTerminal } from '@obsidians/ckb-node'

import InstanceList from './InstanceList'

const chains = {
  local: 'dev',
  'ckb-aggron': 'aggron',
  'ckb-mainnet': 'mainnet',
}

export default function CkbInstanceList (props) {
  const { active, network = 'local', onLifecycle } = props
  const chain = chains[network]
  return (
    <SplitPane
      split='horizontal'
      primary='second'
      defaultSize={260}
      minSize={200}
    >
      <InstanceList chain={chain} onLifecycle={onLifecycle} />
      <CkbNodeTerminal active={active} miner={chain === 'dev'} />
    </SplitPane>
  )
}
