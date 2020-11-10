import React, { PureComponent } from 'react'

import TxInputs from './TxInputs'
import TxOutputs from './TxOutputs'

export default class TransactionRow extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      detail: null
    }
  }

  componentDidMount () {
    this.fetchTransaction()
  }

  async fetchTransaction () {
    if (this.props.cells.length) {
      const detail = await this.props.cells[0].fetchTransaction()
      this.setState({ detail })
    }
  }

  onClick = () => {

  }

  render () {
    const { block_number, tx_hash } = this.props.cells[0]

    if (!this.state.detail) {
      const inputs = []
      const outputs = []
      this.props.cells.forEach(cell => {
        if (cell.type === 'input') {
          inputs[cell.txIndex] = true
        } else {
          outputs[cell.txIndex] = true
        }
      })
      let inputsComponents = (
        <div key={`input-loading`} className='small'>
          <i className='fas fa-spin fa-spinner mr-1' />Loading...
        </div>
      )
      if (inputs.length) {
        inputsComponents = Array(...inputs).map((x, index) => (
          <div className='d-flex flex-row align-items-center' key={`input-${index}`}>
            <i className={`fas fa-caret-right mr-2 ${x ? 'text-primary' : 'text-muted'}`} />
            <div className='small'>
              <i className='fas fa-spin fa-spinner mr-1' />Loading...
            </div>
          </div>
        ))
      }
      let outputsComponents = (
        <div key={`input-loading`} className='small'>
          <i className='fas fa-spin fa-spinner mr-1' />Loading...
        </div>
      )
      if (outputs.length) {
        outputsComponents = Array(...outputs).map((x, index) => (
          <div className='d-flex flex-row align-items-center' key={`input-${index}`}>
            <i className={`fas fa-caret-right mr-2 ${x ? 'text-primary' : 'text-muted'}`} />
            <div className='small'>
              <i className='fas fa-spin fa-spinner mr-1' />Loading...
            </div>
          </div>
        ))
      }
      return (
        <tr onClick={this.onClick}>
          <td>
            <div className='d-flex flex-row align-items-center small'>
              <div>{block_number}</div>
            </div>
          </td>
          <td><div className='text-overflow-dots small'><code>{tx_hash}</code></div></td>
          <td>
            <div className='d-flex flex-row'>
              <div className='d-flex flex-1 flex-column overflow-hidden'>
                {inputsComponents}
              </div>
              <div className='mx-3 text-muted align-self-center small'>
                <i className='fas fa-arrow-alt-right' />
              </div>
              <div className='d-flex flex-1 flex-column overflow-hidden'>
                {outputsComponents}
              </div>
            </div>
          </td>
        </tr>
      )
    }

    const { transaction, txStatus } = this.state.detail
    this.props.cells.forEach(cell => {
      if (cell.type === 'input') {
        transaction.inputs[cell.txIndex].self = true
      } else {
        transaction.outputs[cell.txIndex].self = true
      }
    })
    return (
      <tr onClick={this.onClick}>
        <td>
          <div className='d-flex flex-row align-items-center small'>
            <div>{block_number}</div>
          </div>
        </td>
        <td><div className='text-overflow-dots small'><code>{tx_hash}</code></div></td>
        <td>
          <div className='d-flex flex-row'>
            <div className='d-flex flex-1 align-items-center overflow-hidden'>
              <TxInputs inputs={transaction.inputs} wallet={this.props.wallet} />
            </div>
            <div className='mx-3 text-muted align-self-center small'>
              <i className='fas fa-arrow-alt-right' />
            </div>
            <div className='d-flex flex-1 align-items-center overflow-hidden'>
              <TxOutputs
                outputs={transaction.outputs}
                outputsData={transaction.outputsData}
                wallet={this.props.wallet}
              />
            </div>
          </div>
        </td>
      </tr>
    )
  }
}
