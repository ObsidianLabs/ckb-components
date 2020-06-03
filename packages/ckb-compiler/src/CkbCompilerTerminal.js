import React from 'react'

import Terminal from '@obsidians/terminal'

import ckbCompiler from './ckbCompiler'

export default function (props) {
  return (
    <Terminal
      {...props}
      ref={ref => (ckbCompiler.terminal = ref)}
      logId='ckb-compiler'
      input
    />
  )
}