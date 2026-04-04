"use client"

import { Button } from "@/components/ui/button"
import OrderCard from "@/components/OrderCard"

interface Props {
 orders: any[]
 cancelledIds: Set<string>
 onDone: (id: string) => void
 onClearAll: () => void
 panelRef: React.RefObject<HTMLDivElement | null>  // 加 | null
}

export default function KitchenPanel({ orders, cancelledIds, onDone, onClearAll, panelRef }: Props) {
 return (
  <div ref={panelRef} className="flex-1 overflow-auto p-6 space-y-4 bg-gray-50 h-screen">
   {orders.map((o) => (
    <OrderCard
     key={o.id}
     order={o}
     isCancelled={o.status === "cancel" || cancelledIds.has(o.id)}
     onDone={onDone}
    />
   ))}

   <Button variant="destructive" className="w-full rounded-xl mt-2" onClick={onClearAll}>
    清空全部訂單
   </Button>
  </div>
 )
}