import React from 'react'

import CkbCell from './CkbCell'

export default function TxOutputs ({ outputs, outputsData, wallet }) {
  return (
    <div className='d-flex flex-1 flex-column overflow-hidden'>
      {
        outputs.map((output, index) => (
          <CkbCell
            key={index}
            {...output}
            data={outputsData[index]}
            capacityColor={output.self && 'primary'}
          />
        ))
      }
    </div>
  )
}
