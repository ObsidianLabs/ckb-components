import { IpcChannel } from '@obsidians/ipc'
import ckbInstances from '@obsidians/ckb-instances'
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
      ckbInstances.invoke('versions').then(versions => versions[0].Tag),
      ckbCompiler.invoke('versions').then(versions => versions[0].Tag),
    ])
    return results.every(x => !!x)
  } catch (e) {
    return false
  }
}