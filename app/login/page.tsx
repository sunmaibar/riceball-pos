"use client"

import { useState } from "react"

export default function Login() {
 const [pwd, setPwd] = useState("")

 function login() {
  if (pwd === "1234") {
   document.cookie = "auth=ok; path=/"
   location.href = "/"
  } else {
   alert("密碼錯誤")
  }
 }

 return (
  <div className="h-screen flex items-center justify-center">
   <div className="p-6 border rounded space-y-3">
    <h1 className="text-xl font-bold">員工登入</h1>

    <input
     type="password"
     value={pwd}
     onChange={(e) => setPwd(e.target.value)}
     className="border p-2"
    />

    <button
     onClick={login}
     className="bg-black text-white px-4 py-2"
    >
     登入
    </button>
   </div>
  </div>
 )
}