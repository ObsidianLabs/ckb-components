import { DockerImageChannel } from '@obsidians/docker'
import notification from '@obsidians/notification'

class CkbCompiler {
  constructor () {
    this.capsule = new DockerImageChannel(`obsidians/capsule`)
    this.regular = new DockerImageChannel(`nervos/ckb-riscv-gnu-toolchain`)
    this._terminal = null
    this._button = null
    this._testButton = null
    this.notification = null
  }

  set terminal (v) {
    this._terminal = v
  }

  set button (v) {
    this._button = v
  }
  set testButton (v) {
    this._testButton = v
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

    let cmd
    if (config.language === 'rust') {
      const mode = this._button.state.mode
      cmd = this.generateBuildCmdForRust(config, { version, projectRoot }, )
      if (mode === 'debug') {
        this.notification = notification.info(`Building CKB Script`, `Building Debug...`, 0)
      } else if (mode === 'release') {
        this.notification = notification.info(`Building CKB Script`, `Building Release...`, 0)
      } else if (mode === 'release-w-debug-output') {
        this.notification = notification.info(`Building CKB Script`, `Building Release with Debug Output...`, 0)
      }
    } else if (config.language === 'c') {
      cmd = this.generateBuildCmdForC(config, { version, projectRoot })
      this.notification = notification.info(`Building CKB Script`, `Building...`, 0)
    } else {
      cmd = config.scripts.build
      this.notification = notification.info(`Building CKB Script`, `Building...`, 0)
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

  async test (config = {}) {
    const version = this.compilerVersion
    const projectRoot = this.projectRoot

    this._testButton.setState({ testing: true })

    let cmd
    if (config.language === 'rust') {
      const mode = this._button.state.mode
      cmd = this.generateTestCmdForRust(config, { version, projectRoot }, mode)
      if (mode === 'debug') {
        this.notification = notification.info(`Testing CKB Script`, `Testing Debug...`, 0)
      } else {
        this.notification = notification.info(`Testing CKB Script`, `Testing Release...`, 0)
      }
    }
    const result = await this._terminal.exec(cmd)

    this._testButton.setState({ testing: false })
    this.notification.dismiss()

    if (result.code) {
      notification.error('Test Failed')
      throw new Error(result.logs)
    }
    notification.success('Test Successful', `CKB script has passed the test.`)
  }

  generateBuildCmdForRust(config, { version, projectRoot }, mode) {
    let cmd = config.scripts?.build || 'capsule build'
    if (mode === 'release') {
      cmd += ` --release`
    } else if (mode === 'release-w-debug-output') {
      cmd += ` --release --debug-output`
    }
    return [
      'docker', 'run', '-t', '--rm', '--name', `ckb-compiler-${version}`,
      `-v /var/run/docker.sock:/var/run/docker.sock`,
      '-v', `"${projectRoot}":"${projectRoot}"`,
      '-w', `"${projectRoot}"`,
      `obsidians/capsule:${version}`,
      cmd
    ].join(' ')
  }

  generateTestCmdForRust(config, { version, projectRoot }, mode) {
    let cmd = config.scripts?.test || 'capsule test'
    if (mode !== 'debug') {
      cmd += ` --release`
    }
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
    const cmd = this.commandForC(config, version)
    return [
      'docker', 'run', '-t', '--rm', '--name', `ckb-compiler-${version}`,
      '--volume', `"${projectRoot}:/project"`,
      '-w', '/project',
      `nervos/ckb-riscv-gnu-toolchain:${version}`,
      '/bin/bash', '-c',
      `"${cmd}"`
    ].join(' ')
  }

  commandForC(config, version) {
    if (config.scripts && config.scripts.build) {
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