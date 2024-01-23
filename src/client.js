import { Vector2, BoundingBox } from "../chaos.module.js"

/**
 * @template T
 * @template U
 */
export class Client {
  bounds = new BoundingBox()
  queryid = 0
  /**
   * @type {U}
   */
  node = null
  /**
   * @type {T}
   */
  body = null
  /**
   * @param {T} body
   * @param {U} node
  */
  constructor(body,node) {
    this.body = body
  }
}