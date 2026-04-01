import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// 計算總價
function calcTotal(items: any[]) {
  return items.reduce((sum, item) => {
    let price = item.basePrice

    if (item.options.large) price += 10
    if (item.options.egg) price += 10

    return sum + price * item.quantity
  }, 0)
}

// 取得訂單
export async function GET() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("GET error:", error)
    return NextResponse.json([])
  }

  return NextResponse.json(data ?? [])
}

// 新增訂單
export async function POST(req: Request) {
  const body = await req.json()

  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        items: body.items,
        total: calcTotal(body.items),
        status: "pending",
      },
    ])
    .select()

  if (error) {
    console.error("POST error:", error)
    return NextResponse.json({ ok: false })
  }

  return NextResponse.json(data)
}

// 取消訂單
export async function PATCH(req: Request) {
  const { id } = await req.json()

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancel" })
    .eq("id", id)

  if (error) {
    console.error("PATCH error:", error)
  }

  return NextResponse.json({ ok: true })
}

// 清空全部訂單
export async function DELETE() {
  const { error } = await supabase.rpc("truncate_orders")

  if (error) {
    console.error("DELETE error:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
// import { NextResponse } from "next/server"

// let orders: any[] = []
// let counter = 1

// function calcTotal(items: any[]) {
//   return items.reduce((sum, item) => {
//     let price = item.basePrice

//     if (item.options.large) price += 10
//     if (item.options.egg) price += 10

//     return sum + price * item.quantity
//   }, 0)
// }

// export async function GET() {
//   return NextResponse.json(orders)
// }

// export async function POST(req: Request) {
//   const body = await req.json()

//   const newOrder = {
//     id: counter.toString().padStart(3, "0"),
//     items: body.items,
//     total: calcTotal(body.items),
//     status: "pending",
//   }

//   counter++
//   orders.unshift(newOrder)

//   return NextResponse.json(newOrder)
// }

// export async function PATCH(req: Request) {
//   const { id } = await req.json()

//   orders = orders.map((o) =>
//     o.id === id ? { ...o, status: "cancel" } : o
//   )

//   return NextResponse.json({ ok: true })
// }
// export async function DELETE() {
//   orders = []
//   counter = 1 //（可選）重置單號

//   return NextResponse.json({ ok: true })
// }