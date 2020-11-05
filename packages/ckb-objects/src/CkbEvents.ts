class CkbEvents {
  readonly #listeners: Map<string, Set<Function>> = new Map()

  get events (): string[] {
    return [...this.#listeners.keys()]
  }

  on (event: string, callback: Function) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set())
    }
    this.#listeners.get(event).add(callback)

    return () => this.off(event, callback)
  }

  off (event: string, callback?: Function) {
    if (!this.#listeners.has(event)) {
      return
    }
    if (!callback) {
      this.#listeners.set(event, new Set())
      return
    }
    let cbs = this.#listeners.get(event)
    if (cbs.has(callback)) {
      cbs.delete(callback)
    }
  }

  trigger (event: string, ...args) {
    for (let evt of this.events) {
      if (evt === event || event.startsWith(`${evt}:`)) {
        this.#listeners.get(evt).forEach(cb => cb(...args))
      }
    }
  }
}

export default new CkbEvents()