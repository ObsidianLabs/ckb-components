import React from 'react'

import {
  SplitPane
} from '@obsidians/ui-components'

import { NodeTerminal } from '@obsidians/ckb-node'

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
      <NodeTerminal active={active} miner={chain === 'dev'} />
    </SplitPane>
  )
}
