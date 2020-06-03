import React, { PureComponent } from 'react'

import {
  DeleteButton,
} from '@obsidians/ui-components'

import CkbCellCapacity from '../components/CkbCellCapacity'
import CkbCellScript from '../components/CkbCellScript'
import CkbCellData from '../components/CkbCellData'
import CkbOutpoint from '../components/CkbOutpoint'

import ckbTxManager from '../ckbTxManager'

export default class DepList extends PureComponent {
  renderTableBody = depCells => {
    if (!depCells || !depCells.length) {
      return <tr><td align='middle' colSpan={7}>(No deps)</td></tr>
    }

    return depCells.map((cell, index) => {
      const { id, capacity, lock, type, data } = cell
      return (
        <tr key={`dep-cell-${index}`} className='hover-flex' onClick={() => ckbTxManager.showCellDetail(cell)}>
          <td><CkbCellCapacity capacity={capacity} /></td>
          <td><CkbCellScript script={lock} /></td>
          <td><CkbCellScript type script={type} /></td>
          <td><CkbCellData data={data} /></td>
          <td><CkbOutpoint id={id} /></td>
          <td align='right' onClick={event => event.stopPropagation()}>
            <div className='hover-show justify-content-end'>
              <DeleteButton
                icon='fas fa-times'
                className='d-flex'
                onConfirm={() => this.props.onRemoveCell(id)}
                textConfirm='Click again to remove'
              />
            </div>
          </td>
        </tr>
      )
    })
  }

  render () {
    const { cells } = this.props

    return (
      <div className='d-flex overflow-hidden'>
        <table className='table table-sm table-hover table-fixed'>
          <thead>
            <tr>
              <th style={{ width: '17%' }}>capacity</th>
              <th style={{ width: '20%' }}>lock</th>
              <th style={{ width: '20%' }}>type</th>
              <th style={{ width: '20%' }}>data</th>
              <th style={{ width: '15%' }}>outpoint</th>
              <th style={{ width: '8%' }}></th>
            </tr>
          </thead>
          <tbody>
            {this.renderTableBody(cells)}
          </tbody>
        </table>
      </div>
    )
  }
}
