import React, { useRef } from 'react'

import {
  Badge,
  UncontrolledTooltip,
} from '@obsidians/ui-components'

export default function CkbData ({ data }) {
  if (!data.size()) {
    return null
  }

  const id = useRef(`data-${Math.floor(Math.random() * 1000)}`)

  return <>
    <div id={id.current} className='d-flex flex-row align-items-center'>
      <Badge className='mr-1'>Data</Badge>
      <a className='text-body text-overflow-dots small'><code>{data.serialize()}</code></a>
    </div>
    <UncontrolledTooltip placement='top' target={id.current} style={{ maxWidth: 800 }}>
      <div className='d-flex flex-column align-items-start'>
        <pre
          className='text-white mb-0'
          style={{
            textAlign: 'start',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >{data.display(2000, 'utf8')}</pre>
      </div>
    </UncontrolledTooltip>
  </>
}