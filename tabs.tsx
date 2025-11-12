import * as React from 'react'
const C=React.createContext<any>(null)
export function Tabs({defaultValue,children, className=''}:any){const [v,setV]=React.useState(defaultValue);return <div className={className}><C.Provider value={{v,setV}}>{children}</C.Provider></div>}
export function TabsList(p:any){return <div {...p}/>}export function TabsTrigger({value,children,...p}:any){const c=React.useContext(C);const active=c.v===value;return <button onClick={()=>c.setV(value)} {...p}>{children}</button>}export function TabsContent({value,children}:any){const c=React.useContext(C);if(c.v!==value) return null;return <div>{children}</div>}
