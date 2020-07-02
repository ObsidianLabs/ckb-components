import React, { PureComponent } from 'react'
import { Progress } from 'reactstrap'

import {
  Screen,
  Button,
  Badge,
  CustomInput,
} from '@obsidians/ui-components'

import { CkbCapacity } from '@obsidians/ckb-tx-builder'
import nodeManager from '@obsidians/ckb-node'

import throttle from 'lodash/throttle'

import CkbWalletContext from '../../CkbWalletContext'

import CkbNewCellButton from './CkbNewCellButton'
import CkbCell from './CkbCell'

import ckbTxManager from '../../ckbTxManager'

const STEP = 20

export default class CkbCells extends PureComponent {
  static contextType = CkbWalletContext

  constructor(props) {
    super(props)
    
    this.modal = React.createRef()
    this.state = {
      error: null,
      loading: false,
      showEmptyCells: false,
      cellsCount: 0,
      totalCapacity: new CkbCapacity(),
      used: new CkbCapacity(),
      unused: new CkbCapacity(),
      cells: [],
      cellsToRender: 0,
      done: false,
      selected: new Set([]),
    }

    this.updateCellsThrottled = throttle(() => this.updateCells(), 1000)
  }

  componentDidMount () {
    this.refresh()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.value !== this.props.value) {
      this.refresh()
    }
  }

  refresh = async () => {
    if (!this.props.value) {
      this.setState({ error: null, loading: false })
      return
    }

    this.cells = []
    this.setState({
      cellsCount: 0,
      totalCapacity: new CkbCapacity(),
      used: new CkbCapacity(),
      unused: new CkbCapacity(),
      cells: [],
      cellsToRender: 0,
      done: false
    })

    let wallet
    try {
      wallet = nodeManager.sdk.walletFrom(this.props.value)
      this.setState({ error: null, loading: true })
    } catch (e) {
      this.setState({ error: e.message, loading: false })
      return
    }

    const { balance, live_cells_count } = await wallet.info()
    this.used = new CkbCapacity()
    this.unused = new CkbCapacity()
    this.setState({
      cellsCount: live_cells_count,
      totalCapacity: new CkbCapacity(BigInt(balance)),
    })
    this.context.cellCollection.clearCellsForLockHash(wallet.lockHash)
    this.loader = this.loadCells(wallet)
    this.displayMoreCell()
  }

  async *loadCells (wallet) {
    this.xloader = null

    if (!wallet) {
      this.setState({ cells: [], loading: false })
      return
    }

    let loader
    try {
      loader = wallet.loadCells()
    } catch (e) {
      console.warn(e)
      this.setState({ cells: [], loading: false })
      return
    }

    this.setState({ loading: true })
    this.xloader = loader

    let i = 0
    for await (const cell of loader) {
      if (this.xloader !== loader) {
        return
      }
      if (this.state.cells.length >= this.state.cellsCount) {
        return
      }
      if (cell.isEmpty()) {
        this.unused.plus(cell.capacity)
      } else {
        this.used.plus(cell.capacity)
      }
      this.cells.push(cell)

      this.updateCellsThrottled()
  
      this.context.cellCollection.push(cell)
      i++
      if (i >= 1000) {
        i = 0
        this.setState({ loading: false })
        yield
        this.setState({ loading: true })
      }
    }
    this.setState({ loading: false })
  }

  updateCells = () => {
    this.setState({
      used: this.used,
      unused: this.unused,
      cells: [...this.cells],
    })
  }

  displayMoreCell = () => {
    const { cellsToRender, cells } = this.state
    this.setState({ cellsToRender: this.state.cellsToRender + STEP })
    if (cellsToRender >= cells.length) {
      this.loadMoreCell()
    }
  }

  loadMoreCell = async () => {
    const result = await this.loader.next()
    if (result.done) {
      this.setState({ done: true })
    }
  }

  renderCellStatistic = state => {
    const {
      loading,
      cellsCount,
      cells,
      totalCapacity,
      used,
      unused,
      done,
    } = state

    let icon = null
    if (loading) {
      icon = <span key='cells-loading'><i className='fas fa-spin fa-spinner text-muted ml-1' /></span>
    } else if (!done) {
      icon = <Badge className='ml-1' onClick={this.loadMoreCell}>more</Badge>
    }

    const usedPercentage = Number(totalCapacity.value && used.value * BigInt(1000) / totalCapacity.value) / 10
    const unusedPercentage = Number(totalCapacity.value && unused.value * BigInt(1000) / totalCapacity.value) / 10
    return (
      <div style={{ width: 200 }}>
        <div className='d-flex align-items-center'>
          {cells.length} of {cellsCount} Cells
          {icon}
        </div>
        <Progress multi style={{ height: 14 }}>
          <Progress animated bar color="primary" value={usedPercentage} />
          <Progress bar color='secondary' value={unusedPercentage} style={{ opacity: 0.5 }} />
          <Progress
            bar
            color='invalid'
            value={100 - usedPercentage - unusedPercentage}
            barClassName='overflow-hidden text-muted'
          >
            Unknown
          </Progress>
        </Progress>
        <div className='small text-muted'>
          {unused.display()} free of {totalCapacity.display()} CKB
        </div>
      </div>
    )
  }

  renderCells = cells => {
    return cells.slice(0, this.state.cellsToRender).map((cell, i) => {
      if (!this.state.showEmptyCells && cell.isEmpty()) {
        return null
      }
      return (
        <CkbCell
          key={`cell-${cell.id}`}
          cell={cell}
          selected={this.state.selected.has(i)}
          onSelect={() => this.setState({ selected: new Set([i]) })}
          onDoubleClick={() => ckbTxManager.showCellDetail(cell)}
        />
      )
    })
  }

  renderEmptyCellStat = () => {
    if (this.state.showEmptyCells) {
      return null
    }
    const emptyCells = this.state.cells.slice(0, this.state.cellsToRender).filter(cell => cell.isEmpty())
    if (!emptyCells.length) {
      return null
    }
    let totalCapacity = new CkbCapacity()
    emptyCells.forEach(cell => totalCapacity.plus(cell.capacity))
    return (
      <div className='d-flex w-100 justify-content-center text-muted mt-2'>
        {emptyCells.length} empty cell{emptyCells.length > 1 && 's'} with {totalCapacity.display()} CKB
      </div>
    )
  }

  renderLoadMore = ({ cellsCount, cells, cellsToRender, loading, done }) => {
    if (cells.length > cellsToRender) {
      return (
        <div key='load-more' className='d-flex w-100 justify-content-center mt-2'>
          <Button size='sm' onClick={this.displayMoreCell}>Load More</Button>
        </div>
      )
    }
    if (loading) {
      return (
        <div key='loading' className='d-flex w-100 justify-content-center text-muted mt-2'>
          <i className='fa-2x fas fa-spin fa-spinner' />
        </div>
      )
    }
    if (cells.length < cellsCount) {
      return (
        <div key='load-more' className='d-flex w-100 justify-content-center mt-2'>
          <Button size='sm' onClick={this.displayMoreCell}>Load More</Button>
        </div>
      )
    }
    
    return null
  }

  render () {
    const { error, cells } = this.state

    if (!this.props.value) {
      return (
        <Screen>
          <h4 className='display-4'>New Page</h4>
          <p className='lead'>Please enter a CKB address or lock hash.</p>
        </Screen>
      )
    }
    
    if (error) {
      return (
        <Screen>
          <h4 className='display-4'>Invalid Value</h4>
          <p>{error}</p>
          <p className='lead'><kbd>{this.props.value}</kbd></p>
        </Screen>
      )
    }

    return (
      <div className='d-flex flex-1 flex-column'>
        <div className='p-3 d-flex flex-row justify-content-between align-items-start'>
          <div>
            <div className='d-flex flex-row align-items-center'>
              <h4 className='mb-0'>Live Cells</h4>
              <CkbNewCellButton address={this.props.value} />
            </div>
            <div className='mt-1'>
              <CustomInput
                id='switch-show-empty-cells'
                type='switch'
                label='Show empty cells'
                checked={this.state.showEmptyCells}
                onChange={event => this.setState({ showEmptyCells: event.target.checked })}
              />
            </div>
          </div>
          {this.renderCellStatistic(this.state)}
        </div>

        <div className='d-flex flex-1 flex-column align-items-stretch pb-3 px-3 overflow-auto'>
          <div className='d-flex flex-row flex-wrap'>
            {this.renderCells(cells)}
            {this.renderEmptyCellStat()}
            {this.renderLoadMore(this.state)}
          </div>
        </div>
      </div>
    )
  }
}
