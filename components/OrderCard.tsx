import { Button } from "@/components/ui/button"
import { addOptions, removeOptions } from "@/lib/menu"

interface Props {
 order: any
 isCancelled: boolean
 onDone: (id: string) => void
}

const optionLabelMap = Object.fromEntries(
 [...removeOptions, ...addOptions].map(({ key, label }) => [key, label])
)

function cardColor(id: string) {
 const colors = ["bg-orange-100", "bg-blue-100", "bg-green-100", "bg-purple-100"]
 return colors[Number(id) % colors.length]
}

function riceColor(r: string) {
 return r === "white" ? "bg-gray-200" : r === "purple" ? "bg-purple-500" : "bg-yellow-400"
}

export default function OrderCard({ order: o, isCancelled, onDone }: Props) {
 return (
  <div className={`rounded-2xl shadow-sm border-2 overflow-hidden transition
      ${cardColor(o.id)}
      ${isCancelled ? "opacity-40 grayscale" : ""}`}
  >
   <div className="flex items-center justify-between px-4 py-3 bg-black/5">
    <span className="font-black text-2xl">#{o.id}</span>
    <span className="bg-pink-500 text-white text-lg font-bold px-3 py-1 rounded-full">
     {o.items.reduce((s: number, i: any) => s + i.quantity, 0)} 顆
    </span>
   </div>

   <div className="px-4 py-3 space-y-3">
    {o.items.map((i: any, idx: number) => (
     <div key={idx} className="bg-white/60 rounded-xl p-3">
      <div className="flex items-center gap-3">
       <span className="text-xl font-bold">{i.name}</span>
       <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
        x{i.quantity}
       </span>
       <div className="flex gap-1">
        {i.rice.map((r: string) => (
         <div key={r} className={`w-7 h-7 rounded-full border-2 border-white shadow ${riceColor(r)}`} />
        ))}
       </div>
      </div>

      {Object.entries(i.options).filter(([_, v]) => v).length > 0 && (
       <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(i.options).filter(([_, v]) => v).map(([k]) => {
         const isRemove = k.startsWith("no_")
         const label = optionLabelMap[k] ?? k
         return (
          <span key={k} className={`px-2 py-1 rounded-lg text-sm font-medium
                      ${isRemove ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
           {label}
          </span>
         )
        })}
       </div>
      )}
     </div>
    ))}
   </div>

   <div className="flex items-center justify-between px-4 py-3 bg-black/5">
    <span className="text-lg text-gray-500 font-black">${o.total}</span>
    <Button variant="outline" onClick={() => onDone(o.id)} className="rounded-xl">
     {isCancelled ? "恢復訂單" : "完成訂單！"}
    </Button>
   </div>
  </div>
 )
}