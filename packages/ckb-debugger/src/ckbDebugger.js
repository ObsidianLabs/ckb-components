import fileOps from '@obsidians/file-ops'

import { CkbScript, lib } from '@obsidians/ckb-objects'

import get from 'lodash/get'

class CkbDebugger {
  constructor () {
    this._window = null
    this._button = null
  }

  set window (window) {
    this._window = window
  }

  set button (button) {
    this._button = button
  }

  setDebugState = debugging => {
    this._button.setState({ debugging })
    this._window.setState({ debugging })
  }

  debug = async ({ mock, target, cycles }, projectRoot) => {
    const config = {
      mock: mock || 'mock/tx.json',
      target,
      cycles: cycles || '1000000000',
    }

    const path = fileOps.current.path
    const mockFile = path.join(projectRoot, config.mock)

    let mockJsonString
    try {
      mockJsonString = await fileOps.current.readFile(mockFile)
    } catch (e) {
      throw new Error(`Cannot read the mock file "${config.mock}".`)
    }

    let mockObj
    try {
      mockObj = JSON.parse(mockJsonString)
    } catch (e) {
      throw new Error(`The mock file "${config.mock}" is not a valid JSON.`)
    }

    if (!config.target) {
      throw new Error('No debug target specified.')
    }

    const targetScriptType = config.target && config.target.slice(-5)
    if (targetScriptType !== '.lock' && targetScriptType !== '.type') {
      throw new Error('The debug target must end in either ".lock" or ".type".')
    }

    if (!get(mockObj, config.target)) {
      throw new Error('The debug target does not point to a valid script')
    }

    const bnCycles = BigInt(config.cycles)
    if (bnCycles <= 0 || bnCycles.toString() !== config.cycles) {
      throw new Error(`Invalid max cycles "${config.cycles}".`)
    }

    this.setDebugState(true)

    const files = {}
    const regex = /\"(file|blake2b):([^"]+)\"/g
    const mockFileDir = path.parse(mockFile).dir

    let match = regex.exec(mockJsonString)
    while (match) {
      const type = match[1]
      let filePath = match[2]
      if (!path.isAbsolute(filePath)) {
        filePath = path.join(mockFileDir, filePath)
      }
      if (!files[filePath]) {
        files[filePath] = []
      }
      files[filePath].push([type, match[0]])

      match = regex.exec(mockJsonString);
    }

    for (const filePath in files) {
      const content = `0x${await fileOps.current.readFile(filePath, 'hex')}`
      let blake2b

      files[filePath].forEach(([type, replacing]) => {
        if (type === 'file') {
          mockJsonString = mockJsonString.replace(replacing, `"${content}"`)
        } else if (type === 'blake2b') {
          if (!blake2b) {
            blake2b = lib.hex2Blake2b(content)
          }
          mockJsonString = mockJsonString.replace(replacing, `"${blake2b}"`)
        }
      })
    }

    const { code_hash, hash_type, args } = get(JSON.parse(mockJsonString), config.target)
    const script = new CkbScript({ code_hash, hash_type, args })
    const scriptHash = script.hash

    const { run_json_with_printer } = await import('ckb-standalone-debugger')

    const pushDebugMsg = (hash, message) => this._window.pushDebugMsg({ hash, message })
    this._window.openDebugger()
    setTimeout(() => {
      const result = run_json_with_printer(
        mockJsonString, targetScriptType.slice(-4), scriptHash, config.cycles,
        pushDebugMsg
      )
      this._window.setDebugResult(JSON.parse(result))
      this.setDebugState(false)
    }, 500)
  }

  stop = () => {
    this._button.setState({ debugging: false })
  }
}

export default new CkbDebugger()