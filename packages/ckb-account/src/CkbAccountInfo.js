import React from 'react'

import {
  Badge,
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

export default function CkbAccountInfo ({ wallet }) {
  const { lockScript } = wallet

  if (!lockScript) {
    return (
      <TableCard title='Account'>
        <TableCardRow
          name='Lock Hash'
          icon='far fa-lock-alt'
        >
          <code>{wallet.lockHash}</code>
        </TableCardRow>
      </TableCard>
    )
  }

  let testnetAddress = <span className='text-muted'>(n/a)</span>
  try {
    testnetAddress = <code>{lockScript.getAddress('ckt')}</code>
  } catch (e) {}

  let mainnetAddress = <span className='text-muted'>(n/a)</span>
  try {
    mainnetAddress = <code>{lockScript.getAddress('ckb')}</code>
  } catch (e) {}

  let publicKey = <span className='text-muted'>(n/a)</span>
  // try {
  //   publicKey = <code>{ckbKeypair.publicKey}</code>
  // } catch (e) {}

  return (
    <TableCard title='Account'>
      <TableCardRow
        name='Addresses'
        icon='far fa-map-marker-alt'
      >
        <div><Badge color='info' className='mr-2'>Testnet</Badge><code>{testnetAddress}</code></div>
        <div><Badge color='success' className='mr-1'>Mainnet</Badge>{mainnetAddress}</div>
      </TableCardRow>
      <TableCardRow
        name='Public Key'
        icon='far fa-key'
      >
        <div>
          <Badge color='info' className='mr-2'><i className='fas fa-key mr-1' />Key</Badge>
          {publicKey}
        </div>
        <div>
          <Badge color='info' className='mr-1'><i className='fas fa-hashtag mr-1' />Hash</Badge>
          <code>{lockScript.args.serialize()}</code>
        </div>
      </TableCardRow>
      <TableCardRow
        name='Lock Hash'
        icon='far fa-lock-alt'
      >
        <code>{wallet.lockHash}</code>
      </TableCardRow>
    </TableCard>
  )
}
