import React, { PureComponent } from 'react'

import {
  Tabs,
  TabContent,
  TabPane,
} from '@obsidians/ui-components'

import Terminal from '@obsidians/terminal'

import nodeManager from './nodeManager'

const parser = /block:\s(\d+),/
function parseLine(line) {
  const match = parser.exec(line)
  if (match && match[1]) {
    nodeManager.updateBlockNumber(match[1])
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

export default class NodeTerminal extends PureComponent {
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
      this.openDevTabs()
    } else {
      this.closeDevTabs()
    }
  }

  openDevTabs = () => {
    this.tabs.current.setState({
      tabs: [
        { key: 'node', text: <span key='terminal-node'><i className='fas fa-server mr-1' />node</span> },
        { key: 'indexer', text: <span key='terminal-indexer'><i className='fas fa-indent mr-1' />indexer</span> },
        { key: 'miner', text: <span key='terminal-miner'><i className='fas fa-hammer mr-1' />miner</span> },
      ]
    })
  }
  closeDevTabs = () => {
    this.tabs.current.onCloseTab({ key: 'indexer' })
    setTimeout(() => {
      this.tabs.current.onCloseTab({ key: 'miner' })
    }, 10)
  }

  render () {
    const { active, miner } = this.props
    const { activeTab } = this.state

    const initialTabs = [
      { key: 'node', text: <span key='terminal-node'><i className='fas fa-server mr-1' />node</span> },
    ]
    if (miner) {
      initialTabs.push({ key: 'indexer', text: <span key='terminal-indexer'><i className='fas fa-indent mr-1' />indexer</span> })
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
              ref={ref => (nodeManager.terminal = ref)}
              onLogReceived={onLogReceived}
            />
          </TabPane>
          <TabPane className='h-100 w-100' tabId='indexer'>
            <Terminal
              logId='ckb-indexer'
              active={active && activeTab === 'indexer'}
              ref={ref => (nodeManager.indexerTerminal = ref)}
              onLogReceived={onLogReceived}
            />
          </TabPane>
          <TabPane className='h-100 w-100' tabId='miner'>
            <Terminal
              logId='ckb-miner'
              active={active && activeTab === 'miner'}
              ref={ref => (nodeManager.minerTerminal = ref)}
              onLogReceived={onLogReceived}
            />
          </TabPane>
        </TabContent>
      </Tabs>
    )
  }
}