import React, { PureComponent } from 'react'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import {
  SplitPane,
  LoadingScreen,
} from '@obsidians/ui-components'

import CkbSdk from '@obsidians/ckb-sdk'

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
      ckbClient: undefined,
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
    const ckbClient = (new CkbSdk()).ckbClient
    this.setState({ ckbClient })
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
    const { ckbClient, initialSelected, initialTabs } = this.state

    if (!ckbClient) {
      return <LoadingScreen />
    }

    return (
      <CkbWalletContext.Provider value={{
        ckbClient,
        cellCollection: this.props.cellCollection,
        addressBook: this.props.addressBook,
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
