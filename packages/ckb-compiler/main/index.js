const { TerminalChannel } = require('@obsidians/terminal')
const { DockerImageChannel } = require('@obsidians/docker')

class CompilerManager extends TerminalChannel {
  constructor () {
    super('ckb-compiler')

    this.capsule = new DockerImageChannel('obsidians/capsule')
    this.regular = new DockerImageChannel('nervos/ckb-riscv-gnu-toolchain')
  }
}

module.exports = CompilerManager