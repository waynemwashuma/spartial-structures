import { Utils, Vector2, Overlaps, BoundingBox, clamp } from "../chaos.module.js"
import { Client } from "./client.js"
import { renderObj } from "./utils.js"

class Node {
  value = null
  parent = null
  left = null
  right = null
  bounds = new BoundingBox()
  constructor(value) {
    this.value = value
  }
  static union(node1, node2, out = new Node()) {
    BoundingBox.union(node1.bounds, node2.bounds, out.bounds)
    return out
  }
}
export class AabbTree {
  constructor(padding = new Vector()) {
    this.root = null
    this.padding = padding
  }
  _adjustBounds(node) {
    Node.union(node.left, node.right, node)
    if (!node.parent) return
    this._adjustBounds(node.parent)
  }
  _cost(node, sibling) {
    const union = new Node()
    Node.union(node, sibling, union)

    return calcPerimeter(union.bounds)
  }
  _resolveNode(node, parent = this.root) {
    if (!parent.left) {
      const newParent = new Node()
      const oldParent = parent

      if (oldParent.parent === null) {
        this.root = newParent
      } else if (parent.parent.left === parent) {
        parent.parent.left = newParent
      } else if (parent.parent.right === parent) {
        parent.parent.right = newParent
      }

      newParent.parent = oldParent.parent
      oldParent.parent = newParent
      node.parent = newParent


      newParent.left = oldParent
      newParent.right = node

      this._adjustBounds(node.parent)
    }
    if (parent.left) {
      let leftcost = this._cost(node, parent.left)
      let rightcost = this._cost(node, parent.right)

      if (leftcost > rightcost)
        return this._resolveNode(node, parent.right)
      this._resolveNode(node, parent.left)
    }
  }
  _insert(client) {
    client.bounds.copy(client.body.bounds)
    const node = new Node(client)
    client.node = node
    node.bounds.copy(client.bounds)

    Vector2.prototype.sub.call(node.bounds.min, this.padding)
    Vector2.prototype.add.call(node.bounds.max, this.padding)

    if (!this.root) {
      this.root = node
      return true
    }
    this._resolveNode(node)
  }
  insert(obj) {
    obj.client = new Client(obj)
    this._insert(obj.client)
  }
  _remove(client) {
    const node = client.node
    const parent = node.parent
    if (!parent) return this.root = null

    const sibling = parent.left === node ? parent.right : parent.left

    this._swapRemove(sibling, parent)
    if (node.parent === null) return
    this._adjustBounds(node.parent)

    //recycle node here.
    //recycle the parent here
  }
  _swapRemove(node1, node2) {
    node1.parent = node2.parent
    if (node2.parent == null)
      return this.root = node1
    if (node2.parent.left === node2) {
      node2.parent.left = node1
    }
    if (node2.parent.right === node2) {
      node2.parent.right = node1
    }
  }
  remove(obj) {
    const client = obj.client

    this._remove(client)
  }
  update(objs) {
    for (let i = 0; i < objs.length; i++) {
      this._remove(objs[i].client)
      this._insert(objs[i].client)
    }
  }
  query(bounds, out = [], node = this.root) {
    if (node == void 0) return out
    if (!Overlaps.AABBColliding(node.bounds, bounds)) return out
    if (!node.left) {
      target.push(node.value)
      return out
    }
    this.query(bounds, out, node.left)
    this.query(bounds, out, node.right)
    return out
  }
  traverseAll(func, out, node = this.root) {
    if (node == null) return
    func(node, out)
    this.traverseAll(func, out, node.left)
    this.traverseAll(func, out, node.right)

  }
  draw(ctx) {
    this.traverseAll(node => {
      ctx.lineWidth = 5
      ctx.strokeStyle = "blue"
      renderObj(ctx, node.bounds)
    })
    this.traverseAll(node => {
      if (!node.value) return
      ctx.strokeStyle = "white"
      renderObj(ctx, node.value.bounds)
    })
  }
}

function calcPerimeter(bounds) {
  const w = (bounds.max.x - bounds.min.x)
  const h = (bounds.max.y - bounds.min.y)

  return w + w + h + h
}

function calcArea(bounds) {
  const w = (bounds.max.x - bounds.min.x)
  const h = (bounds.max.y - bounds.min.y)

  return w * h
}