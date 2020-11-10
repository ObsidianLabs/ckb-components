import React, { PureComponent } from 'react'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import {
  SplitPane,
} from '@obsidians/ui-components'

import CkbWalletContext from './CkbWalletContext'
import ckbTxManager from './ckbTxManager'

import CkbTransactionConstructor from './CkbTransactionConstructor'
import CkbCellExplorer from './CkbCellExplorer'
import CkbCellDetail from './CkbCellDetail'

export default class CkbTx extends PureComponent {
  constructor (props) {
    super(props)
    
    let selectedTabKey = ''
    const address = props.address || ''
    const initialTabs = props.tabs.map((value, index) => {
      const key = `tab-${index}`
      if (value === address) {
        selectedTabKey = key
      }
      return { key, value }
    })
    let initialSelected
    if (!selectedTabKey) {
      initialSelected = { key: `tab-${initialTabs.length}`, value: address }
      initialTabs.push(initialSelected)
    } else {
      initialSelected = { key: selectedTabKey, value: address }
    }

    this.state = {
      initialSelected,
      initialTabs,
      cellManifest: [],
    }

    this.explorer = React.createRef()
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = async () => {
    const manifest = await ckbTxManager.loadCellManifest()
    this.setState({ manifest })
  }

  get currentValue () {
    return this.explorer.current ? this.explorer.current.currentValue : ''
  }

  openTab = value => {
    this.explorer.current && this.explorer.current.openTab(value)
  }

  onValueChanged = value => {
    this.props.onValueChanged && this.props.onValueChanged(value)
  }

  render () {
    const { network } = this.props
    const { initialSelected, initialTabs } = this.state

    return (
      <CkbWalletContext.Provider value={{
        txBuilder: this.props.txBuilder,
        cellManifest: this.state.cellManifest,
      }}>
        <DndProvider backend={HTML5Backend}>
          <SplitPane
            split='horizontal'
            primary='second'
            defaultSize={340}
            minSize={120}
          >
            <CkbTransactionConstructor />
            <CkbCellExplorer
              ref={this.explorer}
              network={network}
              initialSelected={initialSelected}
              initialTabs={initialTabs}
              starred={this.props.starred}
              onValueChanged={this.onValueChanged}
              onChangeStarred={this.props.onChangeStarred}
              onTabsUpdated={this.props.onTabsUpdated}
            />
          </SplitPane>
        </DndProvider>
        <CkbCellDetail />
      </CkbWalletContext.Provider>
    )
  }
}
