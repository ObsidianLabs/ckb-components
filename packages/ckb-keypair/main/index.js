const keytar = require('keytar')

const { IpcChannel } = require('@obsidians/ipc')

class CkbKeypairManager extends IpcChannel {
  constructor() {
    super('ckb-keypair')
  }

  async allKeypairAddresses () {
    const keys = await keytar.findCredentials('@obsidians/ckb-keypair')
    return keys.map(({ account }) => account)
  }

  async loadPrivateKey (address) {
    const privateKey = await keytar.getPassword('@obsidians/ckb-keypair', address)
    if (privateKey) {
      return privateKey
    }
  }

  async newPrivateKey () {
    const { logs: privateKey } = await this.pty.exec('openssl rand -hex 32')
    return `0x${privateKey.trim()}`
  }

  async saveKeypair (address, privateKey) {
    await keytar.setPassword('@obsidians/ckb-keypair', address, privateKey)
  }

  async deleteKeypair(address) {
    await keytar.deletePassword('@obsidians/ckb-keypair', address)
  }
}

module.exports = CkbKeypairManager
