import React, { PureComponent } from 'react'
import {
  DebouncedFormGroup,
  InputGroupAddon,
  Button,
} from '@obsidians/ui-components'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'

export default class IconInput extends PureComponent {
  
  constructor (props) {
    super(props)
  }

  onSelect = async () => {
    const { filePaths, canceled } = await fileOps.current.showOpenDialog({
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg'] }
      ]
    })
    if (canceled) {
      return
    }
    const filePath = filePaths[0]
    this.props.onChange(`file://${filePath}`)
  }


  render () {
    const { onChange, value } = this.props
    return (
      <DebouncedFormGroup
        label='Icon'
        value={value}
        onChange={onChange}
        placeholder={`Url starts with http${platform.isDesktop ? '/file' : ''}`}
      >
        {
          platform.isDesktop &&
          <InputGroupAddon addonType="append">
            <Button
              onClick={this.onSelect}
            >Browse</Button>
          </InputGroupAddon>
        }
      </DebouncedFormGroup>
    )
  }
}
