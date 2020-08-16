const semverLt = require('semver/functions/lt')
const semverValid = require('semver/functions/valid')

const { IpcChannel } = require('@obsidians/ipc')
const { DockerImageChannel } = require('@obsidians/docker')

class CkbCompilerManager extends IpcChannel {
  constructor () {
    super('ckb-compiler')

    this.capsule = new DockerImageChannel('obsidians/capsule', {
      filter: tag => semverValid(tag),
      sort: (x, y) => semverLt(x, y) ? 1 : -1,
    })
    this.regular = new DockerImageChannel('nervos/ckb-riscv-gnu-toolchain', {
      filter: tag => tag.startsWith('xenial'),
      sort: (x, y) => x < y ? 1 : -1,
    })
  }

  resize ({ cols, rows }) {
    this.pty.resize({ cols, rows })
  }

  kill () {
    this.pty.kill()
    // Pty.exec(`docker stop substrate_compiler`)
  }
}

module.exports = CkbCompilerManager