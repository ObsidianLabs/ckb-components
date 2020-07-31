import { IpcChannel } from '@obsidians/ipc'

const channel = new IpcChannel('ckb-instances')

channel.ckbNode = new IpcChannel(`docker-image-nervos/ckb`)
channel.ckbIndexer = new IpcChannel(`docker-image-muxueqz/ckb-indexer`)

export default channel