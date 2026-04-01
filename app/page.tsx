"use client"

import { useEffect, useState } from "react"
import {
  menu,
  riceOptions,
  addOptions,
  removeOptions,
} from "@/lib/menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
function cardColor(id: string) {
  const colors = [
    "bg-orange-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-purple-100",
  ]
  return colors[Number(id) % colors.length]
}



export default function Page() {
  // ===== 狀態 =====
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [rice, setRice] = useState<string[]>([])
  const [opts, setOpts] = useState<any>({})
  const [qty, setQty] = useState(1)

  const [cart, setCart] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

  // ===== 工具 =====
  const toggleRice = (k: string) =>
    setRice((p) => (p.includes(k) ? p.filter(i => i !== k) : [...p, k]))

  const toggleOpt = (k: string, v: boolean) =>
    setOpts((p: any) => ({ ...p, [k]: v }))

  const riceColor = (r: string) =>
    r === "white"
      ? "bg-gray-200"
      : r === "purple"
        ? "bg-purple-500"
        : "bg-yellow-400"

  const itemPrice = (i: any) => {
    let p = i.basePrice
    if (i.options.large) p += 10
    if (i.options.egg) p += 10
    return p * i.quantity
  }

  const total = cart.reduce((s, i) => s + itemPrice(i), 0)
  // 建一個 key → label 的 map，方便查詢
  const optionLabelMap = Object.fromEntries(
    [...removeOptions, ...addOptions].map(({ key, label }) => [key, label])
  )

  // ===== 動作 =====
  function addItem() {
    if (!selectedItem) return alert("選飯糰")
    if (rice.length === 0) return alert("選米")

    setCart((p) => [
      ...p,
      {
        name: selectedItem.name,
        basePrice: selectedItem.price,
        quantity: qty,
        rice,
        options: opts,
      },
    ])

    setSelectedItem(null)
    setRice([])
    setOpts({})
    setQty(1)
  }

  async function submit() {
    await fetch("/api/order", {
      method: "POST",
      body: JSON.stringify({ items: cart }),
    })
    setCart([])
  }

  async function fetchOrders() {
    const r = await fetch("/api/order")
    setOrders(await r.json())
  }
  async function clearAll() {
    const ok = confirm("確定要清空所有訂單嗎？此操作無法復原")

    if (!ok) return

    await fetch("/api/order", {
      method: "DELETE",
    })

    fetchOrders() // 重新抓
  }

  useEffect(() => {
    fetchOrders()
    const t = setInterval(fetchOrders, 2000)
    return () => clearInterval(t)
  }, [])

  async function done(id: string) {
    await fetch("/api/order", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    })
  }

  // ===== UI =====
  return (
    <div className="grid grid-cols-2 h-screen">

      {/* 左：點餐 */}
      <div className="p-6 space-y-4 border-r">
        <h1 className="text-xl font-bold">點餐</h1>

        {/* 菜單 */}
        <div className="grid grid-cols-2 gap-2">
          {menu.map((m) => (
            <button
              key={m.name}
              onClick={() => setSelectedItem(m)}
              className={`
              border p-3 rounded transition text-2xl
              ${m.type === "indo" ? "bg-red-100" : ""}
              
            
            `}
            >
              {m.name}<span className="text-sm"> ${m.price}</span>
            </button>
          ))}
        </div>

        {/* 選項 */}
        {selectedItem && (
          <>
            <h2 className="text-3xl bg-amber-700 text-white rounded-md py-6 flex items-center justify-center">{selectedItem.name}</h2>

            {/* 米 */}
            <div className="flex gap-2 ">
              {riceOptions.map((r) => {
                const active = rice.includes(r.key)

                return (
                  <button
                    key={r.key}
                    onClick={() => toggleRice(r.key)}
                    className={`
          flex items-center w-30 gap-2 px-3 py-2 rounded border transition
          ${active ? "bg-black text-white border-black" : "bg-white"}
        `}
                  >
                    <div className={`w-3 h-3 rounded ${riceColor(r.key)}`} />
                    {r.label}米
                  </button>
                )
              })}
            </div>

            {/* 加料 */}
            <div className="space-y-2">
              {addOptions.map((o) => (
                <label key={o.key} className="flex items-center gap-2">
                  <Checkbox
                    onCheckedChange={(v) => toggleOpt(o.key, !!v)}
                  />
                  <span className="text-lg font-bold">
                    {o.label} (+{o.price})
                  </span>
                </label>
              ))}
            </div>

            {/* 不要料 */}
            <div className="border border-red-300 rounded p-2">
              <div className="text-red-500 font-bold mb-1">
                不要料
              </div>

              <div className="space-y-1">
                {removeOptions.map((o) => (
                  <label
                    key={o.key}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <Checkbox
                      onCheckedChange={(v) => toggleOpt(o.key, !!v)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={qty}
                min={1}
                onChange={(e) => setQty(Number(e.target.value))}
                className="border p-1 w-20"
              />

              <Button onClick={addItem}>
                加入
              </Button>
            </div>
          </>
        )}

        {/* 清單 */}
        {cart.map((i, idx) => (
          <div key={idx}>
            {i.name} x{i.quantity} ${itemPrice(i)}
          </div>
        ))}

        <div>總價：${total}</div>

        <Button onClick={submit} disabled={cart.length === 0}>送出</Button>
      </div>

      {/* 右：廚房 */}
      <div className=" flex-1 overflow-auto  p-6 space-y-3">

        {orders.map((o) => (
          <div key={o.id} className={`border p-3 rounded ${cardColor(o.id)} ${o.status === "cancel" ? "opacity-40 grayscale" : ""}`}>

            <div className="flex justify-between">
              <div className="text-xl font-bold">
                #{o.id}
              </div>

              <div>
                總數量：<span className="text-2xl bg-red-100">{o.items.reduce((s: number, i: any) => s + i.quantity, 0)} </span>     顆         </div>
            </div>

            {o.items.map((i: any, idx: number) => (
              <div key={idx} className="mt-2">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold">{i.name} <span className="text-muted-foreground">x {i.quantity}</span></div>

                  <div className="flex gap-1">
                    {i.rice.map((r: string) => (
                      <div key={r} className={`w-5 h-5 rounded-full ${riceColor(r)}`} />
                    ))}

                  </div>


                </div>
                <div className="flex flex-wrap gap-1 mt-1 text-xs">
                  {Object.entries(i.options)
                    .filter(([_, v]) => v)
                    .map(([k]) => {
                      const isRemove = k.startsWith("no_")
                      const label = optionLabelMap[k] ?? k // 找不到就 fallback 顯示 key

                      return (
                        <span
                          key={k}
                          className={`px-2 py-1 rounded text-xl ${isRemove ? "bg-red-200" : "bg-green-200"}`}
                        >
                          {label}
                        </span>
                      )
                    })}
                </div>
                {/* <div className="flex flex-wrap gap-1 mt-1 text-xs">
                  {Object.entries(i.options)
                    .filter(([_, v]) => v)
                    .map(([k]) => {
                      const isRemove = k.startsWith("no_")

                      return (
                        <span
                          key={k}
                          className={`px-2 py-1 rounded
            ${isRemove ? "bg-red-200" : "bg-green-200"}
          `}
                        >
                          {isRemove ? "不要" : "加"} {k.replace("no_", "")}
                        </span>
                      )
                    })}
                </div> */}
              </div>
            ))}


            <div className="font-bold text-2xl my-6">${o.total}</div>

            <Button onClick={() => done(o.id)}>取消</Button>
          </div>
        ))}
        <Button
          variant="destructive"
          className="w-full mt-4"
          onClick={clearAll}
        >
          清空全部訂單
        </Button>
      </div>
    </div>
  )
}