import { Renderer2D, Vector2, BoundingBox, rand } from "./chaos.module.js"
import { QuadTree, HashGrid, AabbTree } from "./src/index.js"


const renderer = new Renderer2D()
renderer.setViewport(innerWidth, innerHeight)
setTimeout(_ => renderer.play())
document.body.append(renderer.domElement)
const bounds = new BoundingBox(
  100, 100,
  renderer.width - 100, renderer.height - 100
)
const quadtree = new QuadTree(bounds, 3);
const aabbtree = new AabbTree(new Vector2(15, 15))
const grid = new HashGrid(100, 100, 20, 20, new Vector2(100, 100))
const canvasBound = new BoundingBox(
  20, 20,
  renderer.width - 50,
  renderer.height - 50
)

renderDemo7()

//spatialHashgrid
function renderDemo1() {
  const obj = createObj(250, 550, 300, 600)
  grid.insert(obj)
  let r = 0
  let length = 3
  const speed = 0.01
  renderer.add({
    render(ctx) {
      obj.bounds.translate(
        new Vector2(
          length * Math.sin(r),
          length * Math.cos(r)
        )
      )
      grid.update([obj])
      r += speed
      grid.draw(ctx)
    }
  })
}

function renderDemo2() {
  const obj = createObj(250, 550, 300, 600)
  const obj2 = createObj(750, 480, 800, 580)
  grid.insert(obj)
  grid.insert(obj2)
  let r = 0
  let length = 3
  const speed = 0.01
  renderer.add({
    render(ctx) {
      obj.bounds.translate(
        new Vector2(
          length * Math.sin(r),
          length * Math.cos(r)
        )
      )
      obj2.bounds.translate(
        new Vector2(
          length * Math.sin(-r),
          length * Math.cos(-r)
        )
      )
      grid.update([obj, obj2])
      r += speed


      grid.draw(ctx)
    }
  })
}

//quadtree 
function renderDemo3() {
  const obj = createObj(250, 550, 300, 600)
  quadtree.insert(obj)
  let r = 0
  let length = 3
  const speed = 0.01
  renderer.add({
    render(ctx) {
      obj.bounds.translate(
        new Vector2(
          length * Math.sin(r),
          length * Math.cos(r)
        )
      )

      quadtree.update([obj])
      r += speed
      quadtree.draw(ctx)
    }
  })
}

function renderDemo4() {
  const obj = createObj(250, 550, 300, 600)
  const obj2 = createObj(750, 480, 800, 580)
  quadtree.insert(obj)
  quadtree.insert(obj2)
  let r = 0
  let length = 3
  const speed = 0.01
  renderer.add({
    render(ctx) {
      obj.bounds.translate(
        new Vector2(
          length * Math.sin(r),
          length * Math.cos(r)
        )
      )
      obj2.bounds.translate(
        new Vector2(
          length * Math.sin(-r),
          length * Math.cos(-r)
        )
      )
      quadtree.update([obj, obj2])
      r += speed


      quadtree.draw(ctx)
    }
  })
}

//aabbtree
function renderDemo5() {
  const obj = createObj(250, 550, 300, 600)
  aabbtree.insert(obj)
  let r = 0
  let length = 3
  const speed = 0.01
  renderer.add({
    render(ctx) {
      obj.bounds.translate(
        new Vector2(
          length * Math.sin(r),
          length * Math.cos(r)
        )
      )

      aabbtree.update([obj])
      r += speed
      aabbtree.draw(ctx)
    }
  })
}

function renderDemo6() {
  const obj = createObj(250, 550, 300, 600)
  const obj2 = createObj(750, 480, 800, 580)
  aabbtree.insert(obj)
  aabbtree.insert(obj2)
  let r = 0
  let length = 3
  const speed = 0.01
  renderer.add({
    render(ctx) {
      obj.bounds.translate(
        new Vector2(
          length * Math.sin(r),
          -length * Math.cos(r)
        )
      )
      obj2.bounds.translate(
        new Vector2(
          length * Math.sin(-r),
          length * Math.cos(-r)
        )
      )
      aabbtree.update([obj, obj2])
      r += speed


      aabbtree.draw(ctx)
    }
  })
}

function renderDemo7() {
  const obj = []
  for (var i = 0; i < 20; i++) {
    let r = createRandom(canvasBound, 100, 200)
    obj.push(r)
    r.velocity.set(rand() * 10, rand() * 10)
  }
  obj.forEach(o => aabbtree.insert(o))
  renderer.add({
    render(ctx) {
      obj.forEach(o => {
        o.bounds.translate(o.velocity)
        bounceoff(o)
      })
      aabbtree.update(obj)
      aabbtree.draw(ctx)
    }
  })
}

function createObj(minX, minY, maxX, maxY) {
  return {
    bounds: new BoundingBox(minX, minY, maxX, maxY),
    client: null,
    velocity: new Vector2(),
    getBounds() {
      return this.bounds
    }
  }
}

function createRandom(bounds, width, height) {
  const minX = rand(bounds.min.x, bounds.max.x)
  const minY = rand(bounds.min.y, bounds.max.y)

  return createObj(minX, minY, minX + rand() * width, minY + rand() * height)
}

function bounceoff(obj) {
  if (obj.bounds.min.x < canvasBound.min.x || obj.bounds.min.x > canvasBound.max.x)
    obj.velocity.x = -obj.velocity.x
  if (obj.bounds.min.y < canvasBound.min.y || obj.bounds.min.y > canvasBound.max.y)
    obj.velocity.y = -obj.velocity.y
}