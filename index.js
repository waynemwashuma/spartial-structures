import { Renderer2D,Vector2,BoundingBox,rand } from "./chaos.module.js"
import { Client } from "./src/client.js"
import { QuadTree,HashGrid,AabbTree,renderObj } from "./src/index.js"

const renderer = new Renderer2D()
renderer.setViewport(innerWidth,innerHeight)
setTimeout(_ => renderer.play())
document.body.append(renderer.domElement)
const canvasBound = new BoundingBox(
  0,0,
  renderer.width,renderer.height
)
const bound = new BoundingBox(-20,-20,renderer.width + 20,renderer.height + 20)
const quadtree = new QuadTree(bound,3);
const aabbtree = new AabbTree(new Vector2(15,15))
const GRID_NUMBER = 20
const grid = new HashGrid(
  renderer.width / GRID_NUMBER,renderer.height / GRID_NUMBER,
  GRID_NUMBER,
  GRID_NUMBER,
  new Vector2(0,0)
)

demoGrid(quadtree,renderer,2)

function demoGrid(grid,renderer,number = 10) {
  renderer.clear()
  const [velocity,bounds,clients] = createObjs(renderer.width,renderer.height,50,50,number)
  renderer.add({
    render(ctx) {
      translate_bound(bounds,i => [velocity[i].x,velocity[i].y])
      bounceoff(velocity,bounds)
      grid.update(clients,bounds)
      grid.draw(ctx)
      ctx.strokeStyle = "white"
      bounds.forEach(b=>renderObj(ctx,b))
    }
  })
}

function createObjs(x,y,w,h,no) {
  const map = [[],[],[]]

  for (let i = 0; i < no; i++) {
    x = rand(100,x)
    y = rand(100,y)

    map[0].push(new Vector2(rand(-5,5),rand(-5,5)))
    map[1].push(new BoundingBox(x - w / 2,y - h / 2,x + w / 2,y + h / 2))
    map[2].push(new Client(map[0].length-1,null))
  }
  return map
}
function grid_insert(grid,objs,bounds) {
  for (let i = 0; i < objs.length; i++) {
    grid.insert(objs[i],bounds[i])
  }
}
function translate_bound(bounds,func) {
  for (let i = 0; i < bounds.length; i++) {
    const [x,y] = func(i)
    bounds[i].translate(
      new Vector2(
        x,
        y
      )
    )
  }
}
function createRandom(bounds,width,height) {
  const minX = rand(bounds.min.x,bounds.max.x)
  const minY = rand(bounds.min.y,bounds.max.y)

  return createObj(minX,minY,minX + rand() * width,minY + rand() * height)
}

function bounceoff(velocity,bounds) {
  for (let i = 0; i < bounds.length; i++) {
    if (bounds[i].min.x < canvasBound.min.x || bounds[i].min.x > canvasBound.max.x)
      velocity[i].x = -velocity[i].x
    if (bounds[i].min.y < canvasBound.min.y || bounds[i].min.y > canvasBound.max.y)
      velocity[i].y = -velocity[i].y
  }

}
console.log(aabbtree)