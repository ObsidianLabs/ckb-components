import React, { PureComponent } from 'react'
import {
  Button,
  Badge,
} from '@obsidians/ui-components'

import CellDropable from './CellDropable'
import InputList from './InputList'
import DepList from './DepList'

import CkbTransactionOutputs from './CkbTransactionOutputs'
import CkbTransactionHandler from './CkbTransactionHandler'
import ckbTxManager from '../ckbTxManager'

export default class CkbTransactionConstructor extends PureComponent {
  constructor (props) {
    super(props)

    this.inputs = React.createRef()
    this.deps = React.createRef()
    this.outputs = React.createRef()

    this.state = {
      inputCells: [],
      depCells: [],
      outputCells: [],
    }
  }

  componentDidMount () {
    ckbTxManager.txConstructor = this
  }

  onClear = () => {
    this.inputs.current.updateList()
    this.deps.current.updateList()
    this.outputs.current.updateList()
    this.setState({
      inputCells: [],
      depCells: [],
      outputCells: [],
    })
  }

  visualizeTransaction (tx) {
    const { inputs, deps, outputs } = tx
    this.inputs.current.updateList(inputs)
    this.deps.current.updateList(deps)
    this.outputs.current.updateList(outputs)
    this.setState({ inputCells: inputs, depCells: deps, outputCells: outputs })
  }

  render() {
    const styles = `.ckb-transaction-constructor .table td { vertical-align: middle; }`

    return (
      <div className='card h-100 overflow-auto border-0 ckb-transaction-constructor'>
        <style>{styles}</style>
        <div className='card-body d-flex flex-column'>
          <div className='card-title d-flex flex-row justify-content-between h4'>
            <div>CKB Transaction Constructor</div>
            <Button color='secondary' size='sm' onClick={this.onClear}>
              <i className='fas fa-trash-alt mr-1' />Clear
            </Button>
          </div>

          <div className='row h-100'>
            <div className='col-6 d-flex flex-column'>
              <CellDropable
                ref={this.inputs}
                onChange={inputCells => this.setState({ inputCells })}
                List={InputList}
                header={total => (
                  <div className='d-flex flex-row justify-content-between mb-2'>
                    <div className='d-flex flex-row align-items-center'><h5 className='mb-0'>Inputs</h5></div>
                    <div><Badge color='warning'>Total: {total}</Badge></div>
                  </div>
                )}
              />
              <CellDropable
                ref={this.deps}
                onChange={depCells => this.setState({ depCells })}
                List={DepList}
                header={() => <h5>Deps</h5>}
              />
            </div>

            <div className='col-6 d-flex flex-column'>
              <CkbTransactionOutputs
                ref={this.outputs}
                onChange={outputCells => this.setState({ outputCells })}
                depCells={this.state.depCells}
              />
              <CkbTransactionHandler
                inputCells={this.state.inputCells}
                depCells={this.state.depCells}
                outputCells={this.state.outputCells}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
