import { addOptions } from "@/lib/menu"

interface Props {
 opts: Record<string, boolean>
 onToggle: (key: string, value: boolean) => void
}

export default function AddOptions({ opts, onToggle }: Props) {
 return (
  <div className="grid grid-cols-2 gap-2">
   {addOptions.map((o) => {
    const active = !!opts[o.key]
    return (
     <button
      key={o.key}
      onClick={() => onToggle(o.key, !active)}
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
 )
}