import React, { PureComponent } from 'react'
import moment from 'moment'

import {
  Modal,
  DeleteButton,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '@obsidians/ui-components'

import CkbCompilerInstaller from './CkbCompilerInstaller'
import ckbCompiler from '../ckbCompiler'

export default class CkbCompilerSelector extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: true,
      installed: [],
    }

    this.modal = React.createRef()
    this.refreshVersions()
  }

  refreshVersions = async () => {
    this.setState({ loading: true })
    const versions = await ckbCompiler.invoke('versions')
    this.setState({
      installed: versions,
      loading: false,
    })
    if (versions[0] && !this.props.selected) {
      this.props.onSelected(versions[0].Tag)
    }
  }

  deleteCompilerVersion = async version => {
    await ckbCompiler.invoke('deleteVersion', version)
    await this.refreshVersions()
  }

  renderItems = () => {
    if (this.state.loading) {
      return (
        <DropdownItem key="ckb-compilers-loading" disabled><i className='fas fa-spin fa-spinner mr-1' />Loading...</DropdownItem>
      )
    }

    if (!this.state.installed.length) {
      return (
        <DropdownItem key="ckb-compilers-none" disabled>(No CKB compiler installed)</DropdownItem>
      )
    }

    return this.state.installed.map(v => (
      <DropdownItem
        key={`ckb-compiler-${v.Tag}`}
        active={this.props.selected === v.Tag}
        onClick={() => this.props.onSelected(v.Tag)}
      >
        {v.Tag}
      </DropdownItem>
    ))
  }

  renderTableBody = () => {
    if (this.state.loading) {
      return (
        <tr key='loading'>
          <td align='middle' colSpan={4}>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    }

    if (!this.state.installed.length) {
      return (
        <tr>
          <td align='middle' colSpan={4}>
            (No CKB compiler installed)
          </td>
        </tr>
      )
    }

    return (
      this.state.installed.map(v => (
        <tr key={`table-row-${v.Tag}`} className='hover-block'>
          <td>{v.Tag}</td>
          <td>{moment(v.CreatedAt, 'YYYY-MM-DD HH:mm:ss Z').format('LL')}</td>
          <td>{v.Size}</td>
          <td align='right'>
            <DeleteButton
              onConfirm={() => this.deleteCompilerVersion(v.Tag)}
              textConfirm='Click again to uninstall'
            />
          </td>
        </tr>
      ))
    )
  }

  onOpenManager = () => {
    this.modal.current.openModal()
  }

  render () {
    return (
      <React.Fragment>
        <UncontrolledButtonDropdown direction='up'>
          <DropdownToggle size='sm' color='default' className='rounded-0 text-muted px-2'>
            <i className='fas fa-hammer mr-1' />
            CKB Compiler ({this.props.selected || 'none'})
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem header>
              <i className='far fa-desktop mr-2' />Installed
            </DropdownItem>
            {this.renderItems()}
            <DropdownItem divider />
            <DropdownItem onClick={this.onOpenManager}>
              <i className='fas fa-cog mr-1' />
              CKB Compilers Manager...
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>
        <Modal
          ref={this.modal}
          title='CKB Version Manager'
          ActionBtn={
            <CkbCompilerInstaller
              left
              color='success'
              onDownloaded={this.refreshVersions}
            />
          }
        >
          <table className='table table-sm table-hover table-striped'>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>version</th>
                <th style={{ width: '35%' }}>created</th>
                <th style={{ width: '15%' }}>size</th>
                <th style={{ width: '10%' }} />
              </tr>
            </thead>
            <tbody>
              {this.renderTableBody()}
            </tbody>
          </table>
        </Modal>
      </React.Fragment>
    )
  }
}
