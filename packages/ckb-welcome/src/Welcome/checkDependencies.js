import { IpcChannel } from '@obsidians/ipc'
import { instanceChannel } from '@obsidians/ckb-network'
import ckbCompiler from '@obsidians/ckb-compiler'

export async function checkDocker () {
  const ipc = new IpcChannel()
  const result = await ipc.invoke('exec', 'docker info')
  return !result.code
}

export async function dockerVersion () {
  const ipc = new IpcChannel()
  const result = await ipc.invoke('exec', `docker -v`)
  if (result.code) {
    return ''
  }
  return result.logs
}

export async function startDocker () {
  const ipc = new IpcChannel()
  ipc.invoke('exec', `open /Applications/Docker.app`)
  return new Promise(resolve => {
    const h = setInterval(async () => {
      if (await checkDocker()) {
        clearInterval(h)
        resolve()
      }
    }, 500)
  })
}

export default async function checkDependencies () {
  try {
    const results = await Promise.all([
      checkDocker(),
      instanceChannel.ckbNode.installed(),
      instanceChannel.ckbIndexer.installed(),
      ckbCompiler.capsule.installed(),
      ckbCompiler.regular.installed(),
    ])
    return results.every(x => !!x)
  } catch (e) {
    console.warn(e)
    return false
  }
}