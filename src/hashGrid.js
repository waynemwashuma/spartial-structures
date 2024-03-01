import { Vector2,clamp } from "../chaos.module.js"
import { Utils } from "../chaos.module.js"
import { Client } from "./client.js"
import { renderObj } from "./utils.js"

export class HashGrid {
  queryid = 0
  constructor(binWidth,binHeight,numberX,numberY,offset = new Vector2()) {
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
  _getBinIndex(xoffset,yoffset) {
    return this.binsX * yoffset + xoffset
  }
  _getkey(value,offset,width,number) {
    return clamp(Math.floor((value - offset) / width),0,number - 1)
  }
  _getbinIndices(bounds) {
    const minX = bounds.min.x
    const minY = bounds.min.y
    const maxX = bounds.max.x
    const maxY = bounds.max.y

    const keyx1 = this._getkey(minX,this.offset.x,this.binWidth,this.binsX)
    const keyx2 = this._getkey(maxX,this.offset.x,this.binWidth,this.binsX)
    const keyy1 = this._getkey(minY,this.offset.y,this.binHeight,this.binsY)
    const keyy2 = this._getkey(maxY,this.offset.y,this.binHeight,this.binsY)

    const indices = []
    for (let x = keyx1; x <= keyx2; x++) {
      for (let y = keyy1; y <= keyy2; y++) {
        indices.push(this._getBinIndex(x,y))
      }
    }

    return indices
  }
  /**
   * @private
   * @param {Client} client
   */
  _insert(client,bounds) {
    const indices = this._getbinIndices(bounds)
    for (let i = 0; i < indices.length; i++) {
      this.bins[indices[i]].push(client)
    }
    client.node = indices
  }
  insert(client,bounds) {
    this._insert(client,bounds)
  }
  _remove(client) {
    if(!client.node)return
    const indices = client.node
    for (let i = 0; i < indices.length; i++) {
      const bin = this.bins[indices[i]]
      const index = bin.indexOf(client)

      Utils.removeElement(bin,index)
    }
    client.node.length = 0
  }
  remove(client) {
    this._remove(client)
  }
  update(clients,bounds) {
    for (let i = 0; i < clients.length; i++) {
      this._remove(clients[i])
      this._insert(clients[i],bounds[i])
    }
  }
  query(bounds,out = []) {
    this.queryid++
    const list = this._getbinIndices(bounds)
    for (var i = 0; i < list.length; i++) {
      const bin = this.bins[list[i]]

      for (let j = 0; j < bin.length; j++) {
        const client = bin[j]
        if (client.queryid === this.queryid) continue
        client.queryid = this.queryid
        out.push(client.value)
      }
    }
  }
  traverseAll(func,out) {
    for (let i = 0; i < this.bins.length; i++) {
      func(this.bins[i],out)
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