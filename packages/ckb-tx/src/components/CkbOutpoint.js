import React from 'react'

export default function CkbOutpoint ({ id }) {
  return (
    <div className='small text-overflow-dots'>
      <code>{id}</code>
    </div>
  )
}