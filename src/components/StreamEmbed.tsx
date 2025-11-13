// src/components/StreamEmbed.tsx
import React from "react";

function getYouTubeId(url?:string|null){ try{ if(!url) return null; const u=new URL(url); if(u.hostname.includes('youtu.be')) return u.pathname.slice(1); if(u.hostname.includes('youtube.com')) return u.searchParams.get('v'); }catch{} return null; }
function getTwitchChannel(url?:string|null){ try{ if(!url) return null; const u=new URL(url); if(u.hostname.includes('twitch.tv')) return u.pathname.split('/').filter(Boolean)[0]||null; }catch{} return null; }

export default function StreamEmbed({ url }:{url?:string|null}) {
  if(!url) return null;
  const yt = getYouTubeId(url); const tw = getTwitchChannel(url);
  if(yt) return (<div className="aspect-video w-full"><iframe className="w-full h-full rounded-2xl" src={`https://www.youtube.com/embed/${yt}`} allowFullScreen/></div>);
  if(tw) return (<div className="aspect-video w-full"><iframe className="w-full h-full rounded-2xl" src={`https://player.twitch.tv/?channel=${tw}&parent=${typeof window!=="undefined"?window.location.hostname:"localhost"}`} allowFullScreen/></div>);
  return (<div className="aspect-video w-full"><iframe className="w-full h-full rounded-2xl" src={url} allowFullScreen/></div>);
}
