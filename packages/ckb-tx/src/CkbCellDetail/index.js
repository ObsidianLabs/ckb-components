import React, { PureComponent } from 'react'

import {
  Modal,
  TableCard,
  TableCardRow,
  Badge,
} from '@obsidians/ui-components'

import { CkbCapacity } from '@obsidians/ckb-tx-builder'

import CkbScriptRow from './CkbScriptRow'
import CkbDataRow from './CkbDataRow'

import ckbTxManager from '../ckbTxManager'

export default class CkbCellDetail extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      cell: undefined,
      name: 'name',
      outPoint: null,
      udt: undefined,
    }

    this.modal = React.createRef()
  }

  componentDidMount () {
    ckbTxManager.cellDetailModal = this
  }

  openModal = cell => {
    this.refresh(cell)
    this.modal.current.openModal()
  }

  refresh = async cell => {
    this.setState({ cell, name: '', outPoint: null, udt: undefined })
    ckbTxManager.getCellInfo(cell.dataHash).then(info => {
      if (info) {
        this.setState({ name: info.name || '', outPoint: info.outPoint || null })
      }
    })
    
    const udt = cell.udt()
    if (udt) {
      ckbTxManager.getUdtInfo(udt.issuer).then(info => this.setState({ udt: { ...udt, ...info } }))
    }
  }

  addToReference = async () => {
    await ckbTxManager.addCellReference(this.state.cell)
    this.refresh(this.state.cell)
  }

  renderReferenceButton = () => {
    const { name, outPoint, cell } = this.state
    if (!name || !cell) {
      return null
    }
    if (outPoint) {
      if (cell.outPoint.txHash === outPoint.txHash && cell.outPoint.index === outPoint.index) {
        return (
          <Badge color='success'>In reference</Badge>
        )
      }
    }
    return (
      <Badge color='primary' onClick={this.addToReference}>Add cell to reference</Badge>
    )
  }

  renderCellDetail = cell => {
    if (!cell) {
      return null
    }

    const { capacity, id, cellbase, lock, type, data } = cell

    let udt = this.state.udt
    let udtRow = null
    if (udt) {
      const amount = new CkbCapacity(udt.value, 0).toString()
      udtRow = (
        <TableCardRow
          name={`UDT${udt.name ? ` - ${udt.name}` : ''}`}
          icon='far fa-coins'
          badge={`${amount} ${udt.symbol || ''}`}
          badgeColor='warning'
        />
      )
    }

    return (
      <TableCard noPadding title={this.state.name} right={this.renderReferenceButton()}>
        <TableCardRow
          name='Capacity'
          icon='far fa-wallet'
          badge={`${capacity.toString()} CKB`}
          badgeColor='success'
        />
        {udtRow}
        <TableCardRow
          name={cellbase ? <div className='d-flex align-items-center'>Outpoint<Badge color='success' className='ml-1'>cellbase</Badge></div>: 'Outpoint'}
          icon='far fa-sign-out'
          badge={id}
        />
        <CkbScriptRow script={lock} label='Lock script' icon='far fa-lock' />
        <CkbScriptRow script={type} label='Type script' icon='far fa-text' />
        <CkbDataRow data={data} />
      </TableCard>
    )
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        title='Cell Detail'
      >
        {this.renderCellDetail(this.state.cell)}
      </Modal>
    )
  }
}
