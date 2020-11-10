import React, { useState, useEffect } from 'react'

import { Badge } from '@obsidians/ui-components'
import { networkManager } from '@obsidians/ckb-network'

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

function CkbInput ({ since, previous_output, self, wallet }) {
  if (previous_output.tx_hash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return <div className='small'>Cellbase for Block #{(BigInt(since) - BigInt(11)).toString()}</div>
  }

  const [cell, setCell] = useState(null)

  useEffect(
    () => {
      if (previous_output.tx_hash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return
      }

      networkManager.sdk.ckbClient.loadOutpoint(previous_output).then(setCell)
    },
    [previous_output],
  )

  if (!cell) {
    const index = parseInt(previous_output.index, 16)
    const hash = `${previous_output.tx_hash.substr(0, 6)}...${previous_output.tx_hash.substr(62)}`
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