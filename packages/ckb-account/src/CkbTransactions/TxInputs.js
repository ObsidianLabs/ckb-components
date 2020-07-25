import React, { useState, useEffect } from 'react'

import { Badge } from '@obsidians/ui-components'
import nodeManager from '@obsidians/ckb-node'

import CkbCell from './CkbCell'

export default function TxInputs ({ inputs, wallet }) {
  return (
    <div className='d-flex flex-1 flex-column overflow-hidden'>
      {inputs.map((input, index) => (
        <CkbInput key={`tx-input-${index}`} {...input} wallet={wallet} />
      ))}
    </div>
  )
}

function CkbInput ({ since, previousOutput, self, wallet }) {
  if (previousOutput.txHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return <div className='small'>Cellbase for Block #{BigInt(since).toString()}</div>
  }

  const [cell, setCell] = useState(null)

  useEffect(
    () => {
      if (previousOutput.txHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return
      }

      nodeManager.sdk.ckbClient.loadOutpoint(previousOutput).then(setCell)
    },
    [previousOutput],
  )

  if (!cell) {
    const index = parseInt(previousOutput.index, 16)
    const hash = `${previousOutput.txHash.substr(0, 6)}...${previousOutput.txHash.substr(62)}`
    return (
      <div className='d-flex flex-row align-items-center'>
        <div className='d-flex flex-row align-items-center' key='loading'>
          <i className={`fas fa-caret-right mr-2 ${self ? 'text-primary' : 'text-muted'}`} />
          <div className='small mr-1'>
            <i className='fas fa-spin fa-spinner mr-1' />Loading Cell
          </div>
          <Badge>{index}@{hash}</Badge>
        </div>
      </div>
    )
  }

  return (
    <CkbCell
      {...cell}
      capacityColor={self && 'danger'}
    />
  )
}