import { ProjectSettings } from '@obsidians/workspace'

export default class CkbProjectSettings extends ProjectSettings {
  static configFileName = 'ckbconfig.json'

  constructor (settingFilePath, channel) {
    super(settingFilePath, channel)
  }

  trimSettings = (rawSettings = {}) => {
    return {
      language: rawSettings.language || 'c',
      main: rawSettings.main || '',
      compilers: {
        capsule: rawSettings.compilers?.capsule || '',
        riscv: rawSettings.compilers?.riscv || '',
      },
      output: rawSettings.output || '',
      scripts: {
        build: rawSettings.scripts?.build || '',
      },
      debug: rawSettings.debug || {},
    }
  }
}
