import { Octree, Node } from "./octree.mjs"

let c = document.createElement('canvas')

c.width = innerWidth
c.height = innerHeight
document.body.append(c)

let ctx = c.getContext('2d')

let params = {
    node: {
        bounds: {
            min: {
                x: 0,
                y: 0
            },
            max: {
                x: 600,
                y: 600
            }
        }
    },
    minDimensions:{
        x:20,
        y:20
    }
}
let obj = {
    position: {
        x: 299,
        y: 299
    }
}
let tree = new Octree(params, obj);
console.log(tree);
tree.split(obj)

window.addEventListener('resize',e=>{
    c.width = innerWidth;
    c.height = innerHeight
});
(function loop(dt) {
    tree.draw(ctx)
    requestAnimationFrame(loop)
})()