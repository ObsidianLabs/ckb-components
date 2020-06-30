import React from 'react'
import CacheRoute from 'react-router-cache-route'

import { KeypairButton } from '@obsidians/keypair'
import { CkbCompilerSelector } from '@obsidians/ckb-compiler'
import { TerminalButton } from '@obsidians/ckb-project'

export default function CkbBottomBar (props) {
  return (
    <React.Fragment>
      <KeypairButton>
        <div className='btn btn-primary btn-sm btn-flat'>
          <i className='fas fa-key' />
        </div>
      </KeypairButton>
      <div className='flex-1' />
      <CacheRoute
        path={`/guest/:project`}
        render={() => {
          if (!props.projectValid) {
            return null
          }
          return (
            <CkbCompilerSelector
              selected={props.compilerVersion}
              onSelected={compilerVersion => props.onSelectCompiler(compilerVersion)}
            />
          )
        }}
      />
      <CacheRoute
        path={`/guest/:project`}
        component={TerminalButton}
      />
    </React.Fragment>
  )
}
