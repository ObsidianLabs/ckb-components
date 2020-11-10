import notification from '@obsidians/notification'
import { BaseQueueManager } from '@obsidians/queue'
import { networkManager } from '@obsidians/ckb-network'

class Queue extends BaseQueueManager {
  async process (pendingTransaction, txHash, data, callbacks) {
    this.updateStatus(txHash, 'PUSHING', data, callbacks)
    notification.info(`Pushing Transaction...`, `Hash: ${txHash}`)

    try {
      await pendingTransaction.push()
      this.updateStatus(txHash, 'PENDING', {}, callbacks)
      notification.success('Transaction Pushed', `Transaction hash: ${txHash}`)
    } catch (e) {
      console.warn(e)
      this.updateStatus(txHash, 'FAILED', { error: e.message }, callbacks)
      notification.error('Push Transaction Failed', e.message)
      return
    }

    let proposed = false
    const h = setInterval(async () => {
      const confirmed = await networkManager.sdk?.ckbClient.loadTransaction(txHash)
      if (confirmed?.tx_status?.status === 'proposed' && !proposed) {
        proposed = true
        this.updateStatus(txHash, 'PROPOSED', {}, callbacks)
      } else if (confirmed?.tx_status?.status === 'committed') {
        clearInterval(h)
        this.updateStatus(txHash, 'CONFIRMED', {}, callbacks)
      }
    }, 1000)
  }
}

export default new Queue()