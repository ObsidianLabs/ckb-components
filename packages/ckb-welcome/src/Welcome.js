import React, { PureComponent } from 'react'
import {
  Button,
  ListGroup,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import { ListItemDocker, ListItemDockerImage } from '@obsidians/docker'

import { instanceChannel } from '@obsidians/ckb-network'
import ckbCompiler from '@obsidians/ckb-compiler'

import checkDependencies from './checkDependencies'

export default class Welcome extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      ready: false
    }
    this.listItemDocker = React.createRef()
    this.listItemCkbNode = React.createRef()
    this.listItemCkbIndexer = React.createRef()
    this.listItemCapsule = React.createRef()
    this.listItemCkbCompiler = React.createRef()
  }

  componentDidMount () {
    this.mounted = true
    this.refresh()
    fileOps.current.onFocus(this.refresh)
  }

  componentWillUnmount () {
    this.mounted = false
    fileOps.current.offFocus(this.refresh)
  }

  refresh = async () => {
    if (this.mounted) {
      this.listItemDocker.current.refresh()
      this.listItemCkbNode.current.refresh()
      this.listItemCkbIndexer.current.refresh()
      this.listItemCapsule.current.refresh()
      this.listItemCkbCompiler.current.refresh()
      const ready = await checkDependencies()
      this.setState({ ready })
    }
  }

  render () {
    return (
      <div className='d-flex h-100 overflow-auto'>
        <div className='jumbotron jumbotron-fluid'>
          <div className='container'>
            <h4 className='display-4'>Welcome to CKB Studio</h4>

            <p className='lead'>CKB Studio is a graphic IDE for developing CKB scripts.
            To get started, please install the prerequisite tools for CKB.</p>

            <div className='my-3' />

            <ListGroup>
              <ListItemDocker
                ref={this.listItemDocker}
                onStartedDocker={this.refresh}
              />
              <ListItemDockerImage
                ref={this.listItemCkbNode}
                channel={instanceChannel.ckbNode}
                title='CKB Node'
                subtitle='The main software that runs CKB node and CKB miner.'
                link='https://hub.docker.com/r/nervos/ckb'
                downloadingTitle='Downloading CKB'
                onInstalled={this.refresh}
              />
              <ListItemDockerImage
                ref={this.listItemCkbIndexer}
                channel={instanceChannel.ckbIndexer}
                title='CKB Indexer'
                subtitle='A library that keeps track of live cells and transactions'
                link='https://hub.docker.com/r/nervos/ckb-indexer'
                downloadingTitle='Downloading CKB Indexer'
                onInstalled={this.refresh}
              />
              <ListItemDockerImage
                ref={this.listItemCapsule}
                channel={ckbCompiler.capsule}
                title='Capsule'
                subtitle='A framework for creating CKB scripts in Rust'
                link='https://github.com/nervosnetwork/capsule'
                downloadingTitle='Downloading Capsule'
                onInstalled={this.refresh}
              />
              <ListItemDockerImage
                ref={this.listItemCkbCompiler}
                channel={ckbCompiler.regular}
                title='CKB Compiler'
                subtitle='CKB compiler is required to compile CKB scripts.'
                link='https://hub.docker.com/r/nervos/ckb-riscv-gnu-toolchain'
                downloadingTitle='Downloading CKB Compiler'
                onInstalled={this.refresh}
              />
            </ListGroup>
            <Button
              block
              color={this.state.ready ? 'primary' : 'secondary'}
              size='lg'
              className='my-5 mx-auto'
              style={{ width: 'fit-content' }}
              onClick={this.props.onGetStarted}
            >
              {this.state.ready ? 'Get Started' : 'Skip'}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
