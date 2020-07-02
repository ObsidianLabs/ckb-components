import React, { useRef } from 'react'

import {
  Badge,
  UncontrolledTooltip,
} from '@obsidians/ui-components'

import { CkbScript } from '@obsidians/ckb-tx-builder'

export default function CkbLock (props) {
  const { lock } = props

  if (!lock || !lock.codeHash || !lock.args) {
    return (
      <div className='d-flex flex-row align-items-center'>
        <Badge color='secondary' className='d-flex mr-1'>
          Lock
        </Badge>
        <div className='text-muted small'>(None)</div>
      </div>
    )
  }

  const lockScript = new CkbScript(lock)
  const lockHash = lockScript.hash
  const id = useRef(`lock-${lockHash}-${Math.floor(Math.random() * 1000)}`)

  if (lockScript.isAddress({ secp256k1Only: true })) {
    const address = lockScript.getAddress()
    return (
      <React.Fragment>
        <div className='d-flex flex-row align-items-center small'>
          <div id={id.current}>
            <a href={`#/account/${address}`} className='text-body'>
              <code>{address.substr(0, 13)}...{address.substr(36, 46)}</code>
            </a>
          </div>
        </div>
        <UncontrolledTooltip placement='top' target={id.current} style={{ maxWidth: 800 }}>
          <div className='d-flex flex-column align-items-start'>
            <div><Badge>lockHash</Badge> <code>{lockHash}</code></div>
            <div><Badge>hashType</Badge> <code>{lock.hashType}</code></div>
            <div><Badge>codeHash (block assembler)</Badge> <code>{lock.codeHash}</code></div>
            <div><Badge>args</Badge> <code>{lock.args}</code></div>
            <div><Badge>address</Badge> <code>{address}</code></div>
          </div>
        </UncontrolledTooltip>
      </React.Fragment>
    )
  }


  return (
    <div className='d-flex flex-row align-items-center'>
      <div id={id.current} className='text-overflow-dots d-flex flex-row align-items-center'>
        <Badge color='secondary' className='d-flex mr-1'>
          Lock
        </Badge>
        <div className='d-flex small'>
          <a href={`#/account/${lockHash}`} className='text-body'>
            <code>{lockHash.substr(0, 10)}...{lockHash.substr(58, 66)}</code>
          </a>
        </div>
      </div>
      <UncontrolledTooltip placement='top' target={id.current} style={{ maxWidth: 800 }}>
        <div className='d-flex flex-column align-items-start'>
          <div><Badge>lockHash</Badge> <code>{lockHash}</code></div>
          <div><Badge>hashType</Badge> <code>{lock.hashType}</code></div>
          <div><Badge>codeHash</Badge> <code>{lock.codeHash}</code></div>
          <div><Badge>args</Badge> <code>{lock.args}</code></div>
        </div>
      </UncontrolledTooltip>
    </div>
  )
}