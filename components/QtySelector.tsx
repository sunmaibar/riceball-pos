import { Button } from "@/components/ui/button"

interface Props {
 qty: number
 onAdd: () => void
 onChange: (qty: number) => void
}

export default function QtySelector({ qty, onAdd, onChange }: Props) {
 return (
  <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-xl border">
   <span className="text-sm text-gray-500">數量</span>
   <div className="flex items-center gap-2 border rounded-lg bg-white overflow-hidden">
    <button
     onClick={() => onChange(Math.max(1, qty - 1))}
     className="px-3 py-2 text-lg font-bold hover:bg-gray-100 transition"
    >
     −
    </button>
    <span className="w-8 text-center font-bold">{qty}</span>
    <button
     onClick={() => onChange(qty + 1)}
     className="px-3 py-2 text-lg font-bold hover:bg-gray-100 transition"
    >
     ＋
    </button>
   </div>
   <Button onClick={onAdd} className="flex-1">加入購物車</Button>
  </div>
 )
}