import React from 'react'

import { DownloadImageButton } from '@obsidians/docker'

export default props => (
  <DownloadImageButton
    imageName='muxueqz/ckb-indexer'
    downloadingTitle='Downloading CKB Indexer'
    size={props.size}
    color={props.color}
    right={props.right}
    onDownloaded={props.onDownloaded}
  />
)
