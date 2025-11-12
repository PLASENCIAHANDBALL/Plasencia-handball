import * as React from 'react'
const C=React.createContext<any>(null)
export function Select({value,onValueChange,children}:any){return <div>{children}</div>}export function SelectTrigger(p:any){return <button {...p}/>}export function SelectValue(p:any){return <span {...p}/>}export function SelectContent(p:any){return <div {...p}/>}export function SelectItem({value,children}:any){if(value==='') throw new Error('SelectItem value must not be empty string');return <div onClick={()=>{}}>{children}</div>}
