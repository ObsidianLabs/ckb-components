import { dockerChannel } from '@obsidians/docker'
import ckbInstances from '@obsidians/ckb-instances'
import ckbCompiler from '@obsidians/ckb-compiler'

export default async function checkDependencies () {
  try {
    const results = await Promise.all([
      dockerChannel.check(),
      ckbInstances.ckbNode.installed(),
      ckbInstances.ckbIndexer.installed(),
      ckbCompiler.capsule.installed(),
      ckbCompiler.regular.installed(),
    ])
    return results.every(x => !!x)
  } catch (e) {
    console.warn(e)
    return false
  }
}