import React from 'react'

import {
  Badge,
} from '@obsidians/ui-components'

import CkbLock from './CkbLock'
import CkbType from './CkbType'
import CkbData from './CkbData'

import { CkbCapacity } from '@obsidians/ckb-objects'

export default function CkbCell (props) {
  if (!props || !props.capacity) {
    return null
  }

  const { capacity, lock, type, data, capacityColor } = props

  return (
    <div>
      <div className='d-flex flex-row justify-content-between align-items-center'>
        <div className='d-flex flex-row align-items-center'>
          <i className={`fas fa-caret-right mr-1 ${capacityColor ? 'text-primary' : 'text-muted'}`} />
          <CkbLock lock={lock} />
        </div>
        <div className='d-flex'>
          <Badge pill color={capacityColor || 'secondary'}>
            {new CkbCapacity(capacity).toString()} CKB
          </Badge>
        </div>
      </div>
      <div className='ml-2 pl-1'><CkbType type={type} /></div>
      <div className='ml-2 pl-1'><CkbData data={data} /></div>
    </div>
  )
}