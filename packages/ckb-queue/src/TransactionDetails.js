import React, { PureComponent } from 'react'

import {
  ButtonOptions,
  Table,
  TableCardRow,
} from '@obsidians/ui-components'

import Highlight from 'react-highlight'

export default class TransactionDetails extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selected: 'basic',
    }
    this.modal = React.createRef()
  }

  renderContent = (tx, selected) => {
    const { txHash, status, data } = tx
    if (selected === 'basic') {
      return (
        <Table>
          <TableCardRow
            name='Hash'
            icon='fas fa-hashtag'
            badge={<code>{txHash}</code>}
          />
          <TableCardRow
            name='Status'
            icon='fad fa-spinner-third'
            badge={status}
            badgeColor={status === 'FAILED' ? 'danger' : status === 'CONFIRMED' ? 'success' : 'warning'}
          />
          {this.renderError(data?.error)}
        </Table>
      )
    } else if (selected === 'tx') {
      return (
        <Highlight language='javascript' className='pre-box bg2 pre-wrap break-all small my-0' element='pre'>
          <code>{JSON.stringify(data.tx, null, 2)}</code>
        </Highlight>
      )
    } else if (selected === 'error') {
      try {
        const obj = JSON.parse(data.error)
        return (
          <Highlight className='pre-box bg2 pre-wrap break-all small my-0' element='pre'>
            <code>{JSON.stringify(obj, null, 2)}</code>
          </Highlight>
        )
      } catch (e) {}
      return (
        <pre className='pre-box bg2 pre-wrap break-all small my-0'>
          <code>{data.error}</code>
        </pre>
      )
    }
  }

  renderError = error => {
    if (!error) {
      return null
    }
    try {
      const obj = JSON.parse(error)
      return <>
        <TableCardRow
          name='Error Code'
          icon='fas fa-exclamation-triangle'
          badge={obj.code}
          badgeColor='danger'
        />
        <TableCardRow
          name='Error Message'
          icon='fas fa-exclamation-triangle'
        >
          <code className='small'>{obj.message}</code>
        </TableCardRow>
        <TableCardRow
          name='Error Data'
          icon='fas fa-exclamation-triangle'
        >
          <code className='small'>{obj.data}</code>
        </TableCardRow>
      </>
    } catch (e) {
      <TableCardRow
        name='Error'
        icon='fas fa-exclamation-triangle'
      >
        {error}
      </TableCardRow>
    }
  }

  render () {
    const tx = this.props.tx || {}
    const selected = this.state.selected

    const options = [
      { key: 'basic', text: 'Basic' },
      { key: 'tx', text: 'Tx' },
    ]
    if (tx.data?.error) {
      options.push({ key: 'error', text: 'Error' })
    }

    return <>
      <div>
        <ButtonOptions
          size='sm'
          className='mb-3'
          options={options}
          selected={selected}
          onSelect={selected => this.setState({ selected })}
        />
      </div>
      {this.renderContent(tx, selected)}
    </>
  }
}
