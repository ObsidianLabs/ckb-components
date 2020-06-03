import React, { PureComponent } from 'react'

import {
  Badge,
  DeleteButton,
} from '@obsidians/ui-components'

export default class NetworkCellManifest extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      manifest: [
        { hash: '0xfe833942a9277e7dbc25a6e67688670449301e9b6be968d3c203ab2a1859f081', name: 'Duktape' },
      ],
    }
  }

  renderItem = item => {
    return (
      <tr key={`cell-manifest-${item.name}`} className='hover-inline-block'>
        <td>{item.name}</td>
        <td>
          <Badge color='secondary'>Outpoint</Badge>
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
          <td align='middle' colSpan='2'>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    }
    return this.state.manifest.map(this.renderItem)
  }
}
