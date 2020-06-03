import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'

export class ProjectActions {
  constructor() {
    this.redux = null
    this.history = null
    this.newProjectModal = null
  }

  async newProject () {
    const { projectRoot, name } = await this.newProjectModal.openModal()
    const projectId = btoa(projectRoot)
    this.redux.dispatch('ADD_PROJECT', {
      type: 'local',
      project: {
        id: projectId,
        path: projectRoot,
        author: 'guest',
        name,
      }
    })
    this.history.push(`/guest/${projectId}`)
  }

  async openProject () {
    try {
      const projectRoot = await fileOps.current.chooseFolder('CKB Studio')
      const { base } = fileOps.current.path.parse(projectRoot)
      const projectId = btoa(projectRoot)
      this.redux.dispatch('ADD_PROJECT', {
        type: 'local',
        project: {
          id: projectId,
          path: projectRoot,
          author: 'guest',
          name: base,
        }
      })
      this.history.replace(`/guest/${projectId}`)
    } catch (e) {}
  }

  removeProject ({ id, name }) {
    const selected = this.redux.getState().projects.get('selected')
    if (selected && selected.get('id') === id) {
      this.redux.dispatch('SELECT_PROJECT', { project: undefined })
      this.history.replace(`/guest`)
    }
    this.redux.dispatch('REMOVE_PROJECT', { id, type: 'local' })
    notification.info('Remove Project Successful', `Project <b>${name}</b> is removed`)
  }
}

export default new ProjectActions()
