import React from 'react'

import {
  Badge,
} from '@obsidians/ui-components'

import CkbLock from './CkbLock'
import CkbType from './CkbType'
import CkbData from './CkbData'

import * as ckbUtils from '@nervosnetwork/ckb-sdk-utils'
import { CkbCapacity } from '@obsidians/ckb-tx-builder'

export default function CkbCell (props) {
  if (!props || !props.capacity) {
    return null
  }

  const { capacity, lock, type, data, wallet } = props

  let toMyself = null
  if (wallet) {
    toMyself = wallet.lockHash === ckbUtils.scriptToHash(lock)
  }
  return (
    <div>
      <div className='d-flex flex-row justify-content-between align-items-center'>
        <div className='d-flex flex-row align-items-center'>
          <i className={`fas fa-caret-right mr-1 ${toMyself ? 'text-primary' : 'text-muted'}`} />
          <CkbLock lock={lock} />
        </div>
        <div className='d-flex'>
          <Badge pill color={toMyself ? 'primary' : 'secondary'}>
            {new CkbCapacity(capacity).toString()} CKB
          </Badge>
        </div>
      </div>
      <div className='ml-2 pl-1'><CkbType type={type} /></div>
      <div className='ml-2 pl-1'><CkbData data={data} /></div>
    </div>
  )
}