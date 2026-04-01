let orders: any[] = []
let counter = 1

export async function GET() {
  return Response.json(orders)
}

export async function POST(req: Request) {
  const body = await req.json()

  const newOrder = {
    id: counter.toString().padStart(3, "0"),
    items: body.items,
    status: "pending",
  }

  counter++
  orders.unshift(newOrder)

  return Response.json(newOrder)
}

export async function PATCH(req: Request) {
  const { id } = await req.json()

  orders = orders.map((o) =>
    o.id === id ? { ...o, status: "done" } : o
  )

  return Response.json({ ok: true })
}