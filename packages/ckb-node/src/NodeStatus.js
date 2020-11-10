import React, { PureComponent } from 'react'

import nodeManager from './nodeManager'

export default class NodeStatus extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      lifecycle: 'stopped',
      block_number: ''
    }
  }

  componentDidMount () {
    nodeManager.status = this
  }

  render () {
    if (this.state.lifecycle === 'stopped') {
      return null
    }
    return (
      <div className="btn btn-sm btn-secondary">
        <i className='fas fa-circle-notch fa-spin' /> {this.state.block_number}
      </div>
    )
  }
}
