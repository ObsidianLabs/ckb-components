import { IpcChannel } from '@obsidians/ipc'
import { DockerImageChannel } from '@obsidians/docker'

const channel = new IpcChannel('ckb-instances')

channel.ckbNode = new DockerImageChannel(`nervos/ckb`)
channel.ckbIndexer = new DockerImageChannel(`obsidians/ckb-indexer`, {
  filter: false,
  sort: false,
})

export default channel