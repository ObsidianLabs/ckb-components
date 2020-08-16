import React, { PureComponent } from 'react'
import _ from 'lodash'

import {
  TableCard,
} from '@obsidians/ui-components'

import TransactionRow from './TransactionRow'

const PAGE_SIZE = 20

export default class CkbTransactions extends PureComponent {
  state = {
    cursor: '',
    txs: [],
    hasMore: true,
    loading: true,
  }

  componentDidMount () {
    this.refresh(this.props.wallet)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.wallet !== this.props.wallet) {
      this.refresh(this.props.wallet)
    }
  }

  refresh = async wallet => {
    this.setState({ txs: [], loading: true })
    const { cursor, txs } = await wallet.getTransactions(null, PAGE_SIZE)
    if (this.props.wallet !== wallet) {
      return
    }
    this.setState({
      cursor,
      txs,
      hasMore: txs.length >= PAGE_SIZE,
      loading: false,
    })
  }

  loadMore = async () => {
    this.setState({ loading: true })
    const { cursor, txs } = await this.props.wallet.getTransactions(this.state.cursor, PAGE_SIZE)
    this.setState({
      cursor,
      txs: [...this.state.txs, ...txs],
      hasMore: txs.length >= PAGE_SIZE,
      loading: false,
    })
  }

  renderTableBody = () => {
    const rows = _.chain(this.state.txs)
      .groupBy(tx => tx.txHash)
      .map((cells, txHash) => (
        <TransactionRow key={`tx-${txHash}`} cells={cells} wallet={this.props.wallet} />
      ))
      .value()

    if (this.state.loading) {
      rows.push(
        <tr key='txs-loading' className='bg-transparent'>
          <td align='middle' colSpan={3}>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    } else if (this.state.hasMore) {
      rows.push(
        <tr key='txs-loadmore' className='bg-transparent'>
          <td align='middle' colSpan={3}>
            <span className='btn btn-sm btn-secondary' onClick={this.loadMore}>Load More</span>
          </td>
        </tr>
      )
    } else if (!rows.length) {
      rows.push(
        <tr key='txs-none'>
          <td align='middle' colSpan={3}>
            (No Transactions)
          </td>
        </tr>
      )
    }

    return rows
  }


  render () {
    return (
      <TableCard
        title='Transactions'
        tableSm
        TableHead={(
          <tr>
            <th style={{ width: '5%' }}>block</th>
            <th style={{ width: '10%' }}>hash</th>
            <th style={{ width: '85%' }}>data</th>
          </tr>
        )}
      >
        {this.renderTableBody()}
      </TableCard>
    )
  }
}
