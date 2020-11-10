import React from 'react'

import {
  Badge,
  TableCardRow,
} from '@obsidians/ui-components'

export default function CkbScriptRow ({ script, label, icon, children }) {
  if (script.isNull) {
    return (
      <TableCardRow
        name={label}
        icon={icon}
        badge='None'
      />
    )
  }

  if (script.isAddress()) {
    return (
      <TableCardRow
        name={label}
        icon={icon}
        badge={script.hash}
        badgeColor='warning'
      >
        <div className='row ml-2'>
          <div className='col-2 pr-0'><Badge>hashType</Badge></div>
          <div className='col-10 p-0'>{script.hash_type}</div>
          <div className='col-2 pr-0'><Badge>codeHash</Badge></div>
          <div className='col-10 p-0'><code className='small'>{script.code_hash}</code></div>
          <div className='col-2 pr-0'><Badge>args</Badge></div>
          <div className='col-10 p-0'><code className='small'>{script.args.serialize()}</code></div>
          <div className='col-2 pr-0'><Badge>address</Badge></div>
          <div className='col-10 p-0'><code className='small'>{script.getAddress()}</code></div>
        </div>
      </TableCardRow>
    )
  }

  let args = script.args.serialize()
  if (args.length > 200) {
    args = args.slice(0, 200) + '...'
  }

  return (
    <TableCardRow
      name={label}
      icon={icon}
      badge={script.hash}
      badgeColor='warning'
    >
      <div className='row ml-2'>
        <div className='col-2 pr-0'><Badge>hashType</Badge></div>
        <div className='col-10 p-0'>{script.hash_type}</div>
        <div className='col-2 pr-0'><Badge>codeHash</Badge></div>
        <div className='col-10 p-0'><code className='small'>{script.code_hash}</code></div>
        <div className='col-2 pr-0'><Badge>args</Badge></div>
        <div className='col-10 p-0'><code className='small'>{args}</code></div>
        {children}
      </div>
    </TableCardRow>
  )
}