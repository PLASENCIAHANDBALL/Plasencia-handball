// src/components/PasswordChanger.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function PasswordChanger({ onChangePassword }:{onChangePassword:(c:string,n:string,cf:string)=>void}) {
  const [cur,setCur]=useState(""); const [next,setNext]=useState(""); const [confirm,setConfirm]=useState("");
  return (
    <div className="space-y-2">
      <Label>Contraseña actual</Label><Input type="password" value={cur} onChange={e=>setCur(e.target.value)} placeholder="••••••••"/>
      <Label>Nueva contraseña</Label><Input type="password" value={next} onChange={e=>setNext(e.target.value)} placeholder="Mín. 10 caracteres con Aa1!"/>
      <Label>Confirmar nueva contraseña</Label><Input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repetir"/>
      <div className="flex justify-end"><Button onClick={()=>onChangePassword(cur,next,confirm)}>Cambiar contraseña</Button></div>
    </div>
  );
}
