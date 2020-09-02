import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { SIMPLE_UDT_CODE_HASH } from '@obsidians/ckb-tx-builder'

const defaultCellManifest = [
  { hash: SIMPLE_UDT_CODE_HASH, name: 'Simple UDT' },
  { hash: '0xfe833942a9277e7dbc25a6e67688670449301e9b6be968d3c203ab2a1859f081', name: 'Duktape' },
]

class CkbTxManager {
  set cellDetailModal(cellDetailModal) {
    this._cellDetailModal = cellDetailModal
  }

  set txConstructor(txConstructor) {
    this._txConstructor = txConstructor
  }

  showCellDetail (cell) {
    this._cellDetailModal.openModal(cell)
  }

  visualizeTransaction (tx) {
    this._txConstructor.visualizeTransaction(tx)
  }

  get cellManifestFile () {
    const { path, workspace } = fileOps.current
    return path.join(workspace, 'cells.json')
  }

  async loadCellManifest () {
    if (this._cellManifest) {
      return this._cellManifest
    }

    const manifestFile = this.cellManifestFile

    await fileOps.current.ensureFile(manifestFile)

    let manifest = await fileOps.current.readFile(manifestFile)
    if (!manifest) {
      await fileOps.current.writeFile(manifestFile, JSON.stringify(defaultCellManifest, null, 2))
      manifest = await fileOps.current.readFile(manifestFile)
    }
    
    try {
      this._cellManifest = JSON.parse(manifest).map(({ hash, name, outPoint }) => ({ hash, name, outPoint }))
      return this._cellManifest
    } catch (e) {
      notification.error('Invalid Manifest', `Please check the manifest file <b>${manifestFile}</b>.`)
      return []
    }
  }

  async getCellInfo (dataHash) {
    const manifest = await this.loadCellManifest()
    return manifest.find(item => item.hash === dataHash)
  }

  async addCellReference (cell) {
    const manifest = await this.loadCellManifest()
    const index = manifest.findIndex(item => item.hash === cell.dataHash)
    if (index > -1) {
      manifest[index].outPoint = cell.outPoint
      await fileOps.current.writeFile(this.cellManifestFile, JSON.stringify(manifest, null, 2))
    }
  }

  get udtManifestFile () {
    const { path, workspace } = fileOps.current
    return path.join(workspace, 'udts.json')
  }

  async loadUdtManifest () {
    if (this._udtManifest) {
      return this._udtManifest
    }

    const udtManifestFile = this.udtManifestFile

    await fileOps.current.ensureFile(udtManifestFile)

    let manifest = await fileOps.current.readFile(udtManifestFile)
    if (!manifest) {
      await fileOps.current.writeFile(udtManifestFile, '[]')
      manifest = await fileOps.current.readFile(udtManifestFile)
    }
    
    try {
      this._udtManifest = JSON.parse(manifest).map(({ issuer, name, symbol, precision, icon }) => ({ issuer, name, symbol, precision, icon }))
      return this._udtManifest
    } catch (e) {
      notification.error('Invalid UDT Manifest', `Please check the manifest file <b>${udtManifestFile}</b>.`)
      return []
    }
  }

  async getUdtInfo (issuer) {
    const manifest = await this.loadUdtManifest()
    return manifest.find(item => item.issuer === issuer) || {}
  }

  async updateUdtInfo (udt) {
    const manifest = await this.loadUdtManifest()
    const index = manifest.findIndex(item => item.issuer === udt.issuer)
    if (index > -1) {
      manifest[index] = udt
    } else {
      manifest.push(udt)
    }
    await fileOps.current.writeFile(this.udtManifestFile, JSON.stringify(manifest, null, 2))
  }
}

export default new CkbTxManager()
