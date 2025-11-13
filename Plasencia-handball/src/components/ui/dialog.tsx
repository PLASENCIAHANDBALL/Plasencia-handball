import * as React from 'react'
const C=React.createContext<any>(null)
export function Dialog({open,onOpenChange,children}:any){const [o,setO]=React.useState(!!open);React.useEffect(()=>{if(open!==undefined) setO(open)},[open]);return <C.Provider value={{open:o,setOpen:(b:boolean)=>{onOpenChange?onOpenChange(b):setO(b)}}}>{children}</C.Provider>}
export function DialogTrigger({asChild,children}:any){return children}
export function DialogContent(p:any){return <div {...p}/>}
export function DialogHeader(p:any){return <div {...p}/>}
export function DialogTitle(p:any){return <h2 {...p}/>}
