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
   * @type {U}
   */
  node = null
  /**
   * @type {T}
   */
  value = null
  /**
   * @param {T} value
  */
  constructor(value) {
    this.value = value
  }
}