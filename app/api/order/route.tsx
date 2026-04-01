import { NextResponse } from "next/server"

let orders: any[] = []
let counter = 1

function calcTotal(items: any[]) {
  return items.reduce((sum, item) => {
    let price = item.basePrice

    if (item.options.large) price += 10
    if (item.options.egg) price += 10

    return sum + price * item.quantity
  }, 0)
}

export async function GET() {
  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const body = await req.json()

  const newOrder = {
    id: counter.toString().padStart(3, "0"),
    items: body.items,
    total: calcTotal(body.items),
    status: "pending",
  }

  counter++
  orders.unshift(newOrder)

  return NextResponse.json(newOrder)
}

export async function PATCH(req: Request) {
  const { id } = await req.json()

  orders = orders.map((o) =>
    o.id === id ? { ...o, status: "cancel" } : o
  )

  return NextResponse.json({ ok: true })
}
export async function DELETE() {
  orders = []
  counter = 1 //（可選）重置單號

  return NextResponse.json({ ok: true })
}