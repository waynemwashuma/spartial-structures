import { Renderer2D, Vector2, BoundingBox, rand } from "./chaos.module.js"
import { QuadTree, HashGrid } from "./src/index.js"


const renderer = new Renderer2D()
renderer.setViewport(innerWidth, innerHeight)
document.body.append(renderer.domElement)
const bounds = new BoundingBox(
  100, 100,
  renderer.width - 100, renderer.height - 100
)
const tree = new QuadTree(bounds, 3);
const grid = new HashGrid(100, 100, 200, 200, new Vector2(100, 100))

const obj = createObj(250, 550, 300, 600)
grid.insert(obj)
grid.remove(obj)
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
renderer.play()

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

console.log(grid)