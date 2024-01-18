export function renderObj(ctx, client) {
  const w = (client.bounds.max.x - client.bounds.min.x)
  const h = (client.bounds.max.y - client.bounds.min.y)
  ctx.strokeRect(
    client.bounds.min.x,
    client.bounds.min.y,
    w,
    h
  )
}