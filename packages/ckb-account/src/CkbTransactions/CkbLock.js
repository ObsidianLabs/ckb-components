import React, { useRef } from 'react'

import {
  Badge,
  UncontrolledTooltip,
} from '@obsidians/ui-components'

import { Link } from 'react-router-dom'

import { CkbScript } from '@obsidians/ckb-objects'

export default function CkbLock (props) {
  const { lock } = props

  if (!lock || !lock.code_hash || !lock.args) {
    return (
      <div className='d-flex flex-row align-items-center'>
        <Badge color='secondary' className='d-flex mr-1'>
          Lock
        </Badge>
        <div className='text-muted small'>(None)</div>
      </div>
    )
  }

  const lock_script = new CkbScript(lock)
  const lock_hash = lock_script.hash
  const id = useRef(`lock-${lock_hash}-${Math.floor(Math.random() * 1000)}`)

  if (lock_script.isAddress({ secp256k1Only: true })) {
    const address = lock_script.getAddress()
    return <>
      <div className='d-flex flex-row align-items-center small'>
        <div id={id.current}>
          <Link to={`/account/${address}`} className='text-body'>
            <code>{address.substr(0, 13)}...{address.substr(36, 46)}</code>
          </Link>
        </div>
      </div>
      <UncontrolledTooltip placement='top' target={id.current} style={{ maxWidth: 800 }}>
        <div className='d-flex flex-column align-items-start'>
          <div><Badge>lockHash</Badge> <code>{lock_hash}</code></div>
          <div><Badge>hashType</Badge> <code>{lock.hash_type}</code></div>
          <div><Badge>codeHash (block assembler)</Badge> <code>{lock.code_hash}</code></div>
          <div><Badge>args</Badge> <code>{lock.args}</code></div>
          <div><Badge>address</Badge> <code>{address}</code></div>
        </div>
      </UncontrolledTooltip>
    </>
  }


  return (
    <div className='d-flex flex-row align-items-center'>
      <div id={id.current} className='text-overflow-dots d-flex flex-row align-items-center'>
        <Badge color='secondary' className='d-flex mr-1'>
          Lock
        </Badge>
        <div className='d-flex small'>
          <Link href={`/account/${lock_hash}`} className='text-body'>
            <code>{lock_hash.substr(0, 10)}...{lock_hash.substr(58, 66)}</code>
          </Link>
        </div>
      </div>
      <UncontrolledTooltip placement='top' target={id.current} style={{ maxWidth: 800 }}>
        <div className='d-flex flex-column align-items-start'>
          <div><Badge>lockHash</Badge> <code>{lock_hash}</code></div>
          <div><Badge>hashType</Badge> <code>{lock.hash_type}</code></div>
          <div><Badge>codeHash</Badge> <code>{lock.code_hash}</code></div>
          <div><Badge>args</Badge> <code>{lock.args}</code></div>
        </div>
      </UncontrolledTooltip>
    </div>
  )
}