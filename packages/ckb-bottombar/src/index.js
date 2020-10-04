import React from 'react'
import CacheRoute from 'react-router-cache-route'

import { KeypairButton } from '@obsidians/keypair'
import { QueueButton } from '@obsidians/ckb-queue'

import { TerminalButton, CompilerSelector } from '@obsidians/ckb-project'

export default function CkbBottomBar (props) {
  return <>
    <KeypairButton>
      <div className='btn btn-primary btn-sm btn-flat'>
        <i className='fas fa-key' />
      </div>
    </KeypairButton>
    <QueueButton txs={props.txs} />
    <div className='flex-1' />
    <CacheRoute
      path={`/guest/:project?`}
      render={({ match }) => {
        const project = match?.params?.project
        if (!project) {
          return null
        } else if (!props.projectValid) {
          return null
        }
        
        return <CompilerSelector />
      }}
    />
    <CacheRoute
      path={`/guest/:project`}
      component={TerminalButton}
    />
  </>
}
