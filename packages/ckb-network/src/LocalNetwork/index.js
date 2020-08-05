import React from 'react'

import {
  SplitPane,
} from '@obsidians/ui-components'

import { NodeTerminal } from '@obsidians/ckb-node'
import InstanceList from './InstanceList'

export default function LocalNetwork (props) {
  const { active, chain, onLifecycle } = props
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
