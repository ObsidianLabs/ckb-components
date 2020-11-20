import fileOps from '@obsidians/file-ops'
import { CkbData, FileReaderInterface } from '@obsidians/ckb-objects'

class FileReader extends FileReaderInterface {
  read (filePath, encoding) {
    return fileOps.current.fs.readFileSync(filePath, encoding)
  }

  size (filePath) {
    try {
      const stats = fileOps.current.fs.statSync(filePath)
      return stats.size
    } catch (e) {
      return 0
    }
  }
}

CkbData.fileReader = new FileReader()

export { default } from './CkbTxContructor'

export { default as CkbCellDetail } from './CkbCellDetail'
export { default as ckbTxManager } from './ckbTxManager'