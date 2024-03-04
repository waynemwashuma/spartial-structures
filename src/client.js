import { BoundingBox } from "../chaos.module.js"

/**
 * @template T
 * @template U
 */
export class Client {
  /**
   * @type {number}
   */
  queryid = 0
  /**
   * @type {U | null}
   */
  node = null
  /**
   * @type {T}
   */
  value
  /**
   * @param {T} [value]
  */
  constructor(value = null) {
    this.value = value
  }
}