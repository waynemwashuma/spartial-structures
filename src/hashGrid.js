import { BoundingBox, Vector2, clamp, naturalizePair } from "../chaos.module.js"
import { Utils } from "../chaos.module.js"
import { Client } from "./client.js"
/**
 * @template T
 */
export class HashGrid {
  /**
   * @type {number}
   */
  queryid = 0
  /**
   * @type {Client<T,number[]>[][]}
   */
  bins = []
  /**
   * 
   * @param {number} binWidth 
   * @param {number} binHeight 
   * @param {number} numberX 
   * @param {number} numberY 
   * @param {Vector2} offset 
   */
  constructor(binWidth, binHeight, numberX, numberY, offset = new Vector2(0, 0)) {
    this.binWidth = binWidth
    this.binHeight = binHeight
    this.binsX = numberX
    this.binsY = numberY
    this.offset = offset

    for (let i = 0; i < numberX; i++) {
      for (let j = 0; j < numberY; j++) {
        this.bins.push([])
      }
    }
  }
  /**
   * 
   * @private
   * @param {number} xoffset 
   * @param {number} yoffset 
   * @returns {number}
   */
  _getBinIndex(xoffset, yoffset) {
    return this.binsX * yoffset + xoffset
  }
  /**
   * @private
   * @param {number} value 
   * @param {number} offset 
   * @param {number} width 
   * @param {number} number 
   */
  _getkey(value, offset, width, number) {
    return clamp(Math.floor((value - offset) / width), 0, number - 1)
  }
  /**
   * 
   * @param {BoundingBox} bounds 
   */
  _getbinIndices(bounds) {
    const minX = bounds.min.x
    const minY = bounds.min.y
    const maxX = bounds.max.x
    const maxY = bounds.max.y

    const keyx1 = this._getkey(minX, this.offset.x, this.binWidth, this.binsX)
    const keyx2 = this._getkey(maxX, this.offset.x, this.binWidth, this.binsX)
    const keyy1 = this._getkey(minY, this.offset.y, this.binHeight, this.binsY)
    const keyy2 = this._getkey(maxY, this.offset.y, this.binHeight, this.binsY)

    const indices = []
    for (let x = keyx1; x <= keyx2; x++) {
      for (let y = keyy1; y <= keyy2; y++) {
        indices.push(this._getBinIndex(x, y))
      }
    }

    return indices
  }
  /**
   * @param {Client<T,number[]>} client 
   * @param {BoundingBox} bounds 
   */
  insert(client, bounds) {
    const indices = this._getbinIndices(bounds)
    for (let i = 0; i < indices.length; i++) {
      this.bins[indices[i]].push(client)
    }
    client.node = indices
  }
  /**
   * 
   * @param {Client<T,number[]>} client 
   * @returns 
   */
  remove(client) {
    if (!client.node) return
    const indices = client.node
    for (let i = 0; i < indices.length; i++) {
      const bin = this.bins[indices[i]]
      const index = bin.indexOf(client)

      Utils.removeElement(bin, index)
    }
    client.node.length = 0
  }
  /**
   * 
   * @param {Client<T,number[]>[]} clients 
   * @param {BoundingBox[]} bounds 
   */
  update(clients, bounds) {
    for (let i = 0; i < clients.length; i++) {
      this.remove(clients[i])
      this.insert(clients[i], bounds[i])
    }
  }
  /**
   * @param {BoundingBox} bound
   * @param {T[]} out
   * @param {QueryFunc<number[],T>} func
   */
  query(bound, out = [], func = () => true) {
    this.queryid++
    const list = this._getbinIndices(bound)
    for (var i = 0; i < list.length; i++) {
      const bin = this.bins[list[i]]

      for (let j = 0; j < bin.length; j++) {
        const client = bin[j]
        if (client.queryid === this.queryid) continue
        client.queryid = this.queryid
        if (func(client, bound))
          out.push(client.value)
      }
    }
  }
  /**
   * @template U
   * @param {TraverserFunc<Client<T,number[]>[],U[]>} func
   * @param {U[]} out
   */
  traverseAll(func, out) {
    for (let i = 0; i < this.bins.length; i++) {
      func(this.bins[i], out)
    }
    return out
  }
  /**
   * @ignore
   */
  getCollisionPairs(func, client) {
    return HashGrid.getCollisionPairs(this, func, client, [])
  }
  /**
   * @template T
   * @template U
   * @param {HashGrid<T>} grid
   * @param {CollisionChecker<T,number[],U>} func
   * @param {Client<T,number[]>}
   * @param {U[]} target
   */
  static getCollisionPairs(grid, func, clients, target = []) {
    for (let i = 0; i < clients.length; i++) {
      HashGrid.getCollidingPairsFor(grid, clients[i], func, target)
    }
    return target
  }
  /**
   * @template T
   * @template U
   * @param {Client<T,number[]>} client
   * @param {CollisionChecker<T,number[],U>} func
   * @param {U[]} target
   */
  static getCollidingPairsFor(grid, client, func, target) {

    for (let i = 0; i < client.node.length; i++) {
      const bin = grid.bins[client.node[i]]
      for (let j = 0; j < bin.length; j++) {
        if (bin[j] === client) continue
        const t = func(client, bin[j])
        if (t) target.push(t)
      }
    }
  }
  /**
   * @template T
   * @template U
   * @param {Client<T,number[]>[]} bin
   * @param {CollisionChecker<T,number[],U>} func
   * @param {U[]} target
   */
  static getBinPairs(bin, func, target) {
    for (let i = 0; i < bin.length; i++) {
      for (let j = 0; j < bin.length; j++) {
        if(i === j)continue
        const pair = func(bin[i], bin[j])
        if (pair) target.push(pair)
      }
    }
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.strokeStyle = "blue"

    for (let index = 0; index < this.bins.length; index++) {
      const bin = this.bins[index]
      const i = index % this.binsX
      const j = (index - i) / this.binsX

      ctx.strokeRect(
        i * this.binWidth + this.offset.x,
        j * this.binHeight + this.offset.y,
        this.binWidth,
        this.binHeight
      )
    }
    ctx.strokeStyle = "cyan"
    for (let index = 0; index < this.bins.length; index++) {

      const bin = this.bins[index]
      if (bin.length === 0) continue
      const i = index % this.binsX
      const j = (index - i) / this.binsX

      ctx.strokeRect(
        i * this.binWidth + this.offset.x,
        j * this.binHeight + this.offset.y,
        this.binWidth,
        this.binHeight
      )
    }
    ctx.closePath() /**/
    ctx.strokeStyle = "white"
  }
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
/**
 * @template T
 * @template U
 * @template V
 * @typedef {import("./types.js").CollisionChecker<T,U,V>} CollisionChecker
 */