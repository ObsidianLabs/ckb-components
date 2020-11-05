import React, { useState, useEffect } from 'react'

import { useDrag } from 'react-dnd'
import ckbTxManager from '../../ckbTxManager'

import './styles.scss'

export default function CkbCell (props) {
  const { selected, cell } = props

  const [name, setName] = useState('')
  const [status, setStatus] = useState(cell.status)

  useEffect(() => {
    ckbTxManager.getCellInfo(cell.dataHash).then(info => info && setName(info.name || ''))
    return cell.onStatus(status => setStatus(status))
  }, [cell.id])

  const [{ isDragging }, drag] = useDrag({
    item: { cell, type: 'cell' },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult) {
        // alert(`You dropped ${item.name} into ${dropResult.name}!`)
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  let icon = null
  if (cell.anyoneCanPay()) {
    if (selected) {
      icon = <span key='anyone-can-pay-selected'><i className='fa-3x fas fa-wallet' /></span>
    } else {
      icon = <span key='anyone-can-pay'><i className='fa-3x fal fa-wallet' /></span>
    }
  } else if (cell.data.size()) {
    if (cell.udt()) {
      if (selected) {
        icon = <span key='udt-selected'><i className='fa-3x fas fa-file-invoice-dollar' /></span>
      } else {
        icon = <span key='udt'><i className='fa-3x fal fa-file-invoice-dollar' /></span>
      }
    } else {
      if (selected) {
        icon = <span key='with-data-selected'><i className='fa-3x fas fa-file-alt' /></span>
      } else {
        icon = <span key='with-data'><i className='fa-3x fal fa-file-alt' /></span>
      }
    }
  } else {
    if (selected) {
      icon = <span key='no-data-selected'><i className='fa-3x fas fa-file' /></span>
    } else {
      icon = <span key='no-data' ><i className='fa-3x fal fa-file' /></span>
    }
  }

  if (status === 'pending') {
    icon = (
      <div className='p-relative' key='cell-pending'>
        <i className='fa-3x fal fa-file' />
        <div className='ckb-cell-status-icon'>
          <i className='fas fa-spin fa-spinner' />
        </div>
      </div>
    )
  } else if (status === 'used') {
    icon = (
      <div className='p-relative' key='cell-used'>
        <i className='fa-3x fal fa-file' />
        <div className='ckb-cell-status-icon'>
          <i className='fas fa-ban' />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={drag}
      className={`ckb-cell ckb-cell-${status}`}
      style={{ width: '90px', opacity: isDragging ? 0.3 : 1 }}
      onMouseDown={e => e.button === 0 && props.onSelect()}
      onDoubleClick={props.onDoubleClick}
    >
      {icon}
      <div className='w-100 text-center text-overflow-dots mt-1 '>
        {name || cell.id}
      </div>
      <div className='d-flex flex-row justify-content-center w-100 small text-muted'>
        <div className='flex-shrink-1 text-overflow-dots'>{cell.capacity.display()}&nbsp;</div>
        <div className='font-weight-bold'>CKB</div>
      </div>
    </div>
  )
}
