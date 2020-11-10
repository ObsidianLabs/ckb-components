import React, { useRef } from 'react'

import {
  Badge,
  UncontrolledTooltip,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-objects'

export default function CkbType (props) {
  const { type } = props

  if (!type || !type.code_hash || !type.args) {
    return null
  }

  const icon = (
    <Badge color='secondary' className='d-flex mr-1'>Type</Badge>
  )

  if (!type || !type.code_hash || !type.args) {
    return (
      <div className='d-flex flex-row align-items-center'>
        {icon}
        <div className='text-muted small'>(None)</div>
      </div>
    )
  }

  const type_script = new CkbScript(type)
  const typeHash = type_script.hash
  const id = useRef(`type-${typeHash}-${Math.floor(Math.random() * 1000)}`)

  if (type_script.isAddress({ secp256k1Only: true })) {
    const address = type_script.getAddress()
    return (
      <div className='d-flex flex-row align-items-center'>
        <div id={id.current} className='d-flex flex-row align-items-center overflow-hidden'>
          {icon}
          <div className='text-overflow-dots small'><code>{address}</code></div>
        </div>
        <UncontrolledTooltip placement='top' target={id.current} style={{ maxWidth: 800 }}>
          <div className='d-flex flex-column align-items-start'>
            <div><Badge>hashType</Badge> <code>{type.hash_type}</code></div>
            <div><Badge>codeHash (block assembler)</Badge> <code>{type.code_hash}</code></div>
            <div><Badge>address</Badge> <code>{address}</code></div>
          </div>
        </UncontrolledTooltip>
      </div>
    )
  }

  return (
    <div className='d-flex flex-row align-items-center'>
      <div id={id.current} className='d-flex flex-row align-items-center overflow-hidden'>
        {icon}
        <div className='text-overflow-dots small'><code>{typeHash}</code></div>
      </div>
      <UncontrolledTooltip placement='top' target={id.current} style={{ maxWidth: 800 }}>
        <div className='d-flex flex-column align-items-start'>
          <div><Badge>typeHash</Badge> <code>{typeHash}</code></div>
          <div><Badge>hashType</Badge> <code>{type.hash_type}</code></div>
          <div><Badge>codeHash</Badge> <code>{type.code_hash}</code></div>
          <div><Badge>args</Badge> <code>{type.args}</code></div>
        </div>
      </UncontrolledTooltip>
    </div>
  )
}