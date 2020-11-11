import React from 'react'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'

import { NewProjectModal } from '@obsidians/workspace'
import { DockerImageInputSelector } from '@obsidians/docker'
import ckbCompiler from '@obsidians/ckb-compiler'

export default class NewCkbProjectModal extends NewProjectModal {
  constructor (props) {
    super(props)

    this.state = {
      ...this.state,
      capsuleVersion: '',
    }
  }

  async createProject ({ projectRoot, name, template }) {
    if (platform.isDesktop && template === 'rust') {
      this.setState({ showTerminal: true })
      const capsuleVersion = this.state.capsuleVersion
      if (!capsuleVersion) {
        notification.error('Cannot Create the Project', 'Please select a version for Capsule.')
        return false
      }
      const { dir, name: projectName } = fileOps.current.path.parse(projectRoot)
      await fileOps.current.ensureDirectory(dir)
      const projectDir = fileOps.current.getDockerMountPath(dir)
      const cmd = [
        `docker run --rm -it`,
        `--name ckb-create-project`,
        '-v /var/run/docker.sock:/var/run/docker.sock',
        `-v "${projectDir}:${projectDir}"`,
        `-w "${projectDir}"`,
        `obsidians/capsule:${capsuleVersion}`,
        `capsule new ${projectName}`,
      ].join(' ')

      const result = await this.terminal.current.exec(cmd)

      if (result.code) {
        notification.error('Cannot Create the Project')
        return false
      }

      const ckbconfig = {
        language: 'rust',
        main: `contracts/${projectName}/src/main.rs`,
        compilers: {
          capsule: capsuleVersion,
        },
      }
      await fileOps.current.writeFile(fileOps.current.path.join(projectRoot, 'ckbconfig.json'), JSON.stringify(ckbconfig, null, 2))
      return { projectRoot, name: projectName }
    } else {
      return super.createProject({ projectRoot, name, template })
    }
  }

  renderOtherOptions = () => {
    if (this.state.template !== 'rust') {
      return null
    }
    return (
      <DockerImageInputSelector
        channel={ckbCompiler.capsule}
        label='Capsule version'
        noneName='Capsule'
        modalTitle='Capsule Manager'
        downloadingTitle='Downloading Capsule'
        selected={this.state.capsuleVersion}
        onSelected={capsuleVersion => this.setState({ capsuleVersion })}
      />
    )
  }
}

NewCkbProjectModal.defaultProps = {
  defaultTemplate: 'moleculec-es-template',
  templates: [
    {
      group: 'Rust',
      badge: 'Rust',
      children: [
        { id: 'rust', display: 'CKB project in Rust' },
      ],
    },
    {
      group: 'JavaScript',
      badge: 'JavaScript',
      children: [
        { id: 'moleculec-es-template', display: 'moleculec-es' },
        { id: 'molecule-javascript-template', display: 'molecule-javascript' },
        { id: 'js-minimal', display: 'minimal' },
        { id: 'htlc', display: 'HTLC' },
      ],
    },
    {
      group: 'C',
      badge: 'C',
      children: [
        { id: 'carrot', display: 'carrot' },
        { id: 'simple-udt', display: 'Simple UDT' },
      ],
    },
    {
      group: 'Other',
      badge: 'Other',
      children: [
        { id: 'duktape', display: 'Duktape' },
      ],
    },
  ]
}