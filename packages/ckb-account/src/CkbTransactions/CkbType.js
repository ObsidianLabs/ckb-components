import React, { useRef } from 'react'

import {
  Badge,
  UncontrolledTooltip,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-tx-builder'

export default function CkbType (props) {
  const { type } = props

  if (!type || !type.codeHash || !type.args) {
    return null
  }

  const icon = (
    <Badge color='secondary' className='d-flex mr-1'>Type</Badge>
  )

  if (!type || !type.codeHash || !type.args) {
    return (
      <div className='d-flex flex-row align-items-center'>
        {icon}
        <div className='text-muted small'>(None)</div>
      </div>
    )
  }

  const typeScript = new CkbScript(type)
  const typeHash = typeScript.hash
  const id = useRef(`type-${typeHash}-${Math.floor(Math.random() * 1000)}`)

  if (typeScript.isAddress({ secp256k1Only: true })) {
    const address = typeScript.getAddress()
    return (
      <div className='d-flex flex-row align-items-center'>
        <div id={id.current} className='text-overflow-dots'>
          {icon}
          <div className='small'><code>{address}</code></div>
        </div>
        <UncontrolledTooltip placement='top' target={id.current} style={{ maxWidth: 800 }}>
          <div className='d-flex flex-column align-items-start'>
            <div><Badge>hashType</Badge> <code>{type.hashType}</code></div>
            <div><Badge>codeHash (block assembler)</Badge> <code>{type.codeHash}</code></div>
            <div><Badge>address</Badge> <code>{address}</code></div>
          </div>
        </UncontrolledTooltip>
      </div>
    )
  }

  return (
    <div className='d-flex flex-row align-items-center'>
      <div id={id.current} className='text-overflow-dots d-flex flex-row align-items-center'>
        {icon}
        <div className='d-flex small'><code>{typeHash}</code></div>
      </div>
      <UncontrolledTooltip placement='top' target={id.current} style={{ maxWidth: 800 }}>
        <div className='d-flex flex-column align-items-start'>
          <div><Badge>typeHash</Badge> <code>{typeHash}</code></div>
          <div><Badge>hashType</Badge> <code>{type.hashType}</code></div>
          <div><Badge>codeHash</Badge> <code>{type.codeHash}</code></div>
          <div><Badge>args</Badge> <code>{type.args}</code></div>
        </div>
      </UncontrolledTooltip>
    </div>
  )
}