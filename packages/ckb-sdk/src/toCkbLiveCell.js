import { CkbLiveCell } from '@obsidians/ckb-tx-builder'

export default function toCkbLiveCell ({ block_hash, out_point, cellbase, cell_output, data, output_data_len }) {
  const outPoint = {
    txHash: out_point.tx_hash,
    index: out_point.index,
  }
  const lock = cell_output.lock && {
    hashType: cell_output.lock.hash_type,
    codeHash: cell_output.lock.code_hash,
    args: cell_output.lock.args,
  }
  const type = cell_output.type && {
    hashType: cell_output.type.hash_type,
    codeHash: cell_output.type.code_hash,
    args: cell_output.type.args,
  }
  return new CkbLiveCell({
    outPoint,
    cellbase,
    blockHash: block_hash,
    capacity: cell_output.capacity,
    lock,
    type,
    data,
  })
}
