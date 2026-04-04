"use client"

import { useEffect, useRef, useState } from "react"
import KitchenPanel from "@/components/KitchenPanel"
import OrderPanel from "@/components/OrderPanel"

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
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [rice, setRice] = useState<string[]>([])
  const [opts, setOpts] = useState<any>({})
  const [qty, setQty] = useState(1)
  const [cart, setCart] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  const prevOrderCount = useRef(0)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const isSubmitting = useRef(false)

  const toggleRice = (k: string) =>
    setRice((p) => (p.includes(k) ? p.filter((i) => i !== k) : [...p, k]))

  const toggleOpt = (k: string, v: boolean) =>
    setOpts((p: any) => ({ ...p, [k]: v }))
  function addItem() {
    if (!selectedItem) return alert("選飯糰")
    if (rice.length === 0) return alert("選米")
    setCart((p) => [...p, {
      name: selectedItem.name,
      basePrice: selectedItem.price,
      quantity: qty,
      rice,
      options: opts,
    }])
    setSelectedItem(null)
    setRice([])
    setOpts({})
    setQty(1)
    leftPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }
  async function submit() {
    if (isSubmitting.current) return
    if (cart.length === 0) return
    if (selectedItem) {
      const ok = confirm("還有未加入購物車的項目，確定要直接送出嗎？")
      if (!ok) return
    }
    isSubmitting.current = true
    setSubmitting(true)
    try {
      await fetch("/api/order", { method: "POST", body: JSON.stringify({ items: cart }) })
      setCart([])
      setSelectedItem(null)
      setRice([])
      setOpts({})
      setQty(1)
      fetchOrders()
      leftPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" })
      rightPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      isSubmitting.current = false
      setSubmitting(false)
    }
  }
  async function fetchOrders() {
    const r = await fetch("/api/order")
    const data = await r.json()
    if (data.length > prevOrderCount.current) playDing()
    prevOrderCount.current = data.length
    setOrders(data)
  }

  function removeFromCart(idx: number) {
    setCart((p) => p.filter((_, i) => i !== idx))
  }

  async function clearAll() {
    const ok = confirm("確定要清空所有訂單嗎？此操作無法復原")
    if (!ok) return
    await fetch("/api/order", { method: "DELETE" })
    fetchOrders()
  }

  async function done(id: string) {
    setCancelledIds((p) => {
      const next = new Set(p)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    await fetch("/api/order", { method: "PATCH", body: JSON.stringify({ id }) })
    fetchOrders()
  }

  useEffect(() => {
    fetchOrders()
    const t = setInterval(fetchOrders, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* 左：點餐 */}
      <OrderPanel
        selectedItem={selectedItem}
        rice={rice}
        opts={opts}
        qty={qty}
        cart={cart}
        submitting={submitting}
        panelRef={leftPanelRef}
        onSelectItem={setSelectedItem}
        onToggleRice={toggleRice}
        onToggleOpt={toggleOpt}
        onQtyChange={setQty}
        onAddItem={addItem}
        onRemove={removeFromCart}
        onSubmit={submit}
      />
      {/* 右：廚房 */}
      <KitchenPanel
        orders={orders}
        cancelledIds={cancelledIds}
        onDone={done}
        onClearAll={clearAll}
        panelRef={rightPanelRef}
      />

    </div>
  )
}