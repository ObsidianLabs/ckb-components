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
    if (config.scripts.build) {
      cmd = config.scripts.build
    } else {
      const output = config.output || config.main.replace('.cpp', '.o').replace('.c', '.o')
      if (version.indexOf('gnu') > -1) {
        cmd = `riscv64-unknown-linux-gnu-gcc -Os ${config.main} -o ${output}`
      } else {
        cmd = `riscv64-unknown-elf-gcc -Os ${config.main} -o ${output}`
      }
    }
    if (config.language !== 'javascript') {
      cmd = this.generateDockerBuildCmd(cmd, { version, projectRoot })
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

  async stop () {
    if (this._terminal) {
      await this._terminal.stop()
    }
  }

  generateDockerBuildCmd(cmd, { version, projectRoot }) {
    return [
      'docker', 'run', '-t', '--rm', '--name', `ckb_compiler_${version}`,
      '--volume', `"${projectRoot}:/project"`,
      '-w', '/project',
      `nervos/ckb-riscv-gnu-toolchain:${version}`,
      '/bin/bash', '-c',
      `"${cmd}"`
    ].join(' ')
  }
}

export default new CkbCompiler()