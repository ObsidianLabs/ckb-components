import React from 'react'

import { DockerImageButton } from '@obsidians/docker'

export default () => (
  <DockerImageButton
    imageName='nervos/ckb'
    title='CKB Versions'
    modalTitle='CKB Version Manager'
    noneName='CKB node'
    downloadingTitle='Downloading CKB'
  />
)
