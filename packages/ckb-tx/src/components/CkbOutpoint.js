import React from 'react'

export default function CkbOutpoint ({ id }) {
  return (
    <React.Fragment>
      <div className='small text-overflow-dots'>
        <code>{id}</code>
      </div>
    </React.Fragment>
  )
}