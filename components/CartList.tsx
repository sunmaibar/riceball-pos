"use client"
import { Button } from "@/components/ui/button"
import { addOptions } from "@/lib/menu"
import { useEffect, useState } from "react"

interface CartItem {
 name: string
 basePrice: number
 quantity: number
 rice: string[]
 options: Record<string, boolean>
}

interface Props {
 cart: CartItem[]
 onRemove: (idx: number) => void
 onSubmit: () => void
 submitting: boolean
}

function itemPrice(i: CartItem) {
 let p = i.basePrice
 addOptions.forEach((o) => { if (i.options[o.key]) p += o.price })
 return p * i.quantity
}

export default function CartList({ cart, onRemove, onSubmit, submitting }: Props) {
 const [mounted, setMounted] = useState(false)

 useEffect(() => {
  setMounted(true)
 }, [])
 const total = cart.reduce((s, i) => s + itemPrice(i), 0)

 return (
  <>
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
         onClick={() => onRemove(idx)}
         className="text-gray-300 hover:text-red-400 transition text-xl leading-none"
        >
         ✕
        </button>
       </div>
      </div>
     ))}
    </div>
   </div>

   <div>總價：${total}</div>

   <Button
    className="w-full text-xl py-6"
    onClick={onSubmit}
    disabled={!mounted || submitting || cart.length === 0}
   >
    {submitting ? "送出中..." : "送出訂單"}
   </Button>
  </>
 )
}