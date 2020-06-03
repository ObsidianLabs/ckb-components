import React, { PureComponent } from 'react'

import TxInputs from './TxInputs'
import TxOutputs from './TxOutputs'

export default class TransactionRow extends PureComponent {
  onClick = () => {

  }

  render () {
    const { tx, createdBy } = this.props.tx

    return (
      <tr onClick={this.onClick}>
        {/* <td>x</td> */}
        <td>{BigInt(createdBy.blockNumber).toString()}</td>
        <td>
          <div className='d-flex flex-row'>
            <div className='flex-1 overflow-hidden'>
              <TxInputs inputs={tx.inputs} wallet={this.props.wallet} />
            </div>
            <div className='mx-3 text-muted'>
              <i className='fas fa-arrow-alt-right' />
            </div>
            <div className='flex-1 overflow-hidden'>
              <TxOutputs
                outputs={tx.outputs}
                outputsData={tx.outputsData}
                wallet={this.props.wallet}
              />
            </div>
          </div>
        </td>
      </tr>
    )
  }
}
