import React, { PureComponent } from 'react'

import KeypairManagerModal from './KeypairManagerModal'

export default class CkbKeypairButton extends PureComponent {
  constructor (props) {
    super(props)
    this.modal = React.createRef()
  }

  openModal = () => {
    this.modal.current.openModal()
  }

  render () {
    return (
      <React.Fragment>
        <div onClick={this.openModal}>{this.props.children}</div>
        <KeypairManagerModal ref={this.modal} />
      </React.Fragment>
    )
  }
}