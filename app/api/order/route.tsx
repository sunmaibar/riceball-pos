import { NextResponse } from "next/server"
// import { supabase } from "@/lib/supabase"
import { supabaseAdmin } from "@/lib/supabase"
import { addOptions } from "@/lib/menu"

// 計算總價
function calcTotal(items: any[]) {
  return items.reduce((sum, item) => {
    let price = item.basePrice
    addOptions.forEach((o: any) => {
      if (item.options[o.key]) price += o.price
    })
    return sum + price * item.quantity
  }, 0)
}
// 取得訂單
export async function GET() {
  const { data, error } = await supabaseAdmin
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

  // 查目前還有幾筆
  const { count } = await supabaseAdmin
    .from("orders")
    .select("*", { count: "exact", head: true })

  // 如果是空的從1開始，否則查最大id
  let nextId = 1
  if (count && count > 0) {
    const { data: latest } = await supabaseAdmin
      .from("orders")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)

    const lastId = latest?.[0]?.id ?? 0
    nextId = (lastId % 100) + 1
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert([{
      id: nextId,
      items: body.items,
      total: calcTotal(body.items),
      status: "pending",
    }])
    .select()

  if (error) {
    console.error("POST error:", error)
    return NextResponse.json({ ok: false })
  }
  return NextResponse.json(data)
}
// export async function POST(req: Request) {
//   const body = await req.json()

//   const { data, error } = await supabaseAdmin
//     .from("orders")
//     .insert([
//       {
//         items: body.items,
//         total: calcTotal(body.items),
//         status: "pending",
//       },
//     ])
//     .select()

//   if (error) {
//     console.error("POST error:", error)
//     return NextResponse.json({ ok: false })
//   }

//   return NextResponse.json(data)
// }

// 取消訂單
export async function PATCH(req: Request) {
  const { id } = await req.json()

  const { error } = await supabaseAdmin
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
  const { error } = await supabaseAdmin
    .from("orders")
    .delete()
    .not("id", "is", null)

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