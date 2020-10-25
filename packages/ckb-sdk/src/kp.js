import CkbKeypair from './CkbKeypair'
import { IpcChannel } from '@obsidians/ipc'

const channel = new IpcChannel('keypair')

export default {
  async newKeypair () {
    const privateKey = await channel.invoke('post', 'new-secret')
    const keypair = CkbKeypair.fromPrivateKey(privateKey)
    return {
      address: keypair.address,
      secret: keypair.secret
    }
  },
  importKeypair (secret) {
    const keypair = CkbKeypair.fromPrivateKey(secret)
    return {
      address: keypair.address,
      secret: keypair.secret
    }
  },
}