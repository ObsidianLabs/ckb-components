import { dockerChannel } from '@obsidians/docker'
import { instanceChannel } from '@obsidians/ckb-network'
import ckbCompiler from '@obsidians/ckb-compiler'

export default async function checkDependencies () {
  try {
    const results = await Promise.all([
      dockerChannel.check(),
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