export default class FileReader {
  #fs

  constructor (fs) {
    this.#fs = fs
  }

  public open (filePath: string) {
    return new LocalFile(filePath, this)
  }

  read (filePath, encoding: 'utf8' | 'hex') {
    return this.#fs.readFileSync(filePath, encoding)
  }

  size (filePath) {
    try {
      const stats = this.#fs.statSync(filePath)
      return stats.size
    } catch (e) {
      return 0
    }
  }
}

export class LocalFile {
  #reader: FileReader
  readonly filePath: string

  constructor (filePath, reader) {
    this.#reader = reader
    this.filePath = filePath
  }

  getValue (encoding: 'utf8' | 'hex' = 'hex') {
    return this.#reader.read(this.filePath, encoding)
  }

  getSize () {
    return this.#reader.size(this.filePath)
  }
}