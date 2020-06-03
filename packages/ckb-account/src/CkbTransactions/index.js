import React, { PureComponent } from 'react'
import uniqBy from 'lodash/uniqBy'

import {
  TableCard,
} from '@obsidians/ui-components'

import TransactionRow from './TransactionRow'

export default class CkbTransactions extends PureComponent {
  state = {
    hasMore: true,
    loading: true,
    txs: [],
    page: 0,
  }

  componentDidMount () {
    window.wallet = this.props.wallet
    this.refresh(this.props.wallet)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.wallet !== this.props.wallet) {
      this.refresh(this.props.wallet)
    }
  }

  refresh = async wallet => {
    this.setState({ txs: [], loading: true })
    const txs = await wallet.getTransactions()
    this.setState({ txs, loading: false })
  }

  loadMore = async () => {
    this.setState({ loading: true })
    const txs = await this.props.wallet.getTransactions(this.state.page + 1)
    this.setState({
      txs: [...this.state.txs, ...txs],
      page: this.state.page + 1,
      hasMore: txs.length >= 10,
      loading: false,
    })
  }

  renderTableBody = () => {
    const rows = uniqBy(this.state.txs, tx => tx.createdBy.txHash).map(tx => (
      <TransactionRow key={`tx-${tx.createdBy.txHash}`} tx={tx} wallet={this.props.wallet} />
    ))

    if (this.state.loading) {
      rows.push(
        <tr key='txs-loading' className='bg-transparent'>
          <td align='middle' colSpan='3'>
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
            {/* <th style={{ width: '10%' }}>time</th> */}
            <th style={{ width: '15%' }}>block</th>
            <th style={{ width: '85%' }}>data</th>
          </tr>
        )}
      >
        {this.renderTableBody()}
      </TableCard>
    )
  }
}
