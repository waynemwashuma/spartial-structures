import { Overlaps, Vector2, BoundingBox,clamp } from "../chaos.module.js"
import { Utils } from "../chaos.module.js"
import { Client } from "./client.js"
import { renderObj } from "./utils.js"

export class HashGrid {
  queryid = 0
  constructor(binWidth, binHeight, numberX, numberY, offset = new Vector2()) {
    this.bins = []
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
  _getBinIndex(xoffset, yoffset) {
    return this.binsX * yoffset + xoffset
  }
  _getkey(value, offset, width, number) {
    return clamp(Math.floor((value - offset) / width), 0, number - 1)
  }
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
   * @private
   * @param {Client} client
   */
  _insert(client) {
    client.bounds.copy(client.body.bounds)
    const indices = this._getbinIndices(client.bounds)
    for (let i = 0; i < indices.length; i++) {
      this.bins[indices[i]].push(client)
    }

    client.nodes = indices
  }
  insert(obj) {
    if (obj.client == void 0)
      obj.client = new Client(obj)
    this._insert(obj.client)
  }
  _remove(client) {
    const indices = client.nodes
    for (let i = 0; i < indices.length; i++) {
      const bin = this.bins[indices[i]]
      const index = bin.indexOf(client)

      Utils.removeElement(bin, index)
    }
    client.nodes.length = 0
  }
  remove(obj) {
    if (obj.client == void 0) return
    this._remove(obj.client)
  }
  update(objs) {
    for (let i = 0; i < objs.length; i++) {
      const obj = objs[i]

      this._remove(obj.client)
      this._insert(obj.client)
    }
  }
  query(bounds,out = []) {
    this.queryid++
    const list = this._getbinIndices(bounds)
    for (var i = 0; i < list.length; i++) {
      const bin = this.bins[list[i]]
      
      for (let j = 0; j < bin.length; j++) {
        const client = bin[j]
        if(client.queryid === this.queryid)continue
        client.queryid = this.queryid
        out.push(client.value)
      }
    }
  }
  traverseAll(func, out) {
    for (let i = 0; i < this.bins.length; i++) {
      func(this.bins[i], out)
    }
  }
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
    ctx.strokeStyle = "red"
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
    for (let i = 0; i < this.bins.length; i++) {
      const bin = this.bins[i]

      for (let j = 0; j < bin.length; j++) {
        renderObj(ctx, bin[j].bounds)
      }
    }
  }
}