import { Renderer2D, Vector2, BoundingBox, rand } from "./chaos.module.js"
import { QuadTree, renderObj } from "./quadtree.js"


const renderer = new Renderer2D()
renderer.setViewport(innerWidth, innerHeight)
document.body.append(renderer.domElement)
const bounds = new BoundingBox(
  100, 100,
  renderer.width - 100, renderer.height - 100
)
const tree = new QuadTree(bounds, 3);

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
    //renderObj(ctx, obj)
  }
})
renderer.play()

function createObj(minX, minY, maxX, maxY) {
  return {
    bounds: new BoundingBox(minX, minY, maxX, maxY),
    client: null
  }
}

function createRandom(bounds, width, height) {
  const minX = rand(bounds.min.x,bounds.max.x)
  const minY = rand(bounds.min.y,bounds.max.y)
  
  return createObj(minX, minY, minX + rand() * width, minY + rand() * height)
}