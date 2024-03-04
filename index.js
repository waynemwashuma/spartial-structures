import { Renderer2D, Vector2, BoundingBox, rand } from "./chaos.module.js"
import { Client } from "./src/client.js"
import { QuadTree, HashGrid, AabbTree, renderObj } from "./src/index.js"

const renderer = new Renderer2D()
renderer.setViewport(innerWidth, innerHeight)
setTimeout(_ => renderer.play())
renderer.bindTo("#can")
const canvasBound = new BoundingBox(
  0, 0,
  renderer.width, renderer.height
)
const bound = new BoundingBox(-20, -20, renderer.width + 20, renderer.height + 20)
const quadtree = new QuadTree(bound, 3);
const aabbtree = new AabbTree(new Vector2(15, 15))
const GRID_NUMBER = 20
const grid = new HashGrid(
  renderer.width / GRID_NUMBER, renderer.height / GRID_NUMBER,
  GRID_NUMBER,
  GRID_NUMBER,
  new Vector2(0, 0)
)

demoGrid(quadtree, renderer, 300)
renderer.update()

function demoGrid(grid, renderer, number = 10) {
  renderer.clear()
  const [velocity, bounds, clients] = createObjs(renderer.width - 100, renderer.height - 100, 50, 50, number)
  renderer.add({
    render(ctx) {
      translate_bound(bounds, i => [velocity[i].x, velocity[i].y])
      bounceoff(canvasBound, velocity, bounds)
      grid.update(clients, bounds)
      const collided = quadtree.getCollisionPairs(checker)
        .map(e => [bounds[e.a], bounds[e.b]])
        .reduce((a, b) => b.concat(a), [])
      grid.draw(ctx)
      ctx.strokeStyle = "white"
      bounds.forEach(b => renderObj(ctx, b))
      ctx.strokeStyle = "red"
      
      //we are actually redrawing more than 
      //twice if the object is involved in 
      //more than one collision 
      collided.forEach(b => renderObj(ctx, b))
    }
  })

  function checker(a, b) {
    if (bounds[a.value].intersects(bounds[b.value])) return {
      a: a.value,
      b: b.value
    }
    return null
  }
}



function createObjs(x, y, w, h, no) {
  const map = [[], [], []]

  for (let i = 0; i < no; i++) {
    const nx = rand(100, x)
    const ny = rand(100, y)

    map[0].push(new Vector2(rand(-5, 5), rand(-5, 5)))
    map[1].push(new BoundingBox(nx - w / 2, ny - h / 2, nx + w / 2, ny + h / 2))
    map[2].push(new Client(map[0].length - 1, null))
  }
  return map
}

function translate_bound(bounds, func) {
  for (let i = 0; i < bounds.length; i++) {
    const [x, y] = func(i)
    bounds[i].translate(
      new Vector2(
        x,
        y
      )
    )
  }
}

function bounceoff(bound, velocity, bounds) {
  for (let i = 0; i < bounds.length; i++) {
    if (bounds[i].min.x < bound.min.x || bounds[i].max.x > bound.max.x)
      velocity[i].x = -velocity[i].x
    if (bounds[i].min.y < bound.min.y || bounds[i].max.y > bound.max.y)
      velocity[i].y = -velocity[i].y
  }

}