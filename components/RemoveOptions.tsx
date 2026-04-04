import { removeOptions } from "@/lib/menu"

interface Props {
 opts: Record<string, boolean>
 onToggle: (key: string, value: boolean) => void
}

export default function RemoveOptions({ opts, onToggle }: Props) {
 return (
  <div className="grid grid-cols-2 gap-2">
   {removeOptions.map((o) => {
    const active = !!opts[o.key]
    return (
     <button
      key={o.key}
      onClick={() => onToggle(o.key, !active)}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition
              ${active ? "border-red-500 bg-red-50 text-red-600" : "border-gray-200 bg-white text-gray-500 hover:border-red-200"}`}
     >
      <span className={`text-lg ${active ? "opacity-100" : "opacity-30"}`}>🚫</span>
      <span className="font-bold">{o.label}</span>
     </button>
    )
   })}
  </div>
 )
}