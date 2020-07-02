import { CkbLiveCell } from '@obsidians/ckb-tx-builder'

export default function toCkbLiveCell ({ out_point, output, output_data, block_number, cellbase }) {
  const outPoint = {
    txHash: out_point.tx_hash,
    index: out_point.index,
  }
  const lock = output.lock && {
    hashType: output.lock.hash_type,
    codeHash: output.lock.code_hash,
    args: output.lock.args,
  }
  const type = output.type && {
    hashType: output.type.hash_type,
    codeHash: output.type.code_hash,
    args: output.type.args,
  }
  return new CkbLiveCell({
    outPoint,
    capacity: output.capacity,
    lock,
    type,
    data: output_data,
    blockNumber: block_number,
    cellbase,
  })
}
