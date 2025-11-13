import React from 'react'
export default function MatchesTable({matches,teamsById}:{matches:any[], teamsById:any}){ return (<div>{matches.map(m=> <div key={m.id} className='p-3 border rounded mb-2'><div className='text-sm text-slate-600'>{new Date(m.datetime).toLocaleString()}</div><div className='font-medium'>{teamsById[m.a]?.name} vs {teamsById[m.b]?.name}</div></div>)}</div>)}
