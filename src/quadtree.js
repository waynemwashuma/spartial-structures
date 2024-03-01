import { Overlaps,BoundingBox, Vector2 } from "../chaos.module.js"
import { Err } from "../chaos.module.js"
import { Utils } from "../chaos.module.js"
import { Client } from "./client.js"
import "./types.js"
/**
 * @template T
 */
export class QuadTreeNode {
  /**@type {QuadTreeNode<T>[]}*/
  children = []
  /**@type {Client<T,QuadTreeNode<T>>[]}*/
  objects = []
  /**@type {QuadTreeNode<T> | null}*/
  parent = null
  /**@type {boolean}*/
  hasObjects = false
  /**@type {BoundingBox}*/
  bounds
  /**
   * @param {BoundingBox} bounds
   */
  constructor(bounds) {
    this.bounds = bounds
  }
  /**
   * @param {QuadTreeNode<T>} node
   */
  add(node) {
    this.children.push(node)
    node.parent = this
  }

  /**
   * @return {boolean}
   */
  isLeafNode() {
    return this.children.length == 0
  }
  /**
   * @return {boolean}
   */
  childrenHaveObj() {
    return this.children.length > 0 && (
      this.children[0].hasObjects ||
      this.children[1].hasObjects ||
      this.children[2].hasObjects ||
      this.children[3].hasObjects
    )
  }
  /**
   * @param {BoundingBox} bounds
   * @returns {boolean}
   */
  contains(bounds) {
    return (
      bounds.max.x < this.bounds.max.x &&
      bounds.max.y < this.bounds.max.y &&
      bounds.min.x > this.bounds.min.x &&
      bounds.min.y > this.bounds.min.y
    )
  }
  /**
   * @param {Vector2} position
   * @returns {boolean}
   */
  isInNode(position) {
    if (
      position.x > this.bounds.min.x &&
      position.y > this.bounds.min.y &&
      position.x < this.bounds.max.x &&
      position.y < this.bounds.max.y
    )
      return true
    return false
  }
  /**
   * 
   * @returns {boolean}
   */
  isRootNode() {
    return !this.parent
  }
}

/**
 * @template T
 * 
 * This is a bounded broadphase that is used to speed up collision testing on sparse number of objects over a large area.
 * 
 */
export class QuadTree {
  /**
   * @type {BoundingBox}
   */
  bounds
  /**
   * @private
   * @type {QuadTreeNode<T>}
   */
  _root
  /**
   * @param {BoundingBox} bounds The region it operates on.
   * @param {number} [maxdepth=3] Maximum number of branches.
   * 
   */
  constructor(bounds,maxdepth = 3) {
    this._root = new QuadTreeNode(bounds)
    this.bounds = bounds

    this.split(maxdepth)
  }
  /**
   * 
   * @param {Client<T,QuadTreeNode<T>>} client 
   * @param {BoundingBox} bound 
   * @param {QuadTreeNode<T>} [node] 
   */
  insert(client,bound,node = this._root) {
    if (!node.contains(bound))
      return false
    for (let i = 0; i < node.children.length; i++) {
      const r = this.insert(client,bound,node.children[i])
      if (r) {
        node.hasObjects = true
        return true
      }
    }
    if (node.contains(bound)) {
      node.objects.push(client)
      client.node = node
      node.hasObjects = true
      return true
    }
    return false
  }
  /**
   * 
   * @param {Client<T,QuadTreeNode<T>>} client 
   * @returns 
   */
  remove(client) {
    if (!client.node) return
    let objects = client.node.objects
    const index = objects.indexOf(client)
    const removed = Utils.removeElement(objects,index)
    if (removed === null) return false
    return true
  }

  /**
   * 
   * @param {Client<T,QuadTreeNode<T>>[]} clients 
   * @param {BoundingBox[]} bounds 
   */
  update(clients,bounds) {
    for (var i = 0; i < clients.length; i++) {
      this.remove(clients[i])
      this.insert(clients[i],bounds[i],this._root)
    }
  }
  /**
   * @inheritdoc
   * @param {BoundingBox} bounds Region to check in.
   * @param {T[]} [target] Empty array to store results.
   * @param {QuadTreeNode<T>} [node]
   * @param {QueryFunc<QuadTreeNode<T>,T>} [func=approxQuery] 
   * @returns {T[]}
   */
  query(bounds,target = [],func = approxQuery,node = this._root) {
    if (!Overlaps.AABBColliding(node.bounds,bounds))
      return target
    if (node.children.length) {
      this.query(bounds,target,func,node.children[0])
      this.query(bounds,target,func,node.children[1])
      this.query(bounds,target,func,node.children[2])
      this.query(bounds,target,func,node.children[3])
    }
    for (let i = 0; i < node.objects.length; i++) {
      if (func(node.objects[i],bounds))
        target.push(node.objects[i].value)
    }
    return target
  }
  /**
   * @template U
   * @param {TraverserFunc<QuadTreeNode<T>,U[]>} func
   * @param {U[]} [out]
   *  @returns {U[]}
   */
  traverseAll(func,out = [],node = this._root) {
    if (node.children.length) {
      this.traverseAll(func,out,node.children[0])
      this.traverseAll(func,out,node.children[1])
      this.traverseAll(func,out,node.children[2])
      this.traverseAll(func,out,node.children[3])
    }
    func(node,out)
    return out
  }
  /**
   * @inheritdoc
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.beginPath()
    ctx.lineWidth = 5
    ctx.strokeStyle = "blue"
    this.traverseAll(node => {
      const w = (node.bounds.max.x - node.bounds.min.x)
      const h = (node.bounds.max.y - node.bounds.min.y)
      ctx.strokeRect(
        node.bounds.min.x,
        node.bounds.min.y,
        w,
        h
      )
    })
    ctx.strokeStyle = "red"
    this.traverseAll(node => {
      if (!node.hasObjects || node.objects.length === 0) return

      const w = (node.bounds.max.x - node.bounds.min.x)
      const h = (node.bounds.max.y - node.bounds.min.y)
      ctx.strokeRect(
        node.bounds.min.x,
        node.bounds.min.y,
        w,
        h
      )
    })
    ctx.closePath()
  }
  /**
   * @param {number} depth Empty array to store results.
   * @param {QuadTreeNode<T>} node 
   * */
  split(depth,node = this._root) {
    if (depth <= 0) return
    const w = (node.bounds.max.x - node.bounds.min.x) / 2
    const h = (node.bounds.max.y - node.bounds.min.y) / 2
    const originX = node.bounds.min.x + w
    const originY = node.bounds.min.y + h

    const topLeft = new QuadTreeNode(
      new BoundingBox(
        node.bounds.min.x,
        node.bounds.min.y,
        node.bounds.min.x + w,
        node.bounds.min.y + h
      )
    )
    const topRight = new QuadTreeNode(
      new BoundingBox(
        node.bounds.min.x + w,
        node.bounds.min.y,
        node.bounds.max.x,
        node.bounds.max.y - h
      )
    )
    const bottomLeft = new QuadTreeNode(
      new BoundingBox(
        node.bounds.min.x,
        node.bounds.min.y + h,
        node.bounds.max.x - w,
        node.bounds.max.y
      )
    )
    const bottomRight = new QuadTreeNode(
      new BoundingBox(
        node.bounds.min.x + w,
        node.bounds.min.y + h,
        node.bounds.max.x,
        node.bounds.max.y
      )
    )
    node.add(topLeft)
    node.add(topRight)
    node.add(bottomLeft)
    node.add(bottomRight)
    node.children.forEach(
      e => this.split(depth - 1,e)
    )
  }
}
/**
 * @template T
 * @param {Client<T,QuadTreeNode<T>>} _client 
 * @param {BoundingBox} _bound 
 * @returns 
 */
function approxQuery(_client,_bound) {
  return true
}

/**
 * @template T
 * @template U
 * @typedef {import("./types.js").QueryFunc<T,U>} QueryFunc
 */
/**
 * @template T
 * @template U
 * @typedef {import("./types.js").TraverserFunc<T,U>} TraverserFunc
 */