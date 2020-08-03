import React from 'react'
import CacheRoute from 'react-router-cache-route'

import { DockerImageSelector } from '@obsidians/docker'
import { KeypairButton } from '@obsidians/keypair'
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

          if (props.projectLanguage === 'rust') {
            return (
              <DockerImageSelector
                imageName='obsidians/capsule'
                icon='fas fa-hammer'
                title='Capsule'
                noneName='Capsule'
                modalTitle='Capsule Manager'
                downloadingTitle='Downloading Capsule'
                selected={props.compilerVersion}
                onSelected={compilerVersion => props.onSelectCompiler(compilerVersion)}
              />
            )
          }

          return (
            <DockerImageSelector
              imageName='nervos/ckb-riscv-gnu-toolchain'
              icon='fas fa-hammer'
              title='CKB Compiler'
              noneName='CKB compiler'
              modalTitle='CKB Compiler Manager'
              downloadingTitle='Downloading CKB Compiler'
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
