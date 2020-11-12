import React from 'react'
import CacheRoute from 'react-router-cache-route'

import { KeypairButton } from '@obsidians/keypair'
import { TerminalButton } from '@obsidians/workspace'

import { QueueButton } from '@obsidians/ckb-queue'
import { CompilerSelector } from '@obsidians/ckb-project'

export default function CkbBottomBar (props) {
  const username = props.profile.get('username') || 'local'
  return <>
    <KeypairButton>
      <div className='btn btn-primary btn-sm btn-flat'>
        <i className='fas fa-key' />
      </div>
    </KeypairButton>
    <QueueButton txs={props.txs} />
    <div className='flex-1' />
    <CacheRoute
      path={`/${username}/:project?`}
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
      path={`/${username}/:project`}
      component={TerminalButton}
    />
  </>
}
