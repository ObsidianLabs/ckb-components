import React, { useRef } from 'react'

import {
  Badge,
  UncontrolledTooltip,
} from '@obsidians/ui-components'

import * as ckbUtils from '@nervosnetwork/ckb-sdk-utils'

export default function CkbData ({ data }) {
  if (!data || data === '0x') {
    return null
  }

  const id = useRef(`data-${Math.floor(Math.random() * 1000)}`)

  let utf8
  if (data.length < 2000) {
    utf8 = ckbUtils.hexToUtf8(data)
  } else {
    utf8 = `${ckbUtils.hexToUtf8(data.substr(0, 2002))}...`
  }

  return <>
    <div id={id.current} className='d-flex flex-row align-items-center'>
      <Badge className='mr-1'>Data</Badge>
      <a className='text-body text-overflow-dots small'><code>{data}</code></a>
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
        >{utf8}</pre>
      </div>
    </UncontrolledTooltip>
  </>
}