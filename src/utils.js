import { BoundingBox } from "../chaos.module.js"

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {BoundingBox} bounds
 */
export function renderObj(ctx, bounds) {
  const w = (bounds.max.x - bounds.min.x)
  const h = (bounds.max.y - bounds.min.y)
  ctx.strokeRect(
    bounds.min.x,
    bounds.min.y,
    w,
    h
  )
}