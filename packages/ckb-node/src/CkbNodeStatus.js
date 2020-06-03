import React, { PureComponent } from 'react'

import ckbNode from './ckbNode'

export default class CkbNodeStatus extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      lifecycle: 'stopped',
      blockNumber: ''
    }
  }

  componentDidMount () {
    ckbNode.status = this
  }

  render () {
    if (this.state.lifecycle === 'stopped') {
      return null
    }
    return (
      <div className="btn btn-sm btn-secondary">
        <i className='fas fa-circle-notch fa-spin' /> {this.state.blockNumber}
      </div>
    )
  }
}
