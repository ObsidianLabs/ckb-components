import React, { PureComponent } from 'react'

import {
  ToolbarButton,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

export default class FaucetButton extends PureComponent {
  claim = async () => {
    let faucetUrl
    if (this.props.network === 'ckb-aggron') {
      faucetUrl = 'https://faucet.nervos.org/claim_events'
    } else {
      return
    }

    window.open('https://faucet.nervos.org', '_blank', 'noopener,noreferrer')
  
    // TODO
    // this.notification = notification.info('Claiming CKB...', `Trying to claim CKB tokens for <b>${this.props.address}</b>`, 0)
    // let result
    // try {
    //   // TODO: GET request to retrieve csrf
    //   const res = await fetch(faucetUrl,)
    //   result = await res.json()

    //   // TODO: POST request with csrf token
    // } catch (e) {
    //   console.log(e)
    // }
    // this.notification.dismiss()
    // if (!result) {
    //   notification.error('Failed', 'Unknown error')
    //   return
    // }
    // if (result.code) {
    //   notification.error('Failed', result.message)
    // } else {
    //   notification.success('CFX Claimed', `Claimed 100 CFX for <b>${this.props.address}</b>`)
    // }
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
