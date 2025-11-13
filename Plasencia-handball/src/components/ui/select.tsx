import * as React from 'react'
const C=React.createContext<any>(null)
export function Select({value,onValueChange,children}:any){const [open,setOpen]=React.useState(false);return <C.Provider value={{value,onValueChange,open,setOpen}}>{children}</C.Provider>}
export function SelectTrigger(p:any){return <button {...p}/>}
export function SelectValue({placeholder}:any){const c=React.useContext(C);return <span>{c.value||placeholder}</span>}
export function SelectContent(p:any){const c=React.useContext(C);if(!c.open) return null;return <div {...p}/>} 
export function SelectItem({value,children}:any){ if(value==='') throw new Error('SelectItem value must not be empty string'); const c=React.useContext(C); return <div onClick={()=>{c.onValueChange&&c.onValueChange(value);c.setOpen(false)}}>{children}</div>}
