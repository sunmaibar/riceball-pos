import { riceOptions } from "@/lib/menu"

interface Props {
 rice: string[]
 onToggle: (key: string) => void
}

function riceColor(r: string) {
 return r === "white" ? "bg-gray-200" : r === "purple" ? "bg-purple-500" : "bg-yellow-400"
}

export default function RiceSelector({ rice, onToggle }: Props) {
 return (
  <div className="flex gap-2">
   {riceOptions.map((r) => {
    const active = rice.includes(r.key)
    return (
     <button
      key={r.key}
      onClick={() => onToggle(r.key)}
      className={`flex items-center w-30 gap-2 px-3 py-2 rounded border transition
              ${active ? "bg-black text-white border-black" : "bg-white"}`}
     >
      <div className={`w-3 h-3 rounded ${riceColor(r.key)}`} />
      {r.label}米
     </button>
    )
   })}
  </div>
 )
}