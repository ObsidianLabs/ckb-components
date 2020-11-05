import React, { PureComponent } from 'react'
import {
  Button,
} from '@obsidians/ui-components'

import * as ckbUtils from '@nervosnetwork/ckb-sdk-utils'
import { CkbTransaction } from '@obsidians/ckb-objects'
import notification from '@obsidians/notification'

import CkbTransactionDetailModal from './CkbTransactionDetailModal'

export default class CkbTransactionHandler extends PureComponent {
  constructor (props) {
    super(props)
    this.modal = React.createRef()
  }

  processScript = async script => {
    if (!script || !script.codeHash) {
      return null
    }

    let args = '0x'
    if (typeof script.args === 'string') {
      args = script.args
    } else if (script.args.length === 0) {
      args = '0x'
    } else if (script.args.length === 1) {
      if (script.args[0].getValue) {
        args = await script.args[0].getValue()
      } else {
        args = script.args[0].value
      }
    } else {
      args = await Promise.all(script.args.map(async arg => {
        if (arg.getValue) {
          return await arg.getValue()
        }
        return arg.value
      }))
      args = ckbUtils.serializeStruct(args)
    }
    
    return { ...script, args }
  }

  openTransactionDetail = async () => {
    const { inputCells, depCells, outputCells } = this.props
    if (!inputCells.length) {
      notification.error('Cannot Construct Transaction', 'Need at least 1 input cell.')
      return
    }
    if (!outputCells.length) {
      notification.error('Cannot Construct Transaction', 'Need at least 1 output cell.')
      return
    }
    const tx = new CkbTransaction(inputCells, depCells, outputCells)
    return this.modal.current.openModal(tx)
  }

  render() {
    return <>
      <Button color='primary' onClick={this.openTransactionDetail}>
        <i className='fas fa-cloud-upload mr-1' />Push Transaction
      </Button>
      <CkbTransactionDetailModal
        ref={this.modal}
      />
    </>
  }
}
