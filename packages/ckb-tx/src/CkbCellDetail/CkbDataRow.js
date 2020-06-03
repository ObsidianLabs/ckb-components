import React, { useState } from 'react'

import {
  ButtonOptions,
  TableCardRow,
} from '@obsidians/ui-components'

export default function CkbDataRow (props) {
  const { data } = props
  if (!data || !data.size()) {
    return (
      <TableCardRow
        name='Data'
        icon='far fa-code'
        badge='0 Bytes'
      />
    )
  }

  const [utf8, toggleUtf8] = useState(true)

  let content = data.toString(utf8 ? 'utf8' : 'hex')
  if (content.length > 1000) {
    content = content.slice(0, 1000) + '...'
  }

  return (
    <TableCardRow
      name='Data'
      icon='far fa-code'
      badge={`${data.size()} Bytes`}
    >
      <div>
        <ButtonOptions
          size='sm'
          className='my-1'
          options={[
            { key: 'utf8', text: 'UTF8' },
            { key: 'hex', text: 'Hex' },
          ]}
          selected={utf8 ? 'utf8' : 'hex'}
          onSelect={key => toggleUtf8(key === 'utf8')}
        />
        <pre
          className='text-muted small mb-0'
          style={{
            textAlign: 'start',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {content}
        </pre>
      </div>
    </TableCardRow>
  )
}