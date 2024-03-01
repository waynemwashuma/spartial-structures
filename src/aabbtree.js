import { Overlaps,Vector2,BoundingBox } from "../chaos.module.js"
import { Client } from "./client.js"
import { renderObj } from "./utils.js"
import { Pool } from "./objectPool.js"

/**
 * @template T
 * @extends {Pool<AabbTreeNode<T>>}
 */
class NodePool extends Pool {
  /**
   * @param {number} [n]
   */
  constructor(n) {
    super(n)
  }
  create() {
    return new AabbTreeNode()
  }
  /**
   * 
   * @param {AabbTreeNode<T>} node 
   * @returns 
   */
  destroy(node) {
    node.parent = null
    node.value = null
    node.left = null
    node.right = null
    return node
  }
}
/**
 * @template T
 */
class AabbTreeNode {
  /**
   * @type {Client<T,AabbTreeNode<T>> | null}
   */
  value = null
  /**
   * @type {AabbTreeNode<T> | null}
   */
  parent = null
  /**
   * @type {AabbTreeNode<T> | null}
   */
  left = null
  /**
   * @type {AabbTreeNode<T> | null}
   */
  right = null
  /**
   * @type {BoundingBox}
   */
  bounds = new BoundingBox()
  /**
   * @template T
   * @param {AabbTreeNode<T>} node1
   * @param {AabbTreeNode<T>} node2
   * @param {AabbTreeNode<T>} out
   */
  static union(node1,node2,out = new AabbTreeNode()) {
    BoundingBox.union(node1.bounds,node2.bounds,out.bounds)
    return out
  }
}
/**
 * @template T
 */
export class AabbTree {
  /**
   * @type {NodePool<T>}
   */
  _pool = new NodePool(1)
  /**
   * 
   * @param {Vector2} padding 
   */
  constructor(padding = new Vector2(0,0)) {
    this.root = null
    this.padding = padding
  }
  /**
   * @private
   * @param {AabbTreeNode<T>} node
   */
  _adjustBounds(node) {
    //@ts-ignore
    AabbTreeNode.union(node.left,node.right,node)
    if (!node.parent) return
    this._adjustBounds(node.parent)
  }
  /**
   * @private
   * @param {AabbTreeNode<T>} node
   * @param {AabbTreeNode<T>} sibling
   */
  _cost(node,sibling) {
    const union = new AabbTreeNode()
    AabbTreeNode.union(node,sibling,union)

    return calcPerimeter(union.bounds)
  }
  /**
   * @private
   * @param {AabbTreeNode<T>} node
   * @param {AabbTreeNode<T> | null} [parent]
   */
  _resolveNode(node,parent = this.root) {
    if(!parent){
      this.root = null
      return
    }
    if (!parent.left) {
      const newParent = this._pool.give()
      const oldParent = parent

      if (oldParent.parent === null) {
        this.root = newParent
      } else if (oldParent.parent.left === parent) {
        oldParent.parent.left = newParent
      } else {
        oldParent.parent.right = newParent
      }

      newParent.parent = oldParent.parent
      oldParent.parent = newParent
      node.parent = newParent


      newParent.left = oldParent
      newParent.right = node

      this._adjustBounds(node.parent)
    }
    if (parent.left && parent.right) {
      const leftcost = this._cost(node,parent.left)
      const rightcost = this._cost(node,parent.right)
      const bestParent = leftcost > rightcost ? parent.right : parent.left
      this._resolveNode(node,bestParent)
    }
  }
  /**
   * @param {Client<T, AabbTreeNode<T>>} client
   * @param {BoundingBox} bound
   */
  insert(client,bound) {
    const node = this._pool.give()
    //const node = new AabbTreeNode()
    node.value = client
    client.node = node
    node.bounds.copy(bound)

    Vector2.prototype.sub.call(node.bounds.min,this.padding)
    Vector2.prototype.add.call(node.bounds.max,this.padding)

    if (!this.root) {
      this.root = node
      return true
    }
    this._resolveNode(node)
  }
  /**
   * @param {Client<T, AabbTreeNode<T>>} client
   */
  remove(client) {
    if (!client.node) return
    const node = client.node
    const parent = node.parent
    if (!parent) {
      this.root = null
      return
    }
    
    //I am certain that there must be a left and right node on the parent
    //Btw,im just casting (yes,in javascript)
    const sibling = /**@type {AabbTreeNode<T>} */(parent.left === node ? parent.right : parent.left)

    this._swapRemove(sibling,parent)
    if(sibling.parent)this._adjustBounds(sibling.parent)

    this._pool.take(node)
    this._pool.take(parent)
  }
  /**
   * @private
   * @param {AabbTreeNode<T>} node1
   * @param {AabbTreeNode<T>} node2
   */
  _swapRemove(node1,node2) {
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
  /**
   * @param {Client<T,AabbTreeNode<T>>[]} clients
   * @param {BoundingBox[]} bounds
   */
  update(clients,bounds) {
    this.clear()
    for (let i = 0; i < clients.length; i++) {
      this.insert(clients[i],bounds[i])
    }
  }
  /**
   * @param {BoundingBox} bounds
   * @param {T[]} out
   * @param {AabbTreeNode<T> | null} node
   */
  query(bounds,out = [],node = this.root) {
    if (!node) return out
    if (!Overlaps.AABBColliding(node.bounds,bounds)) return out
    if (node.value) {
      out.push(node.value.value)
      return out
    }
    this.query(bounds,out,node.left)
    this.query(bounds,out,node.right)
    return out
  }
  /**
   * @template U
   * @param {TraverserFunc<AabbTreeNode<T>,U[]>} func
   * @param {U[]} [out]
   */
  traverseAll(func,out = [],node = this.root) {
    if (node == null) return
    this.traverseAll(func,out,node.left)
    this.traverseAll(func,out,node.right)
    return func(node,out)
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    this.traverseAll(node => {
      ctx.lineWidth = 5
      ctx.strokeStyle = "blue"
      renderObj(ctx,node.bounds)
    })
  }
  /**
   * 
   * @param {AabbTreeNode<T> | null} node 
   */
  clear(node = this.root) {
    if (node === null) return
    this.root = null
    this._clear(node)
  }
  /**
   * @param {AabbTreeNode<T>} node
   */
  _clear(node) {
    if (node.left && node.right) {
      this._clear(node.left)
      this._clear(node.right)
    }
    this._pool.take(node)
  }
}
/**
 * @param {BoundingBox} bounds
 */
function calcPerimeter(bounds) {
  const w = (bounds.max.x - bounds.min.x)
  const h = (bounds.max.y - bounds.min.y)

  return w + w + h + h
}

/**
 * @param {BoundingBox} bounds
 */
function calcArea(bounds) {
  const w = (bounds.max.x - bounds.min.x)
  const h = (bounds.max.y - bounds.min.y)

  return w * h
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