import { IpcChannel } from '@obsidians/ipc'
import CkbKeypair from './CkbKeypair'

class CkbKeypairManager {
  constructor () {
    this.channel = new IpcChannel('ckb-keypair')
  }

  async loadAllKeypairs () {
    const addresses = await this.channel.invoke('allKeypairAddresses')
    return addresses.map(address => CkbKeypair.fromAddress(address))
  }
  
  async newKeypair () {
    const privateKey = await this.channel.invoke('newPrivateKey')
    return CkbKeypair.fromPrivateKey(privateKey)
  }

  async saveKeypair(keypair) {
    await this.channel.invoke('saveKeypair', keypair.testnetAddress, keypair._privateKey)
  }

  async deleteKeypair(keypair) {
    await this.channel.invoke('deleteKeypair', keypair.testnetAddress)
  }

  async getSigner(address, ) {
    const privateKey = await this.channel.invoke('loadPrivateKey', address)
    if (!privateKey) {
      throw new Error('No private key for address: ' + address)
    }
    const ckbKeypair = CkbKeypair.fromPrivateKey(privateKey)
    return message => ckbKeypair.sign(message)
  }
}

export default new CkbKeypairManager()