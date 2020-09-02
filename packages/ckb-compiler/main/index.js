const semverLt = require('semver/functions/lt')
const semverValid = require('semver/functions/valid')

const { TerminalChannel } = require('@obsidians/terminal')
const { DockerImageChannel } = require('@obsidians/docker')

class CompilerManager extends TerminalChannel {
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
}

module.exports = CompilerManager