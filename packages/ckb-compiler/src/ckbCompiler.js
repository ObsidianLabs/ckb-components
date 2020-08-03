import { DockerImageChannel } from '@obsidians/docker'
import notification from '@obsidians/notification'

class CkbCompiler {
  constructor () {
    this.capsule = new DockerImageChannel(`obsidians/capsule`)
    this.regular = new DockerImageChannel(`nervos/ckb-riscv-gnu-toolchain`)
    this._terminal = null
    this._button = null
    this.notification = null
  }

  set terminal (v) {
    this._terminal = v
  }

  set button (v) {
    this._button = v
  }

  get projectRoot () {
    if (!this._terminal) {
      throw new Error('CkbCompilerTerminal is not instantiated.')
    }
    return this._terminal.props.cwd
  }

  get compilerVersion () {
    if (!this._button) {
      throw new Error('CkbCompilerButton is not instantiated.')
    }
    return this._button.props.version
  }

  focus () {
    if (this._terminal) {
      this._terminal.focus()
    }
  }

  async build (config = {}) {
    const version = this.compilerVersion
    const projectRoot = this.projectRoot

    this._button.setState({ building: true })
    this.notification = notification.info(`Building CKB Script`, `Building...`, 0)

    let cmd
    if (config.language === 'rust') {
      cmd = this.generateBuildCmdForRust(config, { version, projectRoot })
    } else if (config.language === 'c') {
      cmd = this.generateBuildCmdForC(config, { version, projectRoot })
    } else {
      cmd = config.scripts.build
    }
    const result = await this._terminal.exec(cmd)

    this._button.setState({ building: false })
    this.notification.dismiss()

    if (result.code) {
      notification.error('Build Failed', `Code has errors.`)
      throw new Error(result.logs)
    }
    notification.success('Build Successful', `CKB script is built.`)
  }

  generateBuildCmdForRust(config, { version, projectRoot }) {
    const cmd = config.scripts?.build || 'capsule build'
    return [
      'docker', 'run', '-t', '--rm', '--name', `ckb-compiler-${version}`,
      `-v /var/run/docker.sock:/var/run/docker.sock`,
      '-v', `"${projectRoot}":"${projectRoot}"`,
      '-w', `"${projectRoot}"`,
      `obsidians/capsule:${version}`,
      cmd
    ].join(' ')
  }

  generateBuildCmdForC(config, { version, projectRoot }) {
    const cmd = this.commandForC(config)
    return [
      'docker', 'run', '-t', '--rm', '--name', `ckb-compiler-${version}`,
      '--volume', `"${projectRoot}:/project"`,
      '-w', '/project',
      `nervos/ckb-riscv-gnu-toolchain:${version}`,
      '/bin/bash', '-c',
      `"${cmd}"`
    ].join(' ')
  }

  commandForC(config) {
    if (config.scripts.build) {
      return config.scripts.build
    }

    const output = config.output || config.main.replace('.cpp', '.o').replace('.c', '.o')
    if (version.indexOf('gnu') > -1) {
      return `riscv64-unknown-linux-gnu-gcc -Os ${config.main} -o ${output}`
    } else {
      return `riscv64-unknown-elf-gcc -Os ${config.main} -o ${output}`
    }
  }

  async stop () {
    if (this._terminal) {
      await this._terminal.stop()
    }
  }
}

export default new CkbCompiler()