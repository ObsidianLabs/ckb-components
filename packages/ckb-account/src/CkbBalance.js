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
    const { capacity, cellsCount } = await wallet.getCapacity()
    this.setState({ capacity, cellsCount, loading: false })
  }

  render () {
    const { capacity, cellsCount } = this.state

    return (
      <TableCard title='Account'>
        <TableCardRow
          name='Balance'
          icon='far fa-wallet'
          badge={`${new CkbCapacity(capacity).toString()} CKB`}
          badgeColor='success'
        />
        <TableCardRow
          name='Live cells'
          icon='fas fa-cubes'
          badge={cellsCount}
        />
      </TableCard>
    )
  }
}
