import { Overlaps,Vector2,BoundingBox } from "../chaos.module.js"
import { Err } from "../chaos.module.js"
import { Utils } from "../chaos.module.js"
import { Client } from "./client.js"

export class Node {
  /**@type {Node[]}*/
  children = []
  /**@type {Body[]}*/
  objects = []
  /**@type {Node}*/
  parent = null
  /**@type {boolean}*/
  hasObjects = false
  /**@type {BoundingBox}*/
  bounds = null
  /**
   * @param {BoundingBox} bounds
   */
  constructor(bounds) {
    this.bounds = bounds
  }
  /**
   * @param {Node} node
   */
  add(node) {
    this.children.push(node)
    node.parent = this
  }
  clear() {
    for (var i = 0; i < this.children.length; i++) {
      const node = nodes[i]

      this.children.remove(node)
      node.parent = null
    }
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
   * @param {Bounds} bounds
   * @return {boolean}
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
   * @param {Vector_like} position
   * @returns boolean
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
  isRootNode() {
    return !this.parent
  }
}

/**
 * This is a bounded broadphase that is used to speed up collision testing on sparse number of objects over a large area.
 *
 */
export class QuadTree {
  /**
   * @param {BoundingBox} bounds The region it operates on.
   * @param {number} [maxdepth=3] Maximum number of branches.
   * 
   */
  constructor(bounds,maxdepth = 3) {
    this._root = new Node(bounds)
    this.bounds = bounds

    this.split(maxdepth)
  }
  /**
   * @private
   */
  _insert(client,bound,node) {
    if (!node.contains(bound))
      return false
    for (let i = 0; i < node.children.length; i++) {
      const r = this._insert(client,bound,node.children[i])
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
   * @inheritdoc
   * @param {Body} obj
   */
  insert(client,bound) {
    if (!this._root.contains(bound))
      return Err.warnOnce("A client is has left the quadtree out of bounds")
    this._insert(client,bound,this._root)
  }
  /**
   * @private
   */
  _remove(client) {
    if(!client.node)return
    let objects = client.node.objects
    const index = objects.indexOf(client)
    const removed = Utils.removeElement(objects,index)
    if (removed === null) return false
    return true
  }
  /**
   * @inheritdoc
   * @param {Body} obj
   */
  remove(client) {
    return this._remove(client,this._root)
  }
  /**
   * @inheritdoc
   * @param {Body[]} bodies
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
   * @param {Body[]} [target] Empty array to store results.
   * @param {Node} [node]
   * @returns {Body[]}
   */
  query(bounds,target = [],node = this._root) {
    if (!Overlaps.AABBColliding(node.bounds,bounds))
      return target
    if (node.children.length) {
      this.query(bounds,target,node.children[0])
      this.query(bounds,target,node.children[1])
      this.query(bounds,target,node.children[2])
      this.query(bounds,target,node.children[3])
    }
    for (let i = 0; i < node.objects.length; i++) {
      const objects = node.objects[i]
      if (Overlaps.colliding(objects.bounds,bounds))
        target.push(a)
    }
    return target
  }
  /**
   * @template T
   * @param {traverser<T>} func
   * @param {T} [out]
   *  @returns {T}
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
   * Resizes a quadtree to a new bound size.
   * This method should not be used without care.
   * 
   * @param {BoundingBox} bounds
   * @param {number} depth
   * 
   */
  recalculateBounds(bounds,depth) {
    if (!bounds) return
    let ob = this.traverseAll((e,arr) => {
      let length = e.objects.length
      for (var i = 0; i < length; i++) {
        arr.push(e.objects[i])
      }
    },[])
    this._root = new Node(bounds)
    this.split(depth)
    ob.forEach(e => {
      this.insert(ob)
    })
  }
  /**
   * @param {number} depth Empty array to store results.
   * @@param {Node} node 
   * */
  split(depth,node = this._root) {
    if (depth <= 0) return
    const w = (node.bounds.max.x - node.bounds.min.x) / 2
    const h = (node.bounds.max.y - node.bounds.min.y) / 2
    const originX = node.bounds.min.x + w
    const originY = node.bounds.min.y + h

    const topLeft = new Node(
      new BoundingBox(
        node.bounds.min.x,
        node.bounds.min.y,
        node.bounds.min.x + w,
        node.bounds.min.y + h
      )
    )
    const topRight = new Node(
      new BoundingBox(
        node.bounds.min.x + w,
        node.bounds.min.y,
        node.bounds.max.x,
        node.bounds.max.y - h
      )
    )
    const bottomLeft = new Node(
      new BoundingBox(
        node.bounds.min.x,
        node.bounds.min.y + h,
        node.bounds.max.x - w,
        node.bounds.max.y
      )
    )
    const bottomRight = new Node(
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