import * as React from 'react'
export const Input = React.forwardRef((props:any, ref:any) => <input ref={ref} {...props} />)
