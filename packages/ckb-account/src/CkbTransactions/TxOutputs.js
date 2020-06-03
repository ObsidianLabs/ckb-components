import React from 'react'

import CkbCell from './CkbCell'

export default function TxOutputs ({ outputs, outputsData, wallet }) {
  return (
    <div className='d-flex flex-column'>
      {
        outputs.map((output, index) => (
          <CkbCell
            key={index}
            {...output}
            data={outputsData[index]}
            wallet={wallet}
          />
        ))
      }
    </div>
  )
}
