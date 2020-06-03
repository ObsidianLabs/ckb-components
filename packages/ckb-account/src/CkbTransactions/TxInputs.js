import React, { useState, useEffect } from 'react'

import CkbCell from './CkbCell'

export default function TxInputs ({ inputs, wallet }) {
  return (
    <div className='d-flex flex-column'>
      {inputs.map((input, index) => (
        <CkbInput key={`tx-input-${index}`} {...input} wallet={wallet} />
      ))}
    </div>
  )
}

function CkbInput ({ since, previousOutput, wallet }) {
  if (previousOutput.txHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return `Cellbase for Block ${BigInt(since).toString()}`
  }

  const [cell, setCell] = useState(null)

  useEffect(
    () => {
      if (previousOutput.txHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return
      }

      wallet.ckbClient
        .loadOutpoint(previousOutput)
        .then(result => { return result })
        .then(setCell)
    },
    [previousOutput],
  )

  return (
    <CkbCell {...cell} />
  )
}