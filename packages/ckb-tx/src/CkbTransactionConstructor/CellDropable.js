import React, { forwardRef, useState, useImperativeHandle } from 'react'

import { useDrop } from 'react-dnd'

import { CkbCapacity } from '@obsidians/ckb-tx-builder'

export default forwardRef(CellDropable)

function CellDropable (props, ref) {
  const [cells, setCells] = useState([])
  const [ids, setIds] = useState(new Set())

  useImperativeHandle(ref, () => ({
    updateList: (cells = []) => {
      setCells(cells)
      setIds(new Set(cells.map(cell => cell.id)))
    }
  }))

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'cell',
    drop: ({ cell }) => {
      if (!ids.has(cell.id)) {
        const newCells = [...cells, cell]
        setCells(newCells)
        setIds(ids.add(cell.id))
        if (props.onChange) {
          props.onChange(newCells)
        }
      }
      return { name: 'Deps' }
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  const onRemoveCell = id => {
    const index = cells.findIndex(c => c.id === id)
    if (index > -1) {
      cells.splice(index, 1)
      ids.delete(id)
      const newCells = [...cells]
      setCells(newCells)
      setIds(ids)
      if (props.onChange) {
        props.onChange(newCells)
      }
    }
  }

  const totalCapacity = new CkbCapacity()
  cells.forEach(cell => totalCapacity.plus(cell.capacity))

  return (
    <div className='d-flex flex-1 flex-column mt-1'>
      {props.header(totalCapacity.toString())}
      <div
        ref={drop}
        className={`flex-1 overflow-auto rounded ${canDrop ? 'bg-hover' : 'bg2'}`}
      >
        <props.List cells={cells} onRemoveCell={onRemoveCell} />
      </div>
    </div>
  )
}