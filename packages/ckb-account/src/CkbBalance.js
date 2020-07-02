import React, { PureComponent } from 'react'

import {
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

import { CkbCapacity } from '@obsidians/ckb-tx-builder'

export default class CkbBalance extends PureComponent {
  state = {
    loading: true,
    capacity: BigInt(0),
    cellsCount: 0,
    txCount: 0,
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
    this.setState({ loading: true })
    const { balance, live_cells_count, transactions_count } = await wallet.getCapacity()
    this.setState({
      capacity: BigInt(balance),
      cellsCount: live_cells_count,
      txCount: transactions_count,
      loading: false,
    })
  }

  render () {
    const { loading, capacity, cellsCount, txCount } = this.state
    let loadingIcon
    if (loading) {
      loadingIcon = <span key='loading'><i className='fas fa-spin fa-spinner' /></span>
    }

    return (
      <TableCard title='Account'>
        <TableCardRow
          name='Balance'
          icon='far fa-wallet'
          badge={loadingIcon || `${new CkbCapacity(capacity).toString()} CKB`}
          badgeColor='success'
        />
        <TableCardRow
          name='Live cells'
          icon='fas fa-cubes'
          badge={loadingIcon || cellsCount}
        />
        <TableCardRow
          name='Transactions'
          icon='fas fa-exchange-alt'
          badge={loadingIcon || txCount}
        />
      </TableCard>
    )
  }
}
