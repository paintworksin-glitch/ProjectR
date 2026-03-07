import { useState, useEffect, useRef, Component } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL      = "https://thgnziutmpmnsrkjoext.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ256aXV0bXBtbnNya2pvZXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTUwOTcsImV4cCI6MjA4ODA5MTA5N30.SYLiGFgGChnibmEP5RQVmJzlfr_nBDpJJCOmTCZgZ9Y";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const G = `
 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fraunces:ital,wght@0,700;0,800;1,700&display=swap');
 *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 html { scroll-behavior: smooth; }
 body { font-family: 'Inter', sans-serif; background: #fff8f4; color: #1a1410; overflow-x: hidden; }
 input, select, textarea, button { font-family: inherit; }
 :root {
   --primary: #FF6B00; --primary2: #E55E00; --primary-light: #fff3ea; --primary-mid: #ffd4b0;
   --navy: #1a1410; --navy2: #2d2118; --green: #FF6B00; --green2: #E55E00;
   --green-light: #fff3ea; --green-mid: #ffd4b0; --cream: #fff8f4;
   --white: #FFFFFF; --gray: #f5f0ec; --border: #ede5dc; --text: #1a1410;
   --muted: #78716c; --shadow: 0 1px 3px rgba(255,107,0,0.06),0 4px 16px rgba(255,107,0,0.08);
   --shadow-lg: 0 8px 16px rgba(255,107,0,0.08),0 24px 48px rgba(255,107,0,0.14);
 }
 .card { background: var(--white); border-radius: 20px; border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: all 0.25s ease; }
 .card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
 .card-flat { background: var(--white); border-radius: 14px; border: 1px solid var(--border); }
 .inp { background: var(--white); border: 1.5px solid var(--border); color: var(--text); border-radius: 10px; padding: 10px 13px; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; font-family: inherit; }
 .inp::placeholder { color: var(--muted); }
 .inp:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(255,107,0,0.12); }
 .inp option { background: #fff; color: var(--text); }
 .btn-primary { background: var(--primary); color: #fff; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s; font-family: inherit; box-shadow: 0 4px 14px rgba(255,107,0,0.3); }
 .btn-primary:hover:not(:disabled) { background: var(--primary2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,107,0,0.4); }
 .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
 .btn-green { background: var(--primary); color: #fff; border: none; cursor: pointer; font-weight: 700; transition: all 0.2s; font-family: inherit; box-shadow: 0 4px 14px rgba(255,107,0,0.3); }
 .btn-green:hover { background: var(--primary2); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,107,0,0.4); }
 .btn-outline { background: transparent; border: 2px solid var(--border); color: var(--text); cursor: pointer; font-weight: 700; transition: all 0.2s; font-family: inherit; }
 .btn-outline:hover { border-color: var(--primary); color: var(--primary); }
 .btn-ghost { background: var(--gray); border: 1.5px solid var(--border); color: var(--muted); cursor: pointer; font-weight: 600; transition: all 0.2s; font-family: inherit; }
 .btn-ghost:hover { background: var(--border); color: var(--text); }
 .btn-danger { background: #FEF2F2; border: 1.5px solid #FECACA; color: #DC2626; cursor: pointer; font-weight: 600; transition: all 0.2s; font-family: inherit; }
 .btn-danger:hover { background: #FEE2E2; }
 .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.2px; display: inline-block; }
 .tag { background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-mid); }
 .tag-navy { background: rgba(26,20,16,0.06); color: var(--navy); border: 1px solid rgba(26,20,16,0.12); }
 .section-label { font-size: 12px; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; display: block; }
 @keyframes shiny-sweep { 0%{background-position:200% center} 100%{background-position:-200% center} }
 @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
 .shiny-text { display: inline-block; }
 @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
 @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
 @keyframes fadeIn { from{opacity:0} to{opacity:1} }
 @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
 @keyframes spin { to { transform: rotate(360deg); } }
 .af{animation:float 5s ease-in-out infinite} .asl{animation:slideUp 0.4s ease forwards}
 .afd{animation:fadeIn 0.3s ease forwards} .shk{animation:shake 0.4s ease}
 .spin{animation:spin 0.8s linear infinite; display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%;}
 ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:var(--gray)} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
 @media print {
   body > * { display:none !important; }
   #pdf-print-area { display:block !important; position:static !important; width:100% !important; padding:32px !important; box-sizing:border-box !important; }
   #pdf-print-area * { visibility:visible !important; }
 }
 @media(max-width:768px){.hm{display:none!important}.gr{grid-template-columns:1fr!important}.gr3{grid-template-columns:1fr!important}.mob-nav{display:flex!important}}
 @media(max-width:640px){.h1big{font-size:32px!important}}
`;

const ShinyText = ({text, color="#b5b5b5", shineColor="#ffffff", speed=2, spread=120, direction="left", disabled=false, className=""}) => {
const animDuration = `${speed}s`;
const gradAngle = direction==="left" ? "90deg" : "-90deg";
const style = disabled ? {color} : {
display:"inline-block",
backgroundImage:`linear-gradient(${gradAngle}, ${color} 0%, ${color} calc(50% - ${spread/2}px), ${shineColor} 50%, ${color} calc(50% + ${spread/2}px), ${color} 100%)`,
backgroundSize:"200% auto",
WebkitBackgroundClip:"text",
WebkitTextFillColor:"transparent",
backgroundClip:"text",
animation:`shiny-sweep ${animDuration} linear infinite`,
};
return <span className={`shiny-text ${className}`} style={style}>{text}</span>;
};

const fmtP = (p) => { if(!p) return "POA"; const n=Number(p); if(n>=10000000) return `₹${(n/10000000).toFixed(2)} Cr`; if(n>=100000) return `₹${(n/100000).toFixed(2)} L`; return `₹${n.toLocaleString("en-IN")}`; };
const simScore = (a="",b="") => { a=a.toLowerCase().trim(); b=b.toLowerCase().trim(); if(!a||!b) return 0; const sa=new Set(a.split(/\s+/)),sb=new Set(b.split(/\s+/)); return [...sa].filter(x=>sb.has(x)).length/Math.max(sa.size,sb.size); };
const findDups = (form, all, editId) => all.filter(l => {
if(l.id===editId) return false;
const ts=simScore(form.title,l.title), ls=simScore(form.location,l.location);
const pm=form.price&&l.price&&Math.abs(Number(form.price)-Number(l.price))/Number(l.price)<0.1;
const dm=form.bedrooms&&l.bedrooms&&String(form.bedrooms)===String(l.bedrooms)&&form.propertyType===l.propertyType;
return (ts>0.6?2:0)+(ls>0.7?2:0)+(pm?1:0)+(dm?1:0)>=3;
});

const mapListing = (l) => !l ? null : ({
id: l.id, agentId: l.agent_id, title: l.title, location: l.location,
propertyType: l.property_type, listingType: l.listing_type,
price: l.price, sizesqft: l.size_sqft, bedrooms: l.bedrooms, bathrooms: l.bathrooms,
furnishingStatus: l.furnishing_status, status: l.status,
description: l.description, highlights: l.highlights || [],
agentName: l.agent_name, agentPhone: l.agent_phone, agentEmail: l.agent_email,
agencyName: l.agency_name, photos: l.photos || [], createdAt: l.created_at,
...(l.details || {}),
logoUrl: l.details?.logoUrl || null,
agentAddress: l.details?.agentAddress || null,
agentWebsite: l.details?.agentWebsite || null,
viewCount: l.view_count||0,
waCount: l.wa_count||0,
pdfCount: l.pdf_count||0,
});
const formToDb = (form, agentId) => ({
agent_id: agentId, title: form.title, location: form.location,
property_type: form.propertyType, listing_type: form.listingType,
price: Number(form.price) || 0, size_sqft: Number(form.sizesqft) || null,
bedrooms: Number(form.bedrooms) || 0, bathrooms: Number(form.bathrooms) || 0,
furnishing_status: form.furnishingStatus, status: form.status || "Active",
description: form.description, highlights: form.highlights || [],
agent_name: form.agentName, agent_phone: form.agentPhone,
agent_email: form.agentEmail, agency_name: form.agencyName,
photos: form.photos || [],
details: { toilets:form.toilets, condition:form.condition, builtYear:form.builtYear,
modernKitchen:form.modernKitchen, wcType:form.wcType, superBuiltUp:form.superBuiltUp,
carpetArea:form.carpetArea, parkingType:form.parkingType, vastuDirection:form.vastuDirection,
totalFloors:form.totalFloors, propertyFloor:form.propertyFloor, maintenance:form.maintenance,
societyFormed:form.societyFormed, ocReceived:form.ocReceived,
reraRegistered:form.reraRegistered, reraNumber:form.reraNumber,
logoUrl:form.logoUrl||null, agentAddress:form.agentAddress||null, agentWebsite:form.agentWebsite||null }
});
const dbToForm = (l) => ({
...l.details, title:l.title, location:l.location, propertyType:l.property_type,
listingType:l.listing_type, price:l.price, sizesqft:l.size_sqft,
bedrooms:l.bedrooms, bathrooms:l.bathrooms, furnishingStatus:l.furnishing_status,
status:l.status, description:l.description, highlights:l.highlights||[],
agentName:l.agent_name, agentPhone:l.agent_phone, agentEmail:l.agent_email,
agencyName:l.agency_name, photos:l.photos||[]
});

const uploadPhoto = async (file) => {
const ext = file.name.split(".").pop().toLowerCase() || "jpg";
const name = `${Date.now()}-${Math.random().toString(36).substr(2,7)}.${ext}`;
const { error } = await supabase.storage.from("property-photos").upload(name, file, { contentType: file.type, upsert: false });
if (error) throw error;
const { data } = supabase.storage.from("property-photos").getPublicUrl(name);
return data.publicUrl;
};

const _h = { openWA: ()=>{}, openPDF: ()=>{} };
const showWACard = (l) => _h.openWA(l);
const showPDF    = (l) => _h.openPDF(l);

const track = (listingId, type) => {
if(!listingId) return;
const col = type==="view"?"view_count":type==="wa"?"wa_count":"pdf_count";
supabase.rpc("increment_count",{row_id:listingId,col_name:col}).then(({error})=>{
if(error){
supabase.from("listings").select(col).eq("id",listingId).single().then(({data})=>{
if(data) supabase.from("listings").update({[col]:(data[col]||0)+1}).eq("id",listingId);
});
}
});
};

const WALogo = ({size=16}) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" style={{flexShrink:0}}>
<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
</svg>
);

const Toast = ({msg,type,onClose}) => (
<div className="asl" style={{position:"fixed",bottom:28,right:28,zIndex:9999,padding:"13px 18px",borderRadius:12,display:"flex",alignItems:"center",gap:10,maxWidth:340,fontSize:14,fontWeight:600,boxShadow:"0 8px 32px rgba(27,58,45,0.18)",background:type==="error"?"#FEF2F2":type==="success"?"#ECFDF5":"#EFF6FF",border:`1.5px solid ${type==="error"?"#FCA5A5":type==="success"?"#6EE7B7":"#BFDBFE"}`,color:type==="error"?"#DC2626":type==="success"?"#059669":"#1D4ED8"}}>
<span>{type==="error"?"⚠️":type==="success"?"✅":"ℹ️"}</span>
<span style={{flex:1}}>{msg}</span>
<button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,opacity:0.5}}>×</button>
</div>
);

const ConfirmModal = ({message,onConfirm,onCancel}) => (
<div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.45)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
<div className="card asl" style={{padding:28,maxWidth:360,width:"100%"}}>
<div style={{textAlign:"center",marginBottom:20}}>
<div style={{width:46,height:46,borderRadius:"50%",background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:22}}>🗑️</div>
<h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:700,color:"var(--navy)",marginBottom:6}}>Delete Listing</h3>
<p style={{fontSize:13,color:"var(--muted)"}}>{message}</p>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<button onClick={onCancel} className="btn-ghost" style={{padding:"10px",borderRadius:9,fontSize:14}}>Cancel</button>
<button onClick={onConfirm} className="btn-danger" style={{padding:"10px",borderRadius:9,fontSize:14}}>Yes, Delete</button>
</div>
</div>
</div>
);

const DupModal = ({dups,onProceed,onCancel}) => (
<div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.4)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
<div className="card asl" style={{padding:32,maxWidth:500,width:"100%",boxShadow:"0 24px 80px rgba(27,58,45,0.2)"}}>
<div style={{textAlign:"center",marginBottom:22}}>
<div style={{width:52,height:52,borderRadius:"50%",background:"#FEF3C7",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24}}>⚠️</div>
<h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:7}}>Possible Duplicate Detected</h2>
<p style={{fontSize:14,color:"var(--muted)",lineHeight:1.6}}>We found {dups.length} similar listing{dups.length>1?"s":""} already on the platform. Please review before saving.</p>
</div>
<div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22,maxHeight:200,overflow:"auto"}}>
{dups.map(d=>(
<div key={d.id} className="card-flat" style={{padding:"12px 14px"}}>
<div style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:2}}>{d.title}</div>
<div style={{fontSize:12,color:"var(--muted)"}}>📍 {d.location} · <strong style={{color:"var(--green)"}}>{fmtP(d.price)}</strong> · by {d.agentName}</div>
</div>
))}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<button onClick={onCancel} className="btn-ghost" style={{padding:"11px",borderRadius:10,fontSize:14}}>← Go Back</button>
<button onClick={onProceed} className="btn-primary" style={{padding:"11px",borderRadius:10,fontSize:14}}>Save Anyway</button>
</div>
</div>
</div>
);

const PropCard = ({listing,currentUser,savedIds,onSave,onView}) => {
const isSaved = savedIds?.includes(listing.id);
const statusColor = listing.status==="Active"?"#059669":listing.status==="Rented"?"#D97706":"#7C3AED";
const statusBg = listing.status==="Active"?"#ECFDF5":listing.status==="Rented"?"#FFFBEB":"#F5F3FF";
return (
<div className="card" style={{overflow:"hidden"}}>
<div style={{height:195,position:"relative",background:"linear-gradient(135deg,#E8F5EE,#C2E8D4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
{listing.photos?.[0] ? <img src={listing.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <div style={{fontSize:48,opacity:0.4}}>🏠</div>}
<div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(27,58,45,0.5) 0%,transparent 55%)"}} />
<div style={{position:"absolute",top:12,left:12}}>
<span className="badge" style={{background:listing.listingType==="Rent"?"#FFFBEB":"#ECFDF5",color:listing.listingType==="Rent"?"#B45309":"#059669",border:`1px solid ${listing.listingType==="Rent"?"#FDE68A":"#A7F3D0"}`}}>{listing.listingType}</span>
</div>
<div style={{position:"absolute",top:12,right:12}}>
<span className="badge" style={{background:statusBg,color:statusColor,border:`1px solid ${listing.status==="Active"?"#A7F3D0":listing.status==="Rented"?"#FDE68A":"#DDD6FE"}`}}>{listing.status}</span>
</div>
{currentUser?.role==="user"&&(
<button onClick={e=>{e.stopPropagation();onSave(listing.id)}} style={{position:"absolute",bottom:12,right:12,background:"rgba(255,255,255,0.92)",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:16,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>{isSaved?"❤️":"🤍"}</button>
)}
<div style={{position:"absolute",bottom:12,left:12,fontSize:20,fontWeight:800,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:12,fontWeight:500}}>/mo</span>}</div>
</div>
<div style={{padding:"16px 18px"}}>
<h3 style={{fontSize:15,fontWeight:700,color:"var(--navy)",marginBottom:4,lineHeight:1.3}}>{listing.title}</h3>
<div style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>📍 {listing.location}</div>
<div style={{display:"flex",gap:16,fontSize:12,color:"var(--muted)",marginBottom:14,paddingBottom:14,borderBottom:"1px solid var(--border)"}}>
{listing.bedrooms>0&&<span>🛏 {listing.bedrooms} Beds</span>}
{listing.bathrooms>0&&<span>🚿 {listing.bathrooms} Baths</span>}
{listing.sizesqft&&<span>📐 {listing.sizesqft} sqft</span>}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
<button onClick={()=>onView(listing)} className="btn-ghost" style={{padding:"8px",borderRadius:9,fontSize:11}}>View</button>
<button onClick={()=>showWACard(listing)} style={{padding:"8px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><WALogo size={12}/>WhatsApp</button>
<button onClick={()=>showPDF(listing)} className="btn-primary" style={{padding:"8px",borderRadius:9,fontSize:11,border:"none"}}>📄 PDF</button>
</div>
</div>
</div>
);
};

const PropModal = ({listing,onClose}) => {
useEffect(()=>{if(listing?.id)track(listing.id,"view");},[listing?.id]);
if(!listing) return null;
const fields=[["Type",listing.propertyType],["Listing",listing.listingType],["Size",listing.sizesqft?`${listing.sizesqft} sqft`:null],["Beds",listing.bedrooms||null],["Baths",listing.bathrooms||null],["Furnishing",listing.furnishingStatus],["Condition",listing.condition],["Built Year",listing.builtYear],["Floor",listing.propertyFloor],["Total Floors",listing.totalFloors],["Parking",listing.parkingType],["Vastu",listing.vastuDirection],["RERA",listing.reraRegistered==="Yes"?`Yes – ${listing.reraNumber||""}`:listing.reraRegistered]].filter(([,v])=>v);
return (
<div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.35)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={onClose}>
<div className="card asl" style={{maxWidth:640,width:"100%",maxHeight:"92vh",overflow:"auto",padding:32,boxShadow:"0 32px 80px rgba(27,58,45,0.2)"}} onClick={e=>e.stopPropagation()}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<div>
<h2 style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,color:"var(--navy)",marginBottom:4}}>{listing.title}</h2>
<div style={{color:"var(--muted)",fontSize:14}}>📍 {listing.location}</div>
</div>
<button onClick={onClose} className="btn-ghost" style={{borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,padding:0}}>×</button>
</div>
<div style={{fontSize:32,fontWeight:800,color:"var(--green2)",marginBottom:20,fontFamily:"'Fraunces',serif"}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:14,fontWeight:500,color:"var(--muted)"}}>/month</span>}</div>
{listing.description&&<p style={{fontSize:14,color:"var(--muted)",lineHeight:1.75,marginBottom:20,background:"var(--cream)",padding:14,borderRadius:10,border:"1px solid var(--border)"}}>{listing.description}</p>}
{fields.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 24px",marginBottom:20}}>{fields.map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)",fontSize:13}}><span style={{color:"var(--muted)"}}>{k}</span><span style={{fontWeight:700,color:"var(--navy)"}}>{v}</span></div>)}</div>}
{listing.highlights?.length>0&&<div style={{marginBottom:20}}><p className="section-label">Key Highlights</p>{listing.highlights.map((h,i)=><div key={i} style={{fontSize:13,color:"var(--text)",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"var(--green)",fontWeight:700,marginTop:1}}>✓</span>{h}</div>)}</div>}
<div style={{background:"var(--green-light)",borderRadius:14,padding:20,border:"1px solid var(--green-mid)"}}>
<p className="section-label">Contact Agent</p>
<div style={{fontSize:14,color:"var(--text)",display:"flex",flexDirection:"column",gap:8}}>
<div style={{fontWeight:700,fontSize:15}}>👤 {listing.agentName} <span style={{fontWeight:400,color:"var(--muted)"}}>· {listing.agencyName}</span></div>
{listing.agentPhone&&<div style={{color:"var(--muted)"}}>📞 <a href={`tel:${listing.agentPhone}`} style={{color:"var(--green2)",fontWeight:600}}>{listing.agentPhone}</a></div>}
<div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
{listing.agentPhone&&<a href={`https://wa.me/${listing.agentPhone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,background:"#25D366",color:"#fff",padding:"10px 16px",borderRadius:9,textDecoration:"none",fontWeight:700,fontSize:13}}><WALogo size={15}/>WhatsApp Agent</a>}
<button onClick={()=>showWACard(listing)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"#128C7E",color:"#fff",padding:"10px 16px",borderRadius:9,fontWeight:700,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}><WALogo size={15}/>WhatsApp Card</button>
<button onClick={()=>showPDF(listing)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"var(--navy)",color:"#fff",padding:"10px 16px",borderRadius:9,fontWeight:700,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}>📄 PDF Report</button>
</div>
</div>
</div>
</div>
</div>
);
};

const WACardModal = ({listing,onClose}) => {
const [copied,setCopied]=useState(false);
const [downloading,setDownloading]=useState(false);
const [fmt,setFmt]=useState("square"); // square | portrait
useEffect(()=>{if(listing?.id)track(listing.id,"wa");},[listing?.id]);
if(!listing) return null;

const loadH2C=()=>new Promise((res,rej)=>{
if(window.html2canvas){res(window.html2canvas);return;}
const s=document.createElement("script");
s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
s.onload=()=>res(window.html2canvas); s.onerror=rej;
document.head.appendChild(s);
});

const captureCard=async()=>{
const h2c=await loadH2C();
const card=document.getElementById("wa-card");
return h2c(card,{scale:3,useCORS:true,allowTaint:true,backgroundColor:null,logging:false});
};

const downloadImage=async()=>{
setDownloading(true);
try{
const canvas=await captureCard();
const a=document.createElement("a");
      a.download=`Northing-${(listing.title||"property").replace(/\s+/g,"-").toLowerCase()}.png`;
      a.download=`pheniq-${(listing.title||"property").replace(/\s+/g,"-").toLowerCase()}.png`;
a.href=canvas.toDataURL("image/png",0.95);
a.click();
}catch(e){alert("Download failed — try screenshotting the card manually.");}
@@ -320,11 +320,11 @@
try{
const canvas=await captureCard();
canvas.toBlob(async(blob)=>{
        const file=new File([blob],"Northing-card.png",{type:"image/png"});
        const file=new File([blob],"pheniq-card.png",{type:"image/png"});
if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
await navigator.share({files:[file],title:listing.title,text:buildText()});
} else {
          const a=document.createElement("a"); a.download="Northing-card.png";
          const a=document.createElement("a"); a.download="pheniq-card.png";
a.href=canvas.toDataURL(); a.click();
setTimeout(()=>window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`,"_blank"),800);
}
@@ -354,7 +354,7 @@
if(listing.agentPhone) lines.push('  Phone: ' + listing.agentPhone);
if(listing.agencyName) lines.push('  Agency: ' + listing.agencyName);
lines.push('');
    lines.push('_Powered by Northing_');
    lines.push('_Powered by Pheniq_');
return lines.join('\n');
};

@@ -394,7 +394,7 @@
<div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{background:"var(--primary)",color:"#fff",fontSize:11,fontWeight:800,padding:"5px 12px",borderRadius:20,letterSpacing:"0.5px"}}>FOR {listing.listingType?.toUpperCase()}</span>
<div style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"4px 10px"}}>
              <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:13,color:"var(--primary)"}}>Northing</span>
              <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:13,color:"var(--primary)"}}>PHENIQ</span>
</div>
</div>

@@ -478,7 +478,7 @@
pdf.addImage(canvas.toDataURL('image/jpeg',0.95),'JPEG',0,-y,mmW,mmH);
y+=pageH;
}
      pdf.save('Northing-'+((listing.title||'property').replace(/\s+/g,'-').toLowerCase())+'.pdf');
      pdf.save('pheniq-'+((listing.title||'property').replace(/\s+/g,'-').toLowerCase())+'.pdf');
}catch(err){console.error(err);window.print();}
setPdfLoading(false);
};
@@ -584,8 +584,8 @@
{listing.agentPhone&&<div style={{fontSize:12,color:"#888"}}>📞 {listing.agentPhone}</div>}
</div>
<div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"#ccc"}}>Northing</div>
              <div style={{fontSize:10,color:"#ccc"}}>Powered by Northing</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"#ccc"}}>PHENIQ</div>
              <div style={{fontSize:10,color:"#ccc"}}>Powered by Pheniq</div>
</div>
</div>
</div>
@@ -671,7 +671,7 @@
<div className="hm" style={{width:"45%",background:"var(--navy)",padding:"60px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
<div style={{position:"absolute",top:-60,right:-60,width:300,height:300,borderRadius:"50%",background:"rgba(255,107,0,0.12)"}}/>
<div style={{position:"absolute",bottom:-80,left:-40,width:250,height:250,borderRadius:"50%",background:"rgba(255,107,0,0.08)"}}/>
        <div style={{position:"relative"}}><div style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:28,color:"#fff",marginBottom:4}}>Northing</div><div style={{fontSize:13,color:"rgba(255,255,255,0.45)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Professional Property Marketing</div></div>
        <div style={{position:"relative"}}><div style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:28,color:"#fff",marginBottom:4}}>PHENIQ</div><div style={{fontSize:13,color:"rgba(255,255,255,0.45)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Professional Property Marketing</div></div>
<div style={{position:"relative"}}>
<h2 style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:700,color:"#fff",lineHeight:1.25,marginBottom:16}}>Buy, Sell, or Rent — all in one place.</h2>
<p style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.75}}>Instant brochures, WhatsApp cards, and verified listings — built for Indian real estate.</p>
@@ -691,9 +691,9 @@
<button onClick={()=>onNavigate&&onNavigate("home")} style={{background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:"4px 0",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",fontWeight:600}}>← Back to Home</button>
</div>
<div style={{marginBottom:28}}>
            <div style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:22,color:"var(--navy)",marginBottom:2}}>Northing</div>
            <div style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:22,color:"var(--navy)",marginBottom:2}}>PHENIQ</div>
<h2 style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:700,color:"var(--navy)",marginBottom:6}}><ShinyText text={mode==="login"?"Welcome back.":"Create account."} color="#1a1410" shineColor="#FF6B00" speed={3} spread={140}/></h2>
            <p style={{fontSize:14,color:"var(--muted)"}}>{mode==="login"?"Sign in to your account":"Join Northing today — it's free"}</p>
            <p style={{fontSize:14,color:"var(--muted)"}}>{mode==="login"?"Sign in to your account":"Join Pheniq today — it's free"}</p>
</div>
{mode==="register"&&(
<div style={{marginBottom:18}}>
@@ -1085,8 +1085,8 @@
</div>
</div>
<div style={{textAlign:"right",fontSize:10,color:"var(--muted)"}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"var(--muted)"}}>Northing</div>
                <div>Powered by Northing</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"var(--muted)"}}>PHENIQ</div>
                <div>Powered by Pheniq</div>
</div>
</div>
</div>
@@ -1509,9 +1509,9 @@
<div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{width:32,height:32,background:"var(--primary)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:900,fontFamily:"'Fraunces',serif",fontSize:15}}>P</span></div>
            <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:18,color:"#fff"}}>Northing</span>
            <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:18,color:"#fff"}}>PHENIQ</span>
</div>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>© 2026 Northing · Professional Property Marketing · Made in India</p>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>© 2026 Pheniq · Professional Property Marketing · Made in India</p>
<div style={{display:"flex",gap:20,fontSize:12,color:"rgba(255,255,255,0.3)"}}>
<span style={{cursor:"pointer"}}>Privacy</span><span>·</span><span style={{cursor:"pointer"}}>Terms</span>
</div>
@@ -1554,7 +1554,7 @@
{agent.logo_url?<img src={agent.logo_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{color:"#fff",fontWeight:900,fontFamily:"'Fraunces',serif",fontSize:36}}>{agent.name?.charAt(0)}</span>}
</div>
<div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Verified Agent · Northing</div>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Verified Agent · Pheniq</div>
<h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,color:"#fff",margin:"0 0 4px"}}>{agent.agency_name||agent.name}</h1>
{agent.agency_name&&<div style={{fontSize:14,color:"rgba(255,255,255,0.5)",marginBottom:8}}>{agent.name}</div>}
<div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:6}}>
@@ -1569,7 +1569,7 @@
<div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:0.8}}>Active Listings</div>
</div>
<button onClick={copyLink} style={{padding:"9px 14px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:copied?"#059669":"var(--primary)",color:"#fff",border:"none",fontFamily:"inherit",transition:"background 0.2s"}}>{copied?"✅ Copied!":"🔗 Copy Profile Link"}</button>
            {agent.phone&&<a href={`https://wa.me/${agent.phone.replace(/\D/g,"")}?text=${encodeURIComponent("Hi, I found your profile on Northing and would like to enquire about your properties.")}`} target="_blank" rel="noreferrer" style={{padding:"9px 14px",borderRadius:9,fontSize:12,fontWeight:700,background:"#25D366",color:"#fff",border:"none",fontFamily:"inherit",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><WALogo size={12}/>WhatsApp Agent</a>}
            {agent.phone&&<a href={`https://wa.me/${agent.phone.replace(/\D/g,"")}?text=${encodeURIComponent("Hi, I found your profile on Pheniq and would like to enquire about your properties.")}`} target="_blank" rel="noreferrer" style={{padding:"9px 14px",borderRadius:9,fontSize:12,fontWeight:700,background:"#25D366",color:"#fff",border:"none",fontFamily:"inherit",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><WALogo size={12}/>WhatsApp Agent</a>}
</div>
</div>
</div>
@@ -1618,7 +1618,7 @@
<nav style={{position:"sticky",top:0,zIndex:100,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",background:"rgba(255,255,255,0.88)",backdropFilter:"blur(16px) saturate(180%)",borderBottom:"1px solid rgba(255,107,0,0.1)",transition:"all 0.3s",boxShadow:scrolled?"0 2px 16px rgba(255,107,0,0.08)":"none"}}>
<button onClick={()=>{onNavigate("home");onSecretClick();}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
<div style={{width:36,height:36,background:"var(--primary)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(255,107,0,0.3)"}}><span style={{color:"#fff",fontSize:17,fontWeight:900,fontFamily:"'Fraunces',serif"}}>P</span></div>
        <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:20,color:"var(--navy)",letterSpacing:"-0.5px"}}>Northing</span>
        <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:20,color:"var(--navy)",letterSpacing:"-0.5px"}}>PHENIQ</span>
</button>
<div style={{display:"flex",gap:6,alignItems:"center"}}>
{["home","feed"].map(p=><button key={p} onClick={()=>onNavigate(p)} style={{padding:"7px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer",background:page===p?"var(--primary-light)":"transparent",color:page===p?"var(--primary)":"var(--muted)",border:"none",transition:"all 0.2s",textTransform:"capitalize"}}>{p==="feed"?"Browse":p}</button>)}
@@ -1641,13 +1641,13 @@
class ErrorBoundary extends Component {
constructor(props) { super(props); this.state = { crashed: false, error: null }; }
static getDerivedStateFromError(error) { return { crashed: true, error }; }
  componentDidCatch(error, info) { console.error("Northing crash:", error, info); }
  componentDidCatch(error, info) { console.error("Pheniq crash:", error, info); }
render() {
if (this.state.crashed) {
return (
<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#fff8f4",fontFamily:"'Inter',sans-serif",padding:24}}>
<div style={{textAlign:"center",maxWidth:420}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"#1a1410",marginBottom:8}}>Northing</div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"#1a1410",marginBottom:8}}>PHENIQ</div>
<div style={{fontSize:40,marginBottom:16}}>⚠️</div>
<h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"#1a1410",marginBottom:8}}>Something went wrong</h2>
<p style={{fontSize:14,color:"#78716c",marginBottom:24,lineHeight:1.6}}>The app encountered an unexpected error. Your data is safe — just reload to continue.</p>
@@ -1700,7 +1700,7 @@
if(authLoading) return (
<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--cream)",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
<style>{G}</style>
      <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",marginBottom:12}}>Northing</div><div style={{width:28,height:28,border:"3px solid var(--border)",borderTopColor:"var(--green)",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}></div></div>
      <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",marginBottom:12}}>PHENIQ</div><div style={{width:28,height:28,border:"3px solid var(--border)",borderTopColor:"var(--green)",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}></div></div>
</div>
);
