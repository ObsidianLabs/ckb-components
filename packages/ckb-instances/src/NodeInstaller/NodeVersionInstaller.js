import React from 'react'

import { DownloadImageButton } from '@obsidians/docker'

export default props => (
  <DownloadImageButton
    imageName='nervos/ckb'
    downloadingTitle='Downloading CKB'
    size={props.size}
    color={props.color}
    right={props.right}
    onDownloaded={props.onDownloaded}
  />
)
