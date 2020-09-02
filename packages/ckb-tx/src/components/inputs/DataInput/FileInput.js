import React, { PureComponent } from 'react'

import {
  Button,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'

export default class FileInput extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selectingFile: false,
      filePath: props.filePath,
      bytes: '',
    }
  }

  async componentDidMount () {
    if (!this.state.filePath) {
      this.selectFile()
    } else if (!this.state.bytes) {
      this.setState({ bytes: this.getFileSize(this.state.filePath) })
    }
  }

  getFileSize = filePath => {
    const stats = fileOps.current.fs.statSync(filePath)
    return stats.size
  }

  selectFile = async () => {
    this.setState({ selectingFile: true })
    try {
      const defaultPath = this.state.filePath ? fileOps.current.path.parse(this.state.filePath).dir : ''
      const file = await fileOps.current.openNewFile(defaultPath)
      this.setState({ selectingFile: false, filePath: file.path, bytes: this.getFileSize(file.path) })
      this.props.onSelectFile(file.path)
    } catch(e) {
      this.setState({ selectingFile: false })
      this.props.onSelectFile()
      return
    }
  }

  render () {
    const { selectingFile, filePath, bytes } = this.state
    if (selectingFile) {
      return (
        <div key='data-input-selecting-file'>
          <i className='fas fa-spin fa-spinner mr-1' />Selecting file...
        </div>
      )
    }
    if (!filePath) {
      return (
        <div key='data-input-no-file' className='d-flex align-items-center'>
          <i className='fas fa-file-times mr-2'/>
          <span className='text-muted'>(None)</span>
          <Button key='data-edit' size='sm' color='transparent' className='ml-1 text-muted' onClick={this.selectFile}>
            <i className='fas fa-pencil-alt' />
          </Button>
        </div>
      )
    }
    return (
      <div key='data-input-file' className='d-flex align-items-center'>
        <i className='fal fa-file-alt fa-2x mr-2' />
        <div>
          <div className='d-flex align-items-center'>
            {filePath}
            <Button key='data-edit' size='sm' color='transparent' className='ml-1 text-muted' onClick={this.selectFile}>
              <i className='fas fa-pencil-alt' />
            </Button>
          </div>
          <div className='text-muted small'>{bytes} Bytes</div>
        </div>
      </div>
    )
  }
}
