"use client"

import { useRef } from "react"
import { menu } from "@/lib/menu"
import RiceSelector from "@/components/RiceSelector"
import AddOptions from "@/components/AddOptions"
import RemoveOptions from "@/components/RemoveOptions"
import QtySelector from "@/components/QtySelector"
import CartList from "@/components/CartList"

interface Props {
 selectedItem: any
 rice: string[]
 opts: Record<string, boolean>
 qty: number
 cart: any[]
 submitting: boolean
 panelRef: React.RefObject<HTMLDivElement | null>
 onSelectItem: (item: any) => void
 onToggleRice: (key: string) => void
 onToggleOpt: (key: string, value: boolean) => void
 onQtyChange: (qty: number) => void
 onAddItem: () => void
 onRemove: (idx: number) => void
 onSubmit: () => void
}

export default function OrderPanel({
 selectedItem, rice, opts, qty, cart, submitting, panelRef,
 onSelectItem, onToggleRice, onToggleOpt, onQtyChange, onAddItem, onRemove, onSubmit
}: Props) {
 const riceRef = useRef<HTMLDivElement>(null)

 return (
  <div ref={panelRef} className="p-6 space-y-4 border-r overflow-auto h-screen">
   <h1 className="text-xl font-bold">點餐</h1>

   <div className="grid grid-cols-2 gap-3">
    {menu.map((m) => (
     <button
      key={m.name}
      onClick={() => {
       onSelectItem(m)
       setTimeout(() => riceRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
      }}
      className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition text-left shadow-sm
              ${selectedItem?.name === m.name ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-amber-300 hover:shadow"}
              ${m.type === "indo" ? "border-l-4 border-l-red-400" : ""}`}
     >
      <span className="font-bold text-lg">{m.name}</span>
      <span className="mt-1 text-sm font-medium text-amber-600">${m.price}</span>
     </button>
    ))}
   </div>

   {selectedItem && (
    <>
     <h2 ref={riceRef} className="text-3xl bg-amber-700 text-white rounded-md py-6 flex items-center justify-center">
      {selectedItem.name}
     </h2>
     <RiceSelector rice={rice} onToggle={onToggleRice} />
     <AddOptions opts={opts} onToggle={onToggleOpt} />
     <RemoveOptions opts={opts} onToggle={onToggleOpt} />
     <QtySelector qty={qty} onChange={onQtyChange} onAdd={onAddItem} />
    </>
   )}

   <CartList
    cart={cart}
    onRemove={onRemove}
    onSubmit={onSubmit}
    submitting={submitting}
   />
  </div>
 )
}