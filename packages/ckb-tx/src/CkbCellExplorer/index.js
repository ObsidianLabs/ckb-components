import React, { PureComponent } from 'react'

import {
  TabsWithNavigationBar,
} from '@obsidians/ui-components'

import CkbCells from './CkbCells'
import CkbTransferButton from './CkbTransferButton'
import CkbMintUdtButton from './CkbMintUdtButton'
import CkbCellManifest from './CkbCellManifest'

export default class CkbCellExplorer extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      value: props.initialSelected.value,
    }

    this.tabs = React.createRef()
    this.ckbCells = React.createRef()
  }

  get currentValue () {
    return this.state.value
  }

  openTab = value => {
    this.tabs.current && this.tabs.current.openTab(value)
  }

  onValue = value => {
    this.setState({ value })
    this.props.onValueChanged && this.props.onValueChanged(value)
  }

  onRefresh = () => this.ckbCells.current.refresh()

  getTabText = tab => {
    const { value, temp } = tab
    let tabText = ''
    if (value.length < 10) {
      tabText += value
    } else {
      tabText += (value.substr(0, 6) + '...' + value.slice(-4))
    }
    return tabText
  }

  render () {
    const value = this.state.value

    return (
      <TabsWithNavigationBar
        ref={this.tabs}
        initialSelected={this.props.initialSelected}
        initialTabs={this.props.initialTabs}
        starred={this.props.starred}
        maxTabWidth={46}
        getTabText={this.getTabText}
        onValue={this.onValue}
        onChangeStarred={this.props.onChangeStarred}
        onRefresh={this.onRefresh}
        onTabsUpdated={this.props.onTabsUpdated}
        NavbarButtons={(
          <React.Fragment>
            <CkbTransferButton sender={this.state.value} />
            <CkbMintUdtButton issuer={this.state.value} />
            {/* <CkbCellManifest sender={this.state.value} /> */}
          </React.Fragment>
        )}
      >
        <CkbCells ref={this.ckbCells} value={value} />
      </TabsWithNavigationBar>
    )
  }
}
