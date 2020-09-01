import React, { PureComponent } from 'react'

import {
  Badge,
  DeleteButton,
} from '@obsidians/ui-components'

import { CkbCapacity } from '@obsidians/ckb-tx-builder'

import CkbOutputNewButton from './CkbOutputNewButton'

import CkbCellCapacity from '../../components/CkbCellCapacity'
import CkbCellScript from '../../components/CkbCellScript'
import CkbCellData from '../../components/CkbCellData'

export default class CkbTransactionOutputs extends PureComponent {
  state = {
    fee: '0.001',
    outputs: [],
  }

  componentDidUpdate (_, state) {
    if (state.outputs !== this.state.outputs) {
      this.props.onChange(this.state.outputs)
    }
  }

  updateList = (outputs = []) => {
    this.setState({ outputs })
  }

  onNewOutput = newOutput => {
    this.setState({
      outputs: [...this.state.outputs, newOutput],
    })
  }

  onRemoveOutput = index => {
    this.setState(({ outputs }) => {
      outputs.splice(index, 1)
      return { outputs: [...outputs] }
    })
  }

  onModifyOutput = (index, updater) => {
    this.setState(({ outputs }) => {
      const [k, v] = Object.entries(updater)[0]
      outputs[index][k] = v
      return { outputs: [...outputs] }
    })
  }

  renderTableBody = cells => {
    if (!cells || !cells.length) {
      return (
        <tr>
          <td align='middle' colSpan={6}>
            (No outputs)
          </td>
        </tr>
      )
    }

    return cells.map((cell, index) => {
      return (
        <tr key={`output-cell-${index}`} className='hover-flex'>
          <td>
            <CkbCellCapacity
              capacity={cell.capacity}
              onModifyCapacity={capacity => this.onModifyOutput(index, { capacity })}
            />
          </td>
          <td>
            <CkbCellScript
              script={cell.lock}
              depCells={this.props.depCells} 
              onModifyScript={lock => this.onModifyOutput(index, { lock })}
            />
          </td>
          <td>
            <CkbCellScript
              type
              script={cell.type}
              depCells={this.props.depCells} 
              onModifyScript={type => this.onModifyOutput(index, { type })}
            />
          </td>
          <td>
            <CkbCellData
              data={cell.data}
              onModifyData={data => this.onModifyOutput(index, { data })}
            />
          </td>
          <td align='right'>
            <div className='hover-show justify-content-end'>
              <DeleteButton
                icon='fas fa-times'
                className='d-flex'
                onConfirm={() => this.onRemoveOutput(index)}
                textConfirm='Click again to remove'
              />
            </div>
          </td>
        </tr>
      )
    })
  }

  render () {
    const totalCapacity = new CkbCapacity()
    this.state.outputs.forEach(cell => totalCapacity.plus(cell.capacity))
    
    return (
      <div className='d-flex flex-1 flex-column mb-3'>
        <div className='d-flex flex-row justify-content-between mb-2'>
          <div className='d-flex flex-row align-items-center'>
            <h5 className='mb-0'>Outputs</h5>
            <CkbOutputNewButton depCells={this.props.depCells} onNewOutput={this.onNewOutput} />
          </div>
          <div className='user-select'>
            <Badge color='warning'>
              Total: {totalCapacity.toString()}
            </Badge>
          </div>
        </div>

        <div className='d-flex flex-1 overflow-auto rounded bg2'>
          <div className='d-flex overflow-hidden'>
            <table className='table table-sm table-hover table-fixed w-100'>
              <thead>
                <tr>
                  <th style={{ width: '17%' }}>capacity</th>
                  <th style={{ width: '25%' }}>lock</th>
                  <th style={{ width: '25%' }}>type</th>
                  <th style={{ width: '25%' }}>data</th>
                  <th style={{ width: '8%' }}></th>
                </tr>
              </thead>
              <tbody>
                {this.renderTableBody(this.state.outputs)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}
