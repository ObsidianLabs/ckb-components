import React from 'react'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import Auth from '@obsidians/auth'

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
    const languageGroup = this.props.templates.find(({ children }) => {
      return children.find(child => child.id === template)
    })
    const language = languageGroup.group.toLowerCase()

    let projectName, created
    let ckbconfig = {
      language,
    }

    if (language === 'rust') {
      this.setState({ showTerminal: true })
      const capsuleVersion = this.state.capsuleVersion
      if (!capsuleVersion) {
        notification.error('Cannot Create the Project', 'Please select a version for Capsule.')
        return false
      }

      let cmd
      let options = {}
  
      if (platform.isDesktop) {
        const { dir, parsedName } = fileOps.current.path.parse(projectRoot)
        projectName = parsedName
        await fileOps.current.ensureDirectory(dir)
        const projectDir = fileOps.current.getDockerMountPath(dir)
        cmd = [
          `docker run --rm -it`,
          `--name ckb-create-project`,
          '-v /var/run/docker.sock:/var/run/docker.sock',
          `-v "${projectDir}:${projectDir}"`,
          `-w "${projectDir}"`,
          `obsidians/capsule:${capsuleVersion}`,
          `capsule new ${projectName}`,
        ].join(' ')
      } else {
        created = await super.createProject({ projectRoot, name, notify: false })
        projectName = created.name
        cmd = `capsule new ${projectName}`
        options = {
          image: `obsidians/capsule:${capsuleVersion}`,
          language,
          cwd: `${Auth.username}/${projectName}`
        }
      }

      const result = await this.terminal.current.exec(cmd, options)
      if (result.code) {
        notification.error('Cannot Create the Project')
        return false
      }

      ckbconfig = {
        ...ckbconfig,
        main: `contracts/${projectName}/src/main.rs`,
        compilers: {
          capsule: capsuleVersion,
        },
      }
    } else if (language === 'c') {
      created = await super.createProject({ projectRoot, name, template, notify: false })
      const templateObj = languageGroup.children.find(child => child.id === template)
      ckbconfig = {
        ...ckbconfig,
        main: templateObj.main || `${created.name}.c`
      }
    } else {
      created = await super.createProject({ projectRoot, name, template, notify: false })
    }
    
    let pathConfig
    if (platform.isDesktop) {
      pathConfig = fileOps.current.path.join(projectRoot, 'ckbconfig.json')
    } else {
      if (!created) {
        notification.error('Cannot Create the Project')
        return false
      }
      const { _id, userId } = created
      pathConfig = `${created.public ? 'public' : 'private'}/${userId}/${_id}/ckbconfig.json`
    }

    await fileOps.current.writeFile(pathConfig, JSON.stringify(ckbconfig, null, 2))
    notification.success('Successful', `New project <b>${name}</b> is created.`)
    return platform.isDesktop ? { projectRoot, name: projectName } : created
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
        { id: 'simple-udt', display: 'Simple UDT', main: 'simple_udt.c' },
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

if (platform.isWeb) {
  const defaultProps = NewCkbProjectModal.defaultProps
  defaultProps.defaultTemplate = 'simple-udt'
  defaultProps.templates = defaultProps.templates.filter(t => t.group !== 'JavaScript' && t.group !== 'Other')
}
