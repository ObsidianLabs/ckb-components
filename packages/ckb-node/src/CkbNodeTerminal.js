import React, { PureComponent, useState } from 'react'

import {
  Tabs,
  TabContent,
  TabPane,
} from '@obsidians/ui-components'

import Terminal from '@obsidians/terminal'

import ckbNode from './ckbNode'

const parser = /block:\s(\d+),/
function parseLine(line) {
  const match = parser.exec(line)
  if (match && match[1]) {
    ckbNode.updateBlockNumber(match[1])
  }
  return line
}

let incompleteLine = ''
function onLogReceived(message) {
  message = incompleteLine + message

  let lines = message.split('\n')
  incompleteLine = lines.pop()
  lines.push('')
  lines = lines.map(parseLine)
  return lines.join('\n')
}

export default class CkbNodeTerminal extends PureComponent {
  constructor (props) {
    super(props)
    
    this.state = {
      activeTab: 'node',
    }
    this.tabs = React.createRef()
  }

  componentDidUpdate (prevProps) {
    if (this.props.miner === prevProps.miner) {
      return
    }
    if (this.props.miner) {
      this.openMinerTab()
    } else {
      this.closeMinerTab()
    }
  }

  openMinerTab = () => {
    this.tabs.current.setState({
      tabs: [
        { key: 'node', text: <span key='terminal-node'><i className='fas fa-server mr-1' />node</span> },
        { key: 'miner', text: <span key='terminal-miner'><i className='fas fa-hammer mr-1' />miner</span> },
      ]
    })
  }
  closeMinerTab = () => {
    this.tabs.current.onCloseTab({ key: 'miner' })
  }

  render () {
    const { active, miner } = this.props
    const { activeTab } = this.state

    const initialTabs = [
      { key: 'node', text: <span key='terminal-node'><i className='fas fa-server mr-1' />node</span> },
    ]
    if (miner) {
      initialTabs.push({ key: 'miner', text: <span key='terminal-miner'><i className='fas fa-hammer mr-1' />miner</span> })
    }
  
    return (
      <Tabs
        ref={this.tabs}
        headerClassName='nav-tabs-dark-active'
        noCloseTab
        initialSelected='node'
        initialTabs={initialTabs}
        onSelectTab={tab => this.setState({ activeTab: tab.key })}
      >
        <TabContent className='h-100 w-100' activeTab={activeTab}>
          <TabPane className='h-100 w-100' tabId='node'>
            <Terminal
              logId='ckb-node'
              active={active && activeTab === 'node'}
              ref={ref => (ckbNode.terminal = ref)}
              onLogReceived={onLogReceived}
            />
          </TabPane>
          <TabPane className='h-100 w-100' tabId='miner'>
            <Terminal
              logId='ckb-miner'
              active={active && activeTab === 'miner'}
              ref={ref => (ckbNode.minerTerminal = ref)}
              onLogReceived={onLogReceived}
            />
          </TabPane>
        </TabContent>
      </Tabs>
    )
  }
}