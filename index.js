import { Renderer2D, Vector2, BoundingBox, rand } from "./chaos.module.js"
import { QuadTree, HashGrid } from "./src/index.js"


const renderer = new Renderer2D()
renderer.setViewport(innerWidth, innerHeight)
renderer.play()
document.body.append(renderer.domElement)
const bounds = new BoundingBox(
  100, 100,
  renderer.width - 100, renderer.height - 100
)
const tree = new QuadTree(bounds, 3);
const grid = new HashGrid(100, 100, 20, 20, new Vector2(100, 100))



renderDemo1()

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
  tree.insert(obj)
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
      
      tree.update([obj])
      r += speed
      tree.draw(ctx)
    }
  })
}
function renderDemo4() {
  const obj = createObj(250, 550, 300, 600)
  const obj2 = createObj(750, 480, 800, 580)
  tree.insert(obj)
  tree.insert(obj2)
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
      tree.update([obj, obj2])
      r += speed


      tree.draw(ctx)
    }
  })
}
function createObj(minX, minY, maxX, maxY) {
  return {
    bounds: new BoundingBox(minX, minY, maxX, maxY),
    client: null
  }
}
function createRandom(bounds, width, height) {
  const minX = rand(bounds.min.x, bounds.max.x)
  const minY = rand(bounds.min.y, bounds.max.y)

  return createObj(minX, minY, minX + rand() * width, minY + rand() * height)
}