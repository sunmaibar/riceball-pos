"use client"

import { useEffect, useRef, useState } from "react"
import {
  menu,
  riceOptions,
  addOptions,
  removeOptions,
} from "@/lib/menu"
import { Button } from "@/components/ui/button"
// import { Checkbox } from "@/components/ui/checkbox"


function cardColor(id: string) {
  const colors = [
    "bg-orange-100",
    "bg-blue-100",
    "bg-green-100",
    "bg-purple-100",
  ]
  return colors[Number(id) % colors.length]
}

function playDing() {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.frequency.value = 880
  osc.type = "sine"
  gain.gain.setValueAtTime(0.5, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.8)
}



export default function Page() {
  // ===== 狀態 =====
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [rice, setRice] = useState<string[]>([])
  const [opts, setOpts] = useState<any>({})
  const [qty, setQty] = useState(1)

  const [cart, setCart] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const riceRef = useRef<HTMLDivElement>(null)
  const prevOrderCount = useRef(0)
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set())

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
    fetchOrders() // 送出後立刻更新

  }

  async function fetchOrders() {
    const r = await fetch("/api/order")
    const data = await r.json()

    if (data.length > prevOrderCount.current) {
      playDing()
    }
    prevOrderCount.current = data.length
    setOrders(data)

  }
  function removeFromCart(idx: number) {
    setCart(p => p.filter((_, i) => i !== idx))
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

  // async function done(id: string) {
  //   await fetch("/api/order", {
  //     method: "PATCH",
  //     body: JSON.stringify({ id }),
  //   })
  // }
  async function done(id: string) {
    setCancelledIds(p => {
      const next = new Set(p)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    await fetch("/api/order", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    })
    fetchOrders()
  }
  // ===== UI =====
  return (
    <div className="grid grid-cols-2 h-screen overflow-auto">

      {/* 左：點餐 */}
      <div className="p-6 space-y-4 border-r">
        <h1 className="text-xl font-bold">點餐</h1>

        {/* 菜單 */}
        <div className="grid grid-cols-2 gap-3">
          {menu.map((m) => (
            <button
              key={m.name}
              onClick={() => {
                setSelectedItem(m)
                setTimeout(() => riceRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
              }}
              className={`
        relative flex flex-col items-start p-4 rounded-2xl border-2 transition text-left shadow-sm
        ${selectedItem?.name === m.name
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 bg-white hover:border-amber-300 hover:shadow"}
        ${m.type === "indo" ? "border-l-4 border-l-red-400" : ""}
      `}
            >
              <span className="font-bold text-lg">{m.name}</span>
              <span className="mt-1 text-sm font-medium text-amber-600">${m.price}</span>
              {m.type === "indo" && (
                <span className="absolute top-2 right-2 text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">印尼</span>
              )}
            </button>
          ))}
        </div>
        {/* <div className="grid grid-cols-2 gap-2">
          {menu.map((m) => (
            <button
              key={m.name}
              onClick={() => {
                setSelectedItem(m)
                setTimeout(() => riceRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
              }}
              // onClick={() => setSelectedItem(m)}
              className={`
              border p-3 rounded transition text-xl
              ${m.type === "indo" ? "bg-red-100" : ""}
              
            
            `}
            >
              {m.name}<span className="text-sm"> ${m.price}</span>
            </button>
          ))}
        </div> */}

        {/* 選項 */}

        {selectedItem && (
          <>



            <h2 ref={riceRef} className="text-3xl bg-amber-700 text-white rounded-md py-6 flex items-center justify-center">{selectedItem.name}</h2>



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
            <div className="grid grid-cols-2 gap-2">
              {addOptions.map((o) => {
                const active = !!opts[o.key]
                return (
                  <button
                    key={o.key}
                    onClick={() => toggleOpt(o.key, !active)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border-2 transition
          ${active ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  >
                    <span className="font-bold">{o.label}</span>
                    {o.price > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                        +{o.price}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {/* <div className="space-y-2">
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
            </div> */}

            {/* 不要料 */}
            {/* <div className="border border-red-300 rounded p-2">
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
            </div> */}
            <div className="grid grid-cols-2 gap-2">
              {removeOptions.map((o) => {
                const active = !!opts[o.key]
                return (
                  <button
                    key={o.key}
                    onClick={() => toggleOpt(o.key, !active)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition
          ${active ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 bg-white text-gray-500 hover:border-red-200"}`}
                  >
                    <span className={`text-lg ${active ? "opacity-100" : "opacity-30"}`}>🚫</span>
                    <span className="font-bold">{o.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-xl border">
              <span className="text-sm text-gray-500">數量</span>
              <div className="flex items-center gap-2 border rounded-lg bg-white overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-lg font-bold hover:bg-gray-100 transition"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="px-3 py-2 text-lg font-bold hover:bg-gray-100 transition"
                >
                  ＋
                </button>
              </div>
              <Button onClick={addItem} className="flex-1">
                加入購物車
              </Button>
            </div>
            {/* <div className="flex items-center gap-2 mt-2">
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
            </div> */}
          </>
        )}

        {/* 清單 */}

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <span className="font-bold text-gray-700">目前點了</span>
            <span className="text-sm text-gray-400">{cart.length} 項</span>
          </div>
          <div className="divide-y">
            {cart.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="font-bold">{i.name}</span>
                  <span className="ml-2 text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">x{i.quantity}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800">${itemPrice(i)}</span>
                  <button
                    onClick={() => removeFromCart(idx)}
                    className="text-gray-300 hover:text-red-400 transition text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <span className="font-bold text-gray-700">目前點了</span>
            <span className="text-sm text-gray-400">{cart.length} 項</span>
          </div>
          <div className="divide-y">
            {cart.map((i, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="font-bold">{i.name}</span>
                  <span className="ml-2 text-sm text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">x{i.quantity}</span>
                </div>
                <span className="font-bold text-gray-800">${itemPrice(i)}</span>
              </div>
            ))}
          </div>
        </div> */}



        <div>總價：${total}</div>

        <Button className="w-full text-xl py-6" onClick={submit} disabled={cart.length === 0}>送出訂單</Button>
      </div>

      {/* 右：廚房 */}
      <div className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50">
        {orders.map((o) => (
          <div
            key={o.id}
            className={`rounded-2xl shadow-sm border-2 overflow-hidden transition
        ${cardColor(o.id)}
        ${(o.status === "cancel" || cancelledIds.has(o.id)) ? "opacity-40 grayscale" : ""}`}
          >
            {/* 訂單 header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/5">
              <span className="font-black text-2xl">#{o.id}</span>
              <span className="bg-pink-500 text-white text-lg font-bold px-3 py-1 rounded-full">
                {o.items.reduce((s: number, i: any) => s + i.quantity, 0)} 顆
              </span>
            </div>

            {/* 品項 */}
            <div className="px-4 py-3 space-y-3">
              {o.items.map((i: any, idx: number) => (
                <div key={idx} className="bg-white/60 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">{i.name}</span>
                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                      x{i.quantity}
                    </span>
                    <div className="flex gap-1 ">
                      {i.rice.map((r: string) => (
                        <div key={r} className={`w-7 h-7 rounded-full border-2 border-white shadow ${riceColor(r)}`} />
                      ))}
                    </div>
                  </div>

                  {Object.entries(i.options).filter(([_, v]) => v).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(i.options)
                        .filter(([_, v]) => v)
                        .map(([k]) => {
                          const isRemove = k.startsWith("no_")
                          const label = optionLabelMap[k] ?? k
                          return (
                            <span
                              key={k}
                              className={`px-2 py-1 rounded-lg text-sm font-medium
                          ${isRemove ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                            >
                              {label}
                            </span>
                          )
                        })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/5">
              <span className="text-lg text-gray-500 font-black">${o.total}</span>
              <Button
                variant="outline"
                onClick={() => done(o.id)}
                className="rounded-xl"
              >
                完成訂單！
              </Button>
            </div>
          </div>
        ))}

        <Button variant="destructive" className="w-full rounded-xl mt-2" onClick={clearAll}>
          清空全部訂單
        </Button>
      </div>

      {/* <div className=" flex-1 overflow-auto  p-6 space-y-3">

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
                      <div key={r} className={`w-8 h-8 rounded-full  border border-gray-900 ${riceColor(r)}`} />
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
      </div> */}
    </div>
  )
}