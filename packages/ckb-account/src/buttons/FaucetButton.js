import React, { PureComponent } from 'react'

import {
  ToolbarButton,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

export default class FaucetButton extends PureComponent {
  claim = async () => {
    const address = this.props.address
    this.notification = notification.info('Claiming CKB...', `Trying to claim CKB tokens for <b>${address}</b>`, 0)
    let res, result
    try {
      res = await fetch('https://ckb.obsidians.io/api/v1/faucet', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      })
      result = await res.json()
    } catch (e) {
      console.warn(e)
    }
    this.notification.dismiss()
    if (!result) {
      notification.error('Failed', 'Unknown error')
      return
    }
    if (res.status >= 400) {
      if (result.address_hash) {
        notification.error('Failed', result.address_hash)
      } else {
        notification.error('Failed', 'Unknown error')
      }
    } else {
      notification.success('CKB Claimed', `Claimed 5000 CKB tokens for <b>${address}</b>`)
    }
  }

  render () {
    return (
      <ToolbarButton
        id='navbar-faucet'
        size='md'
        icon='fas fa-faucet'
        tooltip='Faucet'
        onClick={this.claim}
      />
    )
  }
}
