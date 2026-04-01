"use client"

import { useEffect, useState } from "react"
import { menu, riceOptions, options } from "@/lib/menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export default function Page() {
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [rice, setRice] = useState<string[]>([])
  const [selectedOptions, setSelectedOptions] = useState<any>({})
  const [quantity, setQuantity] = useState(1)

  const [cart, setCart] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])

  // 米選擇
  function toggleRice(key: string) {
    setRice((prev) =>
      prev.includes(key)
        ? prev.filter((r) => r !== key)
        : [...prev, key]
    )
  }

  // 加料
  function toggleOption(key: string, value: boolean) {
    setSelectedOptions((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  // 加入清單
  function addItem() {
    if (!selectedItem) return alert("請選飯糰")
    if (rice.length === 0) return alert("請選米")

    setCart((prev) => [
      ...prev,
      {
        name: selectedItem.name,
        quantity,
        rice,
        options: selectedOptions,
      },
    ])

    setSelectedItem(null)
    setRice([])
    setSelectedOptions({})
    setQuantity(1)
  }

  // 送出整張訂單
  async function submitOrder() {
    if (cart.length === 0) return alert("沒有品項")

    await fetch("/api/order", {
      method: "POST",
      body: JSON.stringify({ items: cart }),
    })

    setCart([])
  }

  // 抓訂單
  async function fetchOrders() {
    const res = await fetch("/api/order")
    const data = await res.json()
    setOrders(data)
  }

  useEffect(() => {
    fetchOrders()
    const t = setInterval(fetchOrders, 2000)
    return () => clearInterval(t)
  }, [])

  // 完成訂單
  async function done(id: string) {
    await fetch("/api/order", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    })
  }

  function riceText(rice: string[]) {
    return rice
      .map((r) =>
        r === "white" ? "白" : r === "purple" ? "紫" : "黃"
      )
      .join("")
  }

  return (
    <div className="grid grid-cols-2 h-screen">

      {/* 左：點餐 */}
      <div className="p-6 space-y-4 border-r">
        <h1 className="text-xl font-bold">點餐</h1>

        {/* 飯糰 */}
        <div className="grid grid-cols-2 gap-2">
          {menu.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedItem(item)}
              className="border p-3 rounded"
            >
              {item.name} ${item.price}
            </button>
          ))}
        </div>

        {/* 選項 */}
        {selectedItem && (
          <>
            <h2 className="font-bold">{selectedItem.name}</h2>

            {/* 米 */}
            <div>
              <div className="font-bold">選米</div>
              <div className="flex gap-2">
                {riceOptions.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => toggleRice(r.key)}
                    className={`px-3 py-2 border rounded
                    ${rice.includes(r.key) ? "bg-black text-white" : ""}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 加料 */}
            <div>
              <div className="font-bold">加料</div>
              {options.map((opt) => (
                <label key={opt.key} className="flex gap-2">
                  <Checkbox
                    onCheckedChange={(v) =>
                      toggleOption(opt.key, !!v)
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* 數量 */}
            <div>
              <div className="font-bold">數量</div>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
                className="border px-2 py-1 w-20"
              />
            </div>

            <Button onClick={addItem}>
              加入清單
            </Button>
          </>
        )}

        {/* 清單 */}
        <div>
          <h2 className="font-bold">訂單內容</h2>

          {cart.map((item, i) => (
            <div key={i} className="border p-2 rounded mb-2">
              {item.name} x{item.quantity}（{riceText(item.rice)}）
            </div>
          ))}

          {cart.length > 0 && (
            <Button onClick={submitOrder}>
              送出整張訂單
            </Button>
          )}
        </div>
      </div>

      {/* 右：廚房 */}
      <div className="p-6 space-y-4 bg-gray-50">
        <h1 className="text-xl font-bold">廚房訂單</h1>

        {orders.map((o) => (
          <div
            key={o.id}
            className={`p-4 rounded border ${o.status === "done" ? "opacity-40" : ""
              }`}
          >
            <div className="text-2xl font-bold">
              #{o.id}
            </div>

            {o.items.map((item: any, i: number) => (
              <div key={i} className="mt-2 border-t pt-2">
                <div>
                  {item.name} x{item.quantity}
                </div>

                <div>
                  米：{riceText(item.rice)}
                </div>

                <div className="text-sm">
                  {Object.entries(item.options)
                    .filter(([_, v]) => v)
                    .map(([k]) => k)
                    .join(" / ")}
                </div>
              </div>
            ))}

            <Button onClick={() => done(o.id)}>
              完成
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}