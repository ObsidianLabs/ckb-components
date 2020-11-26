import React, { PureComponent } from 'react'

import {
  TabsWithNavigationBar,
} from '@obsidians/ui-components'

import keypairManager from '@obsidians/keypair'

import CacheRoute from 'react-router-cache-route'

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
    this.keypairs = {}
  }

  get currentValue () {
    return this.state.value
  }

  componentDidMount () {
    keypairManager.loadAllKeypairs().then(this.updateKeypairs)
    keypairManager.onUpdated(this.updateKeypairs)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.network !== this.props.network) {
      this.onRefresh()
    }
  }

  updateKeypairs = keypairs => {
    this.keypairs = {}
    keypairs.forEach(k => {
      this.keypairs[k.address] = k.name
    })
    this.forceUpdate()
  }

  openTab = value => {
    this.tabs.current && this.tabs.current.openTab(value)
  }

  onValue = value => {
    this.setState({ value })
    this.props.onValueChanged && this.props.onValueChanged(value)
  }

  onPageDisplay = page => {
    this.currentPage = page
  }

  onRefresh = () => {
    this.currentPage?.refresh()
  }

  getTabText = tab => {
    const { value, temp } = tab
    let tabText = ''
    if (this.keypairs[value]) {
      tabText = this.keypairs[value]
    } else if (value.length < 10) {
      tabText = value
    } else {
      tabText = `${value.substr(0, 6)}...${value.slice(-4)}`
    }
    return tabText
  }

  render () {
    const { network } = this.props

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
        NavbarButtons={<>
          <CkbTransferButton sender={this.state.value} />
          <CkbMintUdtButton issuer={this.state.value} />
          {/* <CkbCellManifest sender={this.state.value} /> */}
        </>}
      >
        <CacheRoute
          path={`/tx/:name`}
          cacheKey={props => `tx-${network}-${props.match?.params?.name}`}
          multiple={5}
          className='h-100 overflow-hidden'
          render={props => (
            <CkbCells
              cacheLifecycles={props.cacheLifecycles}
              onDisplay={this.onPageDisplay}
              value={props.match.params.name}
            />
          )}
        />
      </TabsWithNavigationBar>
    )
  }
}
