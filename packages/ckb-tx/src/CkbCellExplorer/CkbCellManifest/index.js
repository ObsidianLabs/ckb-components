import React, { PureComponent } from 'react'

import {
  Modal,
  ToolbarButton,
  ButtonOptions,
} from '@obsidians/ui-components'

import GlobalCellManifest from './GlobalCellManifest'
import NetworkCellManifest from './NetworkCellManifest'
import NewItemModal from './NewItemModal'

export default class CkbCellManifest extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      key: 'network',
    }

    this.modal = React.createRef()
    this.newItemModal = React.createRef()
  }

  openModal = () => {
    this.modal.current.openModal()
  }

  onSelect = key => {
    this.setState({ key })
  }

  renderManifest = () => {
    if (this.state.key === 'global') {
      return <GlobalCellManifest />
    } else {
      return <NetworkCellManifest />
    }
  }

  newItem = () => {
    this.newItemModal.current.openModal()
  }

  deleteItem = item => {

  }

  render () {
    return <>
      <ToolbarButton
        id='navbar-cell-manifest'
        size='md'
        icon='fas fa-list-ul'
        tooltip='Cell Manifest'
        onClick={this.openModal}
      />
      <Modal
        ref={this.modal}
        title='Cell Manifest'
        textActions={['New Item']}
        onActions={[this.newItem]}
        textCancel='Close'
      >
        <div>
          <ButtonOptions
            size='sm'
            options={[
              { key: 'network', text: 'Network' },
              { key: 'global', text: 'Global' },
            ]}
            selected={this.state.key}
            onSelect={this.onSelect}
          />
        </div>
        <table className='table table-sm table-hover table-striped'>
          <thead>
            <tr>
              <th>Name</th>
              <th style={{ width: '70%' }}>Cell</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.renderManifest()}
          </tbody>
        </table>
      </Modal>
      <NewItemModal ref={this.newItemModal} />
    </>
  }
}
