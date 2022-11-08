Array.prototype.exclude = (that) => {
  return this.filter(el => !Object.is(that, this) || !that === this)
}
class Node {
  constructor(params, global) {
    this.children = []
    this.parent = null
    this.global = global || null
    this.bounds = params.bounds
    this.dimensions = {}
    this.dimensions.x = this.bounds.max.x - this.bounds.min.x
    this.dimensions.y = this.bounds.max.y - this.bounds.min.y
  }
  add(...nodes) {
    for (var i = 0; i < nodes.length; i++) {
      const node = nodes[i]

      this.children.push(node)
      node.parent = this
      node.global = this.global
    }
  }
  removeNodes() {
    for (var i = 0; i < nodes.length; i++) {
      const node = nodes[i]

      this.children.remove(node)
      node.parent = null
      node.global = null
    }
  }
  isSplitable() {
    if (this.dimensions.x / 2 > this.global.params.minDimensions.x && this.dimensions.y / 2 > this.global.params.minDimensions.y) return true
    return false
  }
  split(obj) {
    let r = this.genNodeParamsFromNode(this)
    if (!this.isSplitable()) return
    for (let i = 0; i < r.length; i++) {
      const data = r[i];
      const node = new Node(data,this.global)

      if (node.isInNode(obj)) node.split(obj)
      this.add(node)
    }

  }
  draw(ctx) {
    ctx.beginPath()
    ctx.strokeStyle = "red"
    ctx.lineWidth = 5
    ctx.strokeRect(this.bounds.min.x, this.bounds.min.y, this.dimensions.x, this.dimensions.y)
    ctx.stroke()
    ctx.closePath()
    this.children.forEach(child => {
      child.draw(ctx)
    })
  }
  get isLeafNode() {
    return this.children.length > 0
  }
  isInNode(obj) {
    if (obj.position.x > this.bounds.min.x &&
      obj.position.y > this.bounds.min.y &&
      obj.position.x < this.bounds.max.x &&
      obj.position.y < this.bounds.max.y) {
      return true
    }
    return false
  }
  genNodeParamsFromNode() {
    let r = [], t
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 2; j++) {
        t = {}
        t.bounds = {
          min: {
            x: this.bounds.min.x + (this.dimensions.x / i === Infinity?0:this.dimensions.x / i)/2,
            y: this.bounds.min.y + (this.dimensions.y / j === Infinity?0:this.dimensions.y / j)/2
          }
        }
        t.bounds.max = {
          x: t.bounds.min.x + this.dimensions.x/2 ,
          y: t.bounds.min.y + this.dimensions.y/2
        }
        t.dimensions ={
          x:t.bounds.max.x - t.bounds.min.x,
          y:t.bounds.max.y - t.bounds.min.y
        }
        r.push(t)

      }
    }
    return r
  }
  findNeigbors() {
    if (this.parent === null) return []
    return this.parent.children.exclude(this)
  }
}
class Octree {
  constructor(params) {
    this._root = new Node(params.node, this)
    this.params = params
  }
  insert(node) {
    root.insert(node)
  }
  draw(ctx) {
    this._root.draw(ctx)
  }
  split(obj) {
    this._root.split(obj)
  }
}


export {
  Node,
  Octree
}