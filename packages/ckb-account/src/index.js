import React, { PureComponent } from 'react'

import {
  TabsWithNavigationBar,
  Modal,
} from '@obsidians/ui-components'

import CkbAccountPage from './CkbAccountPage'

export default class CkbAccount extends PureComponent {
  constructor (props) {
    super(props)

    let selectedTabKey = ''
    const initialTabs = props.tabs.map((value, index) => {
      const key = `tab-${index}`
      if (value === props.address) {
        selectedTabKey = key
      }
      return { key, value }
    })
    let initialSelected
    if (!selectedTabKey) {
      initialSelected = { key: `tab-${initialTabs.length}`, value: props.address }
      initialTabs.push(initialSelected)
    } else {
      initialSelected = { key: selectedTabKey, value: props.address }
    }

    this.state = {
      initialSelected,
      initialTabs,
      value: props.address,
    }

    this.tabs = React.createRef()
    this.ckbAccount = React.createRef()
    this.modal = React.createRef()
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = () => {
  }

  get currentValue () {
    return this.state.value
  }

  openTab = value => {
    this.tabs.current && this.tabs.current.openTab(value)
  }

  showCellModal = cell => {
    this.setState({ cell })
    this.modal.current.openModal()
  }

  onValue = value => {
    this.setState({ value })
    this.props.onValueChanged && this.props.onValueChanged(value)
  }

  onRefresh = () => {
    this.ckbAccount.current.refresh()
  }

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
    const { initialSelected, initialTabs, value } = this.state

    return (
      <React.Fragment>
        <TabsWithNavigationBar
          ref={this.tabs}
          initialSelected={initialSelected}
          initialTabs={initialTabs}
          starred={this.props.starred}
          maxTabWidth={46}
          getTabText={this.getTabText}
          onValue={this.onValue}
          onChangeStarred={this.props.onChangeStarred}
          onRefresh={this.onRefresh}
          onTabsUpdated={this.props.onTabsUpdated}
        >
          <CkbAccountPage
            ref={this.ckbAccount}
            value={value}
          />
        </TabsWithNavigationBar>

        <Modal
          ref={this.modal}
          title='Cell Detail'
        >
        </Modal>
      </React.Fragment>
    )
  }
}
