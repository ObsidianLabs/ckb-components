import React, { PureComponent } from 'react'

import {
  Modal,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { KeypairSelector } from '@obsidians/keypair'
import fileOps from '@obsidians/file-ops'
import { CkbData } from '@obsidians/ckb-objects'
import { networkManager } from '@obsidians/ckb-network'
import { ckbTxManager } from '@obsidians/ckb-tx'

import { withRouter } from 'react-router-dom'

class CreateCell extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      name: '',
      pathInProject: '',
      signer: '',
      pending: false,
    }
    this.data = null
    this.modal = React.createRef()
  }

  componentDidMount () {
    this.props.projectManager.createCellButton = this
  }

  open = async node => {
    this.setState({ loading: true, pending: false, name: node.name, pathInProject: node.pathInProject })
    this.modal.current.openModal()

    const content = await fileOps.current.readFile(node.path)
    this.data = new CkbData(content)

    this.setState({ loading: false })
  }

  onConfirm = async () => {
    const signer = this.state.signer
    this.setState({ pending: true })

    const rawTx = networkManager.txBuilder.newTx().to(signer, null, this.data)
    const minCapacity = rawTx.estimate().out

    rawTx.fee(0.001)
    rawTx.from(signer, minCapacity)

    let tx
    try {
      tx = await rawTx.generate()
    } catch (e) {
      this.setState({ pending: false })
      notification.error('Error', e.message)
      return
    }

    this.props.history.push(`/tx/${signer}`)
    await new Promise(resolve => setTimeout(resolve, 100))
    ckbTxManager.visualizeTransaction(tx)
    this.setState({ pending: false })
    this.modal.current.closeModal()
  }

  closeModal = () => {
    this.modal.current.closeModal()
  }

  renderFileData = () => {
    if (this.state.name) {
      if (this.state.loading) {
        return (
          <div key='data-input-file' className='d-flex align-items-center mb-3'>
            <i className='fal fa-file-alt fa-2x mr-2' />
            <div>
              <div className='d-flex align-items-center'>
                {this.state.pathInProject}
              </div>
              <div key='loading' className='text-muted small'><i className='fas fa-spinner fa-spin mr-1' />Loading file content...</div>
            </div>
          </div>
        )
      } else {
        return (
          <div key='data-input-file' className='d-flex align-items-center mb-3'>
            <i className='fal fa-file-alt fa-2x mr-2' />
            <div>
              <div className='d-flex align-items-center'>
                {this.state.pathInProject}
              </div>
              <div className='text-muted small'>{this.data.size()} Bytes</div>
            </div>
          </div>
        )
      }
    }
    return null
  }

  render () {
    const { loading, name, pending } = this.state

    let icon = <span key='deploy-icon'><i className='fab fa-docker' /></span>
    if (this.state.pending) {
      icon = <span key='deploying-icon'><i className='fas fa-spinner fa-spin' /></span>
    }

    return (
      <Modal
        ref={this.modal}
        overflow
        title={<span>Create Cell from <b>{name}</b></span>}
        onConfirm={this.onConfirm}
        pending={pending && 'Building Transaction...'}
        confirmDisabled={loading}
      >
        {this.renderFileData()}
        <KeypairSelector
          label='Signer'
          value={this.state.signer}
          onChange={signer => this.setState({ signer })}
        />
      </Modal>
    )
  }
}

export default withRouter(CreateCell)
