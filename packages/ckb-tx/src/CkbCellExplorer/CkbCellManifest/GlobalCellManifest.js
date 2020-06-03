import React, { PureComponent } from 'react'

import {
  Badge,
  DeleteButton,
} from '@obsidians/ui-components'

import ckbTxManager from '../../ckbTxManager'

export default class GlobalCellManifest extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      manifest: [],
    }
  }

  componentDidMount () {
    this.loadCellManifest()
  }

  loadCellManifest = async () => {
    this.setState({ loading: true })
    const manifest = await ckbTxManager.loadCellManifest()
    this.setState({ loading: false, manifest })
  }

  renderItem = item => {
    return (
      <tr key={`cell-manifest-${item.name}`} className='hover-inline-block'>
        <td>{item.name}</td>
        <td>
          <Badge color='primary'>Data Hash</Badge>
          <code style={{ fontSize: '13px' }}>{item.hash}</code>
        </td>
        <td align='right'>
          <DeleteButton onConfirm={() => this.deleteItem(item)} />
        </td>
      </tr>
    )
  }

  newItem = () => {

  }

  deleteItem = item => {

  }

  render () {
    if (this.state.loading) {
      return (
        <tr key='cell-manifest-loading' >
          <td align='middle' colSpan='3'>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    }
    return this.state.manifest.map(this.renderItem)
  }
}
