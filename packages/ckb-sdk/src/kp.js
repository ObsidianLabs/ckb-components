import CkbKeypair from './CkbKeypair'
import { IpcChannel } from '@obsidians/ipc'

const channel = new IpcChannel('ckb-keypair')

export default {
  async newKeypair () {
    const privateKey = await channel.invoke('newSecret')
    const keypair = CkbKeypair.fromPrivateKey(privateKey)
    return {
      address: keypair.address,
      secret: keypair.secret
    }
  },
  importKeypair (secret) {
    return CkbKeypair.fromPrivateKey(secret)
  },
}