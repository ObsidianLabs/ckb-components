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
    hasMore: false,
    loading: true,
    error: '',
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
    this.setState({ txs: [], loading: true, error: '', hasMore: false })
    const transactions = await wallet.getTransactions(null, PAGE_SIZE)
    if (transactions.error) {
      this.setState({ loading: false, error: transactions.error })
      return
    }
    const { cursor, txs } = transactions
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
    const transactions = await this.props.wallet.getTransactions(this.state.cursor, PAGE_SIZE)
    if (transactions.error) {
      this.setState({ loading: false, error: transactions.error })
      return
    }
    const { cursor, txs } = transactions
    this.setState({
      cursor,
      txs: [...this.state.txs, ...txs],
      hasMore: txs.length >= PAGE_SIZE,
      loading: false,
    })
  }

  renderTableBody = () => {
    const rows = _.chain(this.state.txs)
      .groupBy(tx => tx.tx_hash)
      .map((cells, tx_hash) => (
        <TransactionRow key={`tx-${tx_hash}`} cells={cells} wallet={this.props.wallet} />
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
    } else if (this.state.error) {
      rows.push(
        <tr key='txs-error' className='bg-transparent'>
        <td align='middle' colSpan={3}>
          Loading Error
        </td>
      </tr>,
      <tr key='txs-refresh' className='bg-transparent'>
        <td align='middle' colSpan={3}>
          <span className='btn btn-sm btn-secondary' onClick={() => this.refresh(this.props.wallet)}>Reload</span>
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
            <th style={{ width: '20%' }}>hash</th>
            <th style={{ width: '75%' }}>data</th>
          </tr>
        )}
      >
        {this.renderTableBody()}
      </TableCard>
    )
  }
}
