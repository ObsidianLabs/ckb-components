import React from 'react'

import CkbCell from './CkbCell'

import * as ckbUtils from '@nervosnetwork/ckb-sdk-utils'

export default function TxOutputs ({ outputs, outputsData, wallet }) {
  return (
    <div className='d-flex flex-1 flex-column overflow-hidden'>
      {
        outputs.map((output, index) => (
          <CkbCell
            key={index}
            {...output}
            data={outputsData[index]}
            capacityColor={wallet.lockHash === ckbUtils.scriptToHash(output.lock) && 'primary'}
          />
        ))
      }
    </div>
  )
}
