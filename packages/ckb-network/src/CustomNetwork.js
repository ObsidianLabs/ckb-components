import React, { PureComponent } from 'react'

import {
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

import nodeManager from '@obsidians/ckb-node'
import moment from 'moment'

export default class CustomNetwork extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      nodeUrl: ''
    }
  }

  render () {
    return (
      <div className='d-flex flex-1 flex-column overflow-auto'>
        <div className='d-flex'>
          <div className='col-6 p-0 border-right-black'>
            <TableCard title='Custom Network'>
              <TableCardRow
                name='Node URL'
                badge={'https://'}
                badgeColor='primary'
              />
            </TableCard>
          </div>
          <div className='col-6 p-0'>
            <TableCard title='Blocks'>
              <TableCardRow
                name='Block Number'
                badge=''
              />
            </TableCard>
          </div>
        </div>
        <div className='d-flex flex-fill'>
          <div className='col-12 p-0 border-top-black'>
          </div>
        </div>
      </div>
    )
  }
}


