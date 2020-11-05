export default class FileReaderInterface {
  public open (filePath: string) {
    return new FileData(filePath, this)
  }

  read (filePath, encoding: 'utf8' | 'hex'): string {
    throw new Error('FileReaderInterface.read is not implemented.')
  }

  size (filePath): number {
    throw new Error('FileReaderInterface.size is not implemented.')
  }
}

export class FileData {
  constructor (readonly filePath: string, private reader: FileReaderInterface) {}

  getValue (encoding: 'utf8' | 'hex' = 'hex') {
    return this.reader.read(this.filePath, encoding)
  }

  getSize () {
    return this.reader.size(this.filePath)
  }
}