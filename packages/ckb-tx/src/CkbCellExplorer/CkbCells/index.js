import React, { PureComponent } from 'react'
import { Progress } from 'reactstrap'

import {
  Screen,
  Button,
  Badge,
  CustomInput,
} from '@obsidians/ui-components'

import { CkbCapacity } from '@obsidians/ckb-objects'

import { networkManager } from '@obsidians/ckb-network'

import CkbWalletContext from '../../CkbWalletContext'

import CkbNewCellButton from './CkbNewCellButton'
import CkbCell from './CkbCell'

import ckbTxManager from '../../ckbTxManager'

const DISPLAY_STEP = 20

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

    props.cacheLifecycles.didRecover(this.componentDidRecover)
  }

  componentDidMount () {
    this.props.onDisplay(this)
    this.refresh()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.value !== this.props.value) {
      this.refresh()
    }
  }

  componentDidRecover = () => {
    this.props.onDisplay(this)
  }

  refresh = async () => {
    if (!this.props.value) {
      this.setState({ error: null, loading: false })
      return
    }

    this.setState({
      cellsCount: 0,
      totalCapacity: new CkbCapacity(),
      used: new CkbCapacity(),
      unused: new CkbCapacity(),
      cells: [],
      cellsToRender: 0,
      done: false,
      loading: true,
    })

    await new Promise(resolve => setTimeout(resolve, 10))

    const wallet = networkManager.sdk?.walletFrom(this.props.value)
    try {
      await wallet.info()
      this.setState({ error: null, loading: true })
    } catch (e) {
      let error = e.message
      if (error === `Cannot read property 'attributes' of undefined`) {
        error = 'Invalid value, expected a lock hash or CKB address.'
      }
      this.setState({ error, wallet: null })
      return
    }

    const { balance, live_cells_count } = await wallet.info()
    this.setState({
      cellsCount: live_cells_count,
      totalCapacity: typeof balance === 'string' ? new CkbCapacity(BigInt(balance)) : null,
    })

    this.cellCollector = this.context.txBuilder.cellCollector(await wallet.lock_script())
    this.displayMoreCell()
  }

  displayMoreCell = () => {
    const { cellsToRender, cells } = this.state
    this.setState({ cellsToRender: this.state.cellsToRender + DISPLAY_STEP })
    if (cellsToRender >= cells.length) {
      this.loadMoreCell()
    }
  }

  loadMoreCell = async () => {
    this.setState({ loading: true })
    try {
      const { done, cells, capacity } = await this.cellCollector.loadMoreCells()

      this.setState({
        done,
        cells,
        used: new CkbCapacity(capacity.used),
        unused: new CkbCapacity(capacity.free),
        loading: false,
      })
    } catch (e) {
      console.warn(e)
      this.setState({ loading: false })
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

    let cellStat = null
    if (typeof cellsCount === 'number') {
      cellStat = `${cells.length} of ${cellsCount} Cells`
    } else {
      cellStat = `${cells.length} Cells`
    }

    let icon = null
    if (loading) {
      icon = <span key='cells-loading'><i className='fas fa-spin fa-spinner text-muted ml-1' /></span>
    } else if (!done) {
      icon = <Badge className='ml-1' onClick={this.loadMoreCell}>more</Badge>
    }

    let usedPercentage = 0
    let unusedPercentage = 0
    let underline
    if (totalCapacity) {
      usedPercentage = Number(totalCapacity.value && used.value * BigInt(1000) / totalCapacity.value) / 10
      unusedPercentage = Number(totalCapacity.value && unused.value * BigInt(1000) / totalCapacity.value) / 10
      underline = `${unused.display()} free of ${totalCapacity.display()} CKB`
    } else {
      underline = `${unused.display()} free`
    }
    return (
      <div style={{ width: 200 }}>
        <div className='d-flex align-items-center'>
          {cellStat}
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
        <div className='small text-muted'>{underline}</div>
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
    let totalEmptyCapacity = new CkbCapacity()
    emptyCells.forEach(cell => totalEmptyCapacity.plus(cell.capacity))
    return (
      <div className='d-flex w-100 justify-content-center text-muted mt-2'>
        {emptyCells.length} empty cell{emptyCells.length > 1 && 's'} with {totalEmptyCapacity.display()} CKB
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
    if (typeof cellsCount === 'number' && cells.length < cellsCount) {
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
      <div className='d-flex flex-1 flex-column h-100 overflow-hidden'>
        <div className='p-3 d-flex flex-row justify-content-between align-items-start'>
          <div>
            <div className='d-flex flex-row align-items-center'>
              <h4 className='mb-0'>Live Cells</h4>
              <CkbNewCellButton address={this.props.value} />
            </div>
            <div className='mt-1'>
              <CustomInput
                id={`switch-show-empty-cells-${this.props.value}`}
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
