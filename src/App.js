import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────
//  🔧 FILL THESE IN FROM YOUR SUPABASE DASHBOARD → Settings → API
// ─────────────────────────────────────────────────────────────────
const SUPABASE_URL      = "https://thgnziutmpmnsrkjoext.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ256aXV0bXBtbnNya2pvZXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTUwOTcsImV4cCI6MjA4ODA5MTA5N30.SYLiGFgGChnibmEP5RQVmJzlfr_nBDpJJCOmTCZgZ9Y";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ─────────────────────────────────────────────────────────────────

// ── Global styles ────────────────────────────────────────────────
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
  @media(max-width:768px){.hm{display:none!important}.gr{grid-template-columns:1fr!important}.gr3{grid-template-columns:1fr!important}.mob-nav{display:flex!important}}
  @media(max-width:640px){.h1big{font-size:32px!important}}
`;

// ── ShinyText component (ReactBits) ─────────────────────────────
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

// ── Utilities ────────────────────────────────────────────────────
const fmtP = (p) => { if(!p) return "POA"; const n=Number(p); if(n>=10000000) return `₹${(n/10000000).toFixed(2)} Cr`; if(n>=100000) return `₹${(n/100000).toFixed(2)} L`; return `₹${n.toLocaleString("en-IN")}`; };
const simScore = (a="",b="") => { a=a.toLowerCase().trim(); b=b.toLowerCase().trim(); if(!a||!b) return 0; const sa=new Set(a.split(/\s+/)),sb=new Set(b.split(/\s+/)); return [...sa].filter(x=>sb.has(x)).length/Math.max(sa.size,sb.size); };
const findDups = (form, all, editId) => all.filter(l => {
  if(l.id===editId) return false;
  const ts=simScore(form.title,l.title), ls=simScore(form.location,l.location);
  const pm=form.price&&l.price&&Math.abs(Number(form.price)-Number(l.price))/Number(l.price)<0.1;
  const dm=form.bedrooms&&l.bedrooms&&String(form.bedrooms)===String(l.bedrooms)&&form.propertyType===l.propertyType;
  return (ts>0.6?2:0)+(ls>0.7?2:0)+(pm?1:0)+(dm?1:0)>=3;
});

// ── DB ↔ App shape mappers ────────────────────────────────────────
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

// ── Supabase data helpers ─────────────────────────────────────────
const uploadPhoto = async (file) => {
  const ext = file.name.split(".").pop().toLowerCase() || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).substr(2,7)}.${ext}`;
  const { error } = await supabase.storage.from("property-photos").upload(name, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("property-photos").getPublicUrl(name);
  return data.publicUrl;
};

// ── Module-level WA / PDF handlers (set by App on mount) ─────────
const _h = { openWA: ()=>{}, openPDF: ()=>{} };
const showWACard = (l) => _h.openWA(l);
const showPDF    = (l) => _h.openPDF(l);

// ── Tracking ─────────────────────────────────────────────────────
const track = (listingId, type) => {
  if(!listingId) return;
  const col = type==="view"?"view_count":type==="wa"?"wa_count":"pdf_count";
  supabase.rpc("increment_count",{row_id:listingId,col_name:col}).catch(()=>{
    supabase.from("listings").select(col).eq("id",listingId).single().then(({data})=>{
      if(data) supabase.from("listings").update({[col]:(data[col]||0)+1}).eq("id",listingId);
    });
  });
};

// ── WALogo ───────────────────────────────────────────────────────
const WALogo = ({size=16}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" style={{flexShrink:0}}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ── Toast ────────────────────────────────────────────────────────
const Toast = ({msg,type,onClose}) => (
  <div className="asl" style={{position:"fixed",bottom:28,right:28,zIndex:9999,padding:"13px 18px",borderRadius:12,display:"flex",alignItems:"center",gap:10,maxWidth:340,fontSize:14,fontWeight:600,boxShadow:"0 8px 32px rgba(27,58,45,0.18)",background:type==="error"?"#FEF2F2":type==="success"?"#ECFDF5":"#EFF6FF",border:`1.5px solid ${type==="error"?"#FCA5A5":type==="success"?"#6EE7B7":"#BFDBFE"}`,color:type==="error"?"#DC2626":type==="success"?"#059669":"#1D4ED8"}}>
    <span>{type==="error"?"⚠️":type==="success"?"✅":"ℹ️"}</span>
    <span style={{flex:1}}>{msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,opacity:0.5}}>×</button>
  </div>
);

// ── Confirm Delete Modal (replaces window.confirm) ───────────────
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

// ── Duplicate Modal ──────────────────────────────────────────────
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

// ── Property Card ────────────────────────────────────────────────
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

// ── Property Modal ───────────────────────────────────────────────
const PropModal = ({listing,onClose}) => {
  useEffect(()=>{if(listing?.id) track(listing.id,"view");},[listing?.id]);
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
              {listing.agentPhone&&<a href={`https://wa.me/91${listing.agentPhone}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,background:"#25D366",color:"#fff",padding:"10px 16px",borderRadius:9,textDecoration:"none",fontWeight:700,fontSize:13}}><WALogo size={15}/>WhatsApp Agent</a>}
              <button onClick={()=>showWACard(listing)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"#128C7E",color:"#fff",padding:"10px 16px",borderRadius:9,fontWeight:700,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}><WALogo size={15}/>WhatsApp Card</button>
              <button onClick={()=>showPDF(listing)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"var(--navy)",color:"#fff",padding:"10px 16px",borderRadius:9,fontWeight:700,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}>📄 PDF Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── WA Card Modal ────────────────────────────────────────────────
const WACardModal = ({listing,onClose}) => {
  const [copied,setCopied]=useState(false);
  useEffect(()=>{if(listing?.id) track(listing.id,"wa");},[listing?.id]);
  if(!listing) return null;
  const price=fmtP(listing.price);
  const details=[listing.bedrooms>0?`🛏 ${listing.bedrooms} Bed${listing.bedrooms>1?"s":""}`:null,listing.bathrooms>0?`🚿 ${listing.bathrooms} Bath${listing.bathrooms>1?"s":""}`:null,listing.sizesqft?`📐 ${listing.sizesqft} sqft`:null,listing.furnishingStatus?`🛋 ${listing.furnishingStatus}`:null].filter(Boolean);
  const highlights=(listing.highlights||[]).slice(0,3);

  const buildText=()=>{
    const lines=[];
    lines.push(`🏠 *${listing.title}*`);
    lines.push(`📍 ${listing.location}`);
    lines.push("");
    lines.push(`💰 *${price}*${listing.listingType==="Rent"?" /month":""}`);
    lines.push(`🏷️ For *${listing.listingType}*`);
    if(details.length>0) lines.push(details.join("   "));
    if(listing.description){lines.push("");lines.push(listing.description);}
    if(highlights.length>0){lines.push("");highlights.forEach(h=>lines.push(`✅ ${h}`));}
    lines.push("");
    lines.push(`📞 *${listing.agentName||""}* — ${listing.agentPhone||""}`);
    if(listing.agencyName) lines.push(`🏢 ${listing.agencyName}`);
    lines.push("");
    lines.push(`_Powered by Pheniq_`);
    return lines.join("\n");
  };

  const copyText=()=>{
    navigator.clipboard?.writeText(buildText()).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);}).catch(()=>{});
  };
  const openWA=()=>window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`,"_blank");

  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.6)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div className="asl" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,maxHeight:"95vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>

        {/* Card Preview */}
        <div id="wa-card" style={{width:360,background:"#fff",borderRadius:20,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.5)",flexShrink:0}}>
          <div style={{height:200,position:"relative",background:"linear-gradient(135deg,#E8F5EE,#C2E8D4)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
            {listing.photos?.[0]?<img src={listing.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{fontSize:56,opacity:0.25}}>🏠</div>}
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(27,58,45,0.88) 0%,rgba(27,58,45,0.05) 55%,transparent 100%)"}}/>
            <div style={{position:"absolute",top:12,left:12}}><span style={{background:"#3DAA7E",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{listing.listingType?.toUpperCase()} · {listing.status}</span></div>
            <div style={{position:"absolute",bottom:14,left:14,right:14}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:800,color:"#fff"}}>{price}{listing.listingType==="Rent"&&<span style={{fontSize:13,fontWeight:400,color:"rgba(255,255,255,0.65)"}}>/mo</span>}</div>
            </div>
          </div>
          <div style={{padding:"14px 16px 0"}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:700,color:"#1B3A2D",marginBottom:3}}>{listing.title}</div>
            <div style={{fontSize:12,color:"#6B8076",marginBottom:10}}>📍 {listing.location}</div>
            {details.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>{details.map((d,i)=><span key={i} style={{background:"#F0F5F2",border:"1px solid #DDE8E2",borderRadius:6,padding:"4px 8px",fontSize:10,fontWeight:600,color:"#1B3A2D"}}>{d}</span>)}</div>}
            {listing.description&&<p style={{fontSize:11,color:"#6B8076",lineHeight:1.6,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{listing.description}</p>}
          </div>
          <div style={{padding:"10px 16px 12px",borderTop:"1px solid #F0F2EE",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:11,fontWeight:700,color:"#1B3A2D"}}>{listing.agentName}</div><div style={{fontSize:10,color:"#6B8076"}}>{listing.agencyName} · {listing.agentPhone}</div></div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:14,fontWeight:800,color:"#3DAA7E"}}>PHENIQ</div>
          </div>
        </div>

        {/* Tip */}
        <div style={{width:360,background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"9px 14px",fontSize:11,color:"rgba(255,255,255,0.7)",textAlign:"center",border:"1px solid rgba(255,255,255,0.15)"}}>
          📸 <strong style={{color:"#fff"}}>To share with photo:</strong> Screenshot the card above, then send on WhatsApp
        </div>

        {/* Buttons */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,width:360}}>
          <button onClick={copyText} style={{padding:"11px 8px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:copied?"#059669":"rgba(255,255,255,0.15)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",fontFamily:"inherit",transition:"all 0.2s"}}>{copied?"✅ Copied!":"📋 Copy Text"}</button>
          <button onClick={openWA} style={{padding:"11px 8px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:"#25D366",color:"#fff",border:"none",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><WALogo size={13}/>WhatsApp</button>
          <button onClick={onClose} style={{padding:"11px 8px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:"rgba(255,255,255,0.1)",color:"#fff",border:"1px solid rgba(255,255,255,0.2)",fontFamily:"inherit"}}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ── PDF Modal ────────────────────────────────────────────────────
const PDFModal = ({listing,onClose}) => {
  useEffect(()=>{if(listing?.id) track(listing.id,"pdf");},[listing?.id]);
  if(!listing) return null;
  const td=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  const ref=`PHQ-${listing.id?.slice(-6)?.toUpperCase()||"000000"}`;
  const fields=[["Type",listing.propertyType],["Listing",listing.listingType],["Size",listing.sizesqft?`${listing.sizesqft} sqft`:null],["Beds",listing.bedrooms||null],["Baths",listing.bathrooms||null],["Furnishing",listing.furnishingStatus],["Condition",listing.condition],["Built Year",listing.builtYear],["Parking",listing.parkingType],["RERA",listing.reraRegistered==="Yes"?`Yes – ${listing.reraNumber||""}`:listing.reraRegistered]].filter(([,v])=>v);
  const hasAgentBrand=listing.agencyName||listing.logoUrl;
  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div className="asl" style={{background:"#fff",borderRadius:18,maxWidth:720,width:"100%",maxHeight:"92vh",overflow:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
        {/* Toolbar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:"1px solid #eee",position:"sticky",top:0,background:"#fff",zIndex:1}}>
          <div style={{fontWeight:800,fontSize:14,color:"var(--navy)"}}>PDF Preview</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>window.print()} style={{background:"var(--primary)",color:"#fff",border:"none",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🖨️ Print / Save PDF</button>
            <button onClick={onClose} style={{background:"#f4f4f4",border:"1px solid #ddd",color:"#666",padding:"8px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✕ Close</button>
          </div>
        </div>

        <div style={{padding:"36px 44px",fontFamily:"'Inter',sans-serif",color:"#1a1410"}}>

          {/* ── AGENT HEADER (white-label) ── */}
          {hasAgentBrand?(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,paddingBottom:20,borderBottom:"3px solid var(--primary)"}}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                {listing.logoUrl
                  ?<img src={listing.logoUrl} alt="logo" style={{width:64,height:64,objectFit:"contain",borderRadius:10,border:"1px solid #eee"}}/>
                  :<div style={{width:64,height:64,borderRadius:10,background:"var(--primary-light)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,border:"1px solid var(--primary-mid)"}}>🏢</div>
                }
                <div>
                  <div style={{fontWeight:900,fontSize:22,color:"var(--navy)",letterSpacing:"-0.5px"}}>{listing.agencyName||listing.agentName}</div>
                  {listing.agentPhone&&<div style={{fontSize:13,color:"#666",marginTop:2}}>📞 {listing.agentPhone}</div>}
                  {listing.agentAddress&&<div style={{fontSize:12,color:"#666"}}>📍 {listing.agentAddress}</div>}
                  {listing.agentWebsite&&<div style={{fontSize:12,color:"var(--primary)"}}>{listing.agentWebsite}</div>}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"#aaa"}}>{td}</div>
                <div style={{fontSize:11,color:"#aaa",marginTop:2}}>Ref: {ref}</div>
              </div>
            </div>
          ):(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,paddingBottom:20,borderBottom:"3px solid var(--primary)"}}>
              <div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:800,color:"var(--navy)"}}>PHEN<span style={{color:"var(--primary)"}}>IQ</span></div>
                <div style={{fontSize:10,color:"#888",letterSpacing:"1.5px",marginTop:2,textTransform:"uppercase"}}>Professional Property Marketing</div>
              </div>
              <div style={{textAlign:"right",fontSize:12,color:"#888"}}><div>{td}</div><div style={{marginTop:3}}>{ref}</div></div>
            </div>
          )}

          {/* ── PHOTOS ── */}
          {listing.photos?.length>0&&(
            <div style={{marginBottom:24}}>
              <div style={{display:"grid",gridTemplateColumns:listing.photos.length===1?"1fr":"1fr 1fr",gap:8}}>
                {listing.photos.slice(0,4).map((p,i)=>(
                  <img key={i} src={p} alt="" style={{width:"100%",height:listing.photos.length===1?260:170,objectFit:"cover",borderRadius:10,border:"1px solid #eee"}}/>
                ))}
              </div>
            </div>
          )}

          {/* ── TITLE + PRICE ── */}
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:900,margin:"0 0 4px",color:"var(--navy)"}}>{listing.title}</h1>
          <div style={{color:"#888",fontSize:14,marginBottom:10}}>📍 {listing.location}</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:900,color:"var(--primary)",marginBottom:4}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:15,fontWeight:400,color:"#888"}}>/month</span>}</div>
          <div style={{display:"inline-block",background:"var(--primary-light)",color:"var(--primary)",border:"1px solid var(--primary-mid)",borderRadius:20,padding:"3px 14px",fontSize:12,fontWeight:700,marginBottom:20}}>For {listing.listingType}</div>

          {/* ── DESCRIPTION ── */}
          {listing.description&&<div style={{background:"#fafafa",padding:16,borderRadius:10,fontSize:13,lineHeight:1.8,marginBottom:20,border:"1px solid #eee",color:"#444"}}>{listing.description}</div>}

          {/* ── DETAILS ── */}
          {fields.length>0&&<div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:12}}>Property Details</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 40px"}}>
              {fields.map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f4f4f4",fontSize:13}}><span style={{color:"#888"}}>{k}</span><span style={{fontWeight:700,color:"var(--navy)"}}>{v}</span></div>)}
            </div>
          </div>}

          {/* ── HIGHLIGHTS ── */}
          {listing.highlights?.length>0&&<div style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:12}}>Key Highlights</div>
            {listing.highlights.map((h,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:7,fontSize:13,alignItems:"flex-start"}}><span style={{color:"var(--primary)",fontWeight:700,flexShrink:0}}>✓</span>{h}</div>)}
          </div>}

          {/* ── FOOTER ── */}
          <div style={{borderTop:"2px solid #f0f0f0",paddingTop:16,marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"var(--navy)"}}>{listing.agentName||""}</div>
              {listing.agentEmail&&<div style={{fontSize:12,color:"#888"}}>{listing.agentEmail}</div>}
              {listing.agentPhone&&<div style={{fontSize:12,color:"#888"}}>📞 {listing.agentPhone}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"#ccc"}}>PHENIQ</div>
              <div style={{fontSize:10,color:"#ccc"}}>Powered by Pheniq</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ── Secret Admin hook ────────────────────────────────────────────
const useSecretAdmin = (cb) => {
  const c=useRef(0),t=useRef(null);
  return ()=>{c.current++;clearTimeout(t.current);t.current=setTimeout(()=>{c.current=0;},1500);if(c.current>=5){c.current=0;cb();}};
};

// ── Secret Admin Modal ───────────────────────────────────────────
const SecretAdminModal = ({onLogin,onClose,showToast}) => {
  const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [shake,setShake]=useState(false);const [loading,setLoading]=useState(false);
  const attempt=async()=>{
    setLoading(true);
    try {
      const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
      if(error) throw error;
      const {data:profile,error:pe}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
      if(pe||!profile) throw new Error("Profile not found");
      if(profile.role!=="master") throw new Error("Not authorised");
      onLogin({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,savedListings:[]});
      onClose();
    } catch(err){setShake(true);setTimeout(()=>setShake(false),500);showToast(err.message||"Invalid credentials","error");}
    setLoading(false);
  };
  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.5)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div className={`card asl ${shake?"shk":""}`} style={{padding:"40px 36px",maxWidth:380,width:"100%",boxShadow:"0 32px 80px rgba(27,58,45,0.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"var(--green-light)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24,border:"2px solid var(--green-mid)"}}>🔐</div>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:21,fontWeight:700,color:"var(--navy)",marginBottom:5}}>Secure Access</h2>
          <p style={{fontSize:13,color:"var(--muted)"}}>Authorised personnel only</p>
        </div>
        <div style={{marginBottom:12}}><input className="inp" type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} /></div>
        <div style={{marginBottom:20}}><input className="inp" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} /></div>
        <button onClick={attempt} disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:10,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Please wait…</>:"Access Platform →"}</button>
        <button onClick={onClose} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:8}}>Cancel</button>
      </div>
    </div>
  );
};

// ── Login Page ───────────────────────────────────────────────────
const LoginPage = ({onLogin,showToast,onNavigate}) => {
  const [mode,setMode]=useState("login");const [role,setRole]=useState("user");
  const [form,setForm]=useState({name:"",email:"",password:"",phone:"",agencyName:""});const [loading,setLoading]=useState(false);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=async()=>{
    if(!form.email||!form.password){showToast("Email and password required","error");return;}
    setLoading(true);
    try{
      if(mode==="login"){
        const {data,error}=await supabase.auth.signInWithPassword({email:form.email,password:form.password});
        if(error) throw error;
        const {data:profile,error:pe}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
        if(pe||!profile) throw new Error("Profile not found. Contact support.");
        const savedRes=await supabase.from("saved_listings").select("listing_id").eq("user_id",data.user.id);
        const savedIds=(savedRes.data||[]).map(r=>r.listing_id);
        showToast(`Welcome back, ${profile.name}!`,"success");
        onLogin({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,logoUrl:profile.logo_url||null,agentAddress:profile.address||null,agentWebsite:profile.website||null,savedListings:savedIds});
      } else {
        if(!form.name){showToast("Name is required","error");setLoading(false);return;}
        if(form.password.length<6){showToast("Password must be at least 6 characters","error");setLoading(false);return;}
        const {data,error}=await supabase.auth.signUp({email:form.email,password:form.password});
        if(error) throw error;
        const {error:pe}=await supabase.from("profiles").insert({id:data.user.id,name:form.name,email:form.email,role,phone:form.phone||null,agency_name:form.agencyName||null});
        if(pe) throw pe;
        showToast("Account created! You can now sign in.","success");
        setMode("login");setForm(f=>({...f,password:""}));
      }
    }catch(err){showToast(err.message||"Something went wrong","error");}
    setLoading(false);
  };
  const roles=[
    {id:"user",icon:"🔍",label:"Buyer",desc:"Browse & save properties"},
    {id:"seller",icon:"🏠",label:"Individual Seller",desc:"List up to 2 properties"},
    {id:"agent",icon:"🏢",label:"Agent / Firm",desc:"Unlimited listings + white-label"},
  ];
  return (
    <div style={{minHeight:"100vh",background:"var(--cream)",display:"flex"}}>
      <div className="hm" style={{width:"45%",background:"var(--navy)",padding:"60px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:300,height:300,borderRadius:"50%",background:"rgba(255,107,0,0.12)"}}/>
        <div style={{position:"absolute",bottom:-80,left:-40,width:250,height:250,borderRadius:"50%",background:"rgba(255,107,0,0.08)"}}/>
        <div style={{position:"relative"}}><div style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:28,color:"#fff",marginBottom:4}}>PHENIQ</div><div style={{fontSize:13,color:"rgba(255,255,255,0.45)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Professional Property Marketing</div></div>
        <div style={{position:"relative"}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:700,color:"#fff",lineHeight:1.25,marginBottom:16}}>Buy, Sell, or Rent — all in one place.</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.75}}>Instant brochures, WhatsApp cards, and verified listings — built for Indian real estate.</p>
          <div style={{marginTop:36,display:"flex",flexDirection:"column",gap:12}}>
            {[["🔍","Buyers","Browse verified listings and download reports"],["🏠","Sellers","List your property and reach thousands"],["🏢","Agents","White-label brochures and full firm profile"]].map(([icon,title,desc])=>(
              <div key={title} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:20}}>{icon}</span>
                <div><div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{title}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:32,overflowY:"auto"}}>
        <div style={{maxWidth:440,width:"100%"}}>
          <div style={{marginBottom:16}}>
            <button onClick={()=>onNavigate&&onNavigate("home")} style={{background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:"4px 0",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",fontWeight:600}}>← Back to Home</button>
          </div>
          <div style={{marginBottom:28}}>
            <div style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:22,color:"var(--navy)",marginBottom:2}}>PHENIQ</div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:700,color:"var(--navy)",marginBottom:6}}><ShinyText text={mode==="login"?"Welcome back.":"Create account."} color="#1a1410" shineColor="#FF6B00" speed={3} spread={140}/></h2>
            <p style={{fontSize:14,color:"var(--muted)"}}>{mode==="login"?"Sign in to your account":"Join Pheniq today — it's free"}</p>
          </div>
          {mode==="register"&&(
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>I am a…</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {roles.map(r=>(
                  <button key={r.id} onClick={()=>setRole(r.id)} style={{padding:"12px 14px",borderRadius:12,border:`2px solid ${role===r.id?"var(--primary)":"var(--border)"}`,background:role===r.id?"var(--primary-light)":"var(--white)",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left",transition:"all 0.2s"}}>
                    <span style={{fontSize:22}}>{r.icon}</span>
                    <div><div style={{fontWeight:700,fontSize:14,color:role===r.id?"var(--primary)":"var(--navy)"}}>{r.label}</div><div style={{fontSize:11,color:"var(--muted)"}}>{r.desc}</div></div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {mode==="register"&&<div style={{marginBottom:12}}><input className="inp" placeholder="Full Name" value={form.name} onChange={e=>setF("name",e.target.value)} /></div>}
          <div style={{marginBottom:12}}><input className="inp" type="email" placeholder="Email address" value={form.email} onChange={e=>setF("email",e.target.value)} /></div>
          <div style={{marginBottom:mode==="register"?12:20}}><input className="inp" type="password" placeholder={mode==="register"?"Password (min 6 chars)":"Password"} value={form.password} onChange={e=>setF("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} /></div>
          {mode==="register"&&<div style={{marginBottom:12}}><input className="inp" type="tel" placeholder="Phone number" value={form.phone} onChange={e=>setF("phone",e.target.value)} /></div>}
          {mode==="register"&&(role==="agent"||role==="seller")&&<div style={{marginBottom:20}}><input className="inp" placeholder={role==="agent"?"Agency / Firm name":"Your name or firm (optional)"} value={form.agencyName} onChange={e=>setF("agencyName",e.target.value)} /></div>}
          <button onClick={submit} disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:11,fontSize:15,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Please wait…</>:(mode==="login"?"Sign In →":"Create Account →")}</button>
          <button onClick={()=>setMode(m=>m==="login"?"register":"login")} style={{width:"100%",background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:6}}>{mode==="login"?"Don't have an account? Register →":"Already registered? Sign in →"}</button>
        </div>
      </div>
    </div>
  );
};

// ── Form Helpers ─────────────────────────────────────────────────
const FI=({label,k,form,set,type="text",placeholder="",err,span})=>(<div style={{marginBottom:13,gridColumn:span?"1/-1":"auto"}}>{label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>}<input type={type} placeholder={placeholder} value={form[k]||""} onChange={e=>set(k,e.target.value)} className="inp" style={{borderColor:err?"#FCA5A5":"var(--border)"}} />{err&&<div style={{fontSize:11,color:"#DC2626",marginTop:3}}>{err}</div>}</div>);
const FS=({label,k,form,set,opts})=>(<div style={{marginBottom:13}}>{label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>}<select value={form[k]||""} onChange={e=>set(k,e.target.value)} className="inp"><option value="">Select…</option>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select></div>);
const FormSec=({title,children})=>(<div className="card-flat" style={{padding:"20px 22px",marginBottom:14}}><h3 style={{margin:"0 0 14px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",paddingBottom:9}}>{title}</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>{children}</div></div>);

// ── Listing Form ─────────────────────────────────────────────────
const ListingForm = ({currentUser,listingId,allListings,showToast,onBack,onSaved}) => {
  const isEdit=!!listingId; const fileRef=useRef(); const [hl,setHl]=useState(""); const [dupModal,setDupModal]=useState(null); const [saving,setSaving]=useState(false); const [photoLoading,setPhotoLoading]=useState(false);
  const [form,setForm]=useState({title:"",location:"",propertyType:"",listingType:"",price:"",sizesqft:"",bedrooms:"",bathrooms:"",toilets:"",furnishingStatus:"",condition:"",builtYear:"",modernKitchen:"",wcType:"",superBuiltUp:"",carpetArea:"",parkingType:"",vastuDirection:"",totalFloors:"",propertyFloor:"",maintenance:"",societyFormed:"",ocReceived:"",reraRegistered:"",reraNumber:"",description:"",highlights:[],status:"Active",agentName:currentUser?.name||"",agentPhone:currentUser?.phone||"",agencyName:currentUser?.agencyName||"",agentEmail:currentUser?.email||"",photos:[]});
  const [errs,setErrs]=useState({});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  useEffect(()=>{if(isEdit){const raw=allListings.find(l=>l.id===listingId);if(raw)setForm(dbToForm(raw));}},[listingId,allListings]);
  const addHl=()=>{if(hl.trim()){set("highlights",[...(form.highlights||[]),hl.trim()]);setHl("");}};
  const rmHl=(i)=>set("highlights",form.highlights.filter((_,idx)=>idx!==i));
  const handlePhotos=async(e)=>{
    const files=Array.from(e.target.files);
    if((form.photos?.length||0)+files.length>10){showToast("Max 10 photos allowed","error");return;}
    setPhotoLoading(true);
    try{
      const urls=[];
      for(const file of files){
        if(file.size>5*1024*1024){showToast(`${file.name} is over 5MB, skipped`,"error");continue;}
        const url=await uploadPhoto(file);
        urls.push(url);
      }
      setForm(f=>({...f,photos:[...(f.photos||[]),...urls]}));
      if(urls.length) showToast(`${urls.length} photo(s) uploaded ✓`,"success");
    }catch(err){showToast("Photo upload failed: "+err.message,"error");}
    setPhotoLoading(false);
    e.target.value="";
  };
  const rmPhoto=(i)=>setForm(f=>({...f,photos:f.photos.filter((_,idx)=>idx!==i)}));
  const validate=()=>{const e={};if(!form.title)e.title="Required";if(!form.location)e.location="Required";if(!form.propertyType)e.propertyType="Required";if(!form.listingType)e.listingType="Required";if(!form.price)e.price="Required";if(!form.description||!form.description.trim())e.description="Description is required";if(!form.photos?.length)e.photos="At least 1 photo is required";setErrs(e);return !Object.keys(e).length;};
  const doSave=async()=>{
    setSaving(true);
    try{
      if(isEdit){
        const {error}=await supabase.from("listings").update(formToDb(form,currentUser.id)).eq("id",listingId);
        if(error) throw error;
      } else {
        const {error}=await supabase.from("listings").insert(formToDb(form,currentUser.id));
        if(error) throw error;
      }
      showToast(isEdit?"Listing updated!":"Listing created!","success");
      onSaved();
    }catch(err){showToast("Save failed: "+err.message,"error");}
    setSaving(false);
  };
  const handleSave=async()=>{
    if(!validate()){showToast("Please fill required fields","error");return;}
    if(!isEdit){
      const dups=findDups(form,allListings.map(mapListing),null);
      if(dups.length>0){setDupModal(dups);return;}
    }
    await doSave();
  };
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"28px 20px"}}>
      {dupModal&&<DupModal dups={dupModal} onProceed={()=>{setDupModal(null);doSave();}} onCancel={()=>setDupModal(null)} />}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onBack} className="btn-ghost" style={{padding:"7px 16px",borderRadius:9,fontSize:13}}>← Back</button>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,color:"var(--navy)",margin:0}}>{isEdit?"Edit":"New"} Listing</h1>
      </div>
      <FormSec title="📌 Basic Info">
        <div style={{gridColumn:"1/-1",marginBottom:13}}><label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>Property Title *</label><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. 2BHK Apartment in Bandra West" className="inp" style={{borderColor:errs.title?"#FCA5A5":"var(--border)"}} />{errs.title&&<div style={{fontSize:11,color:"#DC2626",marginTop:3}}>{errs.title}</div>}</div>
        <FI label="Location *" k="location" form={form} set={set} placeholder="Area, City" err={errs.location}/>
        <FS label="Property Type *" k="propertyType" form={form} set={set} opts={["Apartment","Villa","Plot","Commercial"]}/>
        <FS label="Listing Type *" k="listingType" form={form} set={set} opts={["Rent","Sale"]}/>
        <FI label={form.listingType==="Rent"?"Monthly Rent ₹ *":"Sale Price ₹ *"} k="price" form={form} set={set} type="number" err={errs.price}/>
        <FI label="Size (sqft)" k="sizesqft" form={form} set={set} type="number"/>
      </FormSec>
      <FormSec title="🏠 Property Details">
        <FS label="Bedrooms" k="bedrooms" form={form} set={set} opts={["1","2","3","4","5","6"]}/>
        <FS label="Bathrooms" k="bathrooms" form={form} set={set} opts={["1","2","3","4","5"]}/>
        <FS label="Furnishing" k="furnishingStatus" form={form} set={set} opts={["Furnished","Semi-Furnished","Unfurnished"]}/>
        <FS label="Condition" k="condition" form={form} set={set} opts={["New","Under Construction","Resale","Renovation"]}/>
        <FI label="Built Year" k="builtYear" form={form} set={set} type="number" placeholder="e.g. 2018"/>
        <FS label="Parking" k="parkingType" form={form} set={set} opts={["Covered","Open","No Parking"]}/>
        <FS label="Vastu" k="vastuDirection" form={form} set={set} opts={["East","West","North","South","Not Applicable"]}/>
        <FI label="Total Floors" k="totalFloors" form={form} set={set} type="number"/>
        <FI label="Property Floor" k="propertyFloor" form={form} set={set} type="number"/>
        <FI label="Carpet Area (sqft)" k="carpetArea" form={form} set={set} type="number"/>
      </FormSec>
      <FormSec title="🏢 Society & Compliance">
        <FI label="Society Name" k="societyFormed" form={form} set={set}/>
        <FI label="Maintenance ₹/mo" k="maintenance" form={form} set={set} type="number"/>
        <FS label="OC Received" k="ocReceived" form={form} set={set} opts={["Yes","No","Applied"]}/>
        <FS label="RERA Registered" k="reraRegistered" form={form} set={set} opts={["Yes","No","Exempt"]}/>
        {form.reraRegistered==="Yes"&&<FI label="RERA Number" k="reraNumber" form={form} set={set} span/>}
      </FormSec>
      <div className="card-flat" style={{padding:"20px 22px",marginBottom:14}}>
        <h3 style={{margin:"0 0 14px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",paddingBottom:9}}>📝 Description *</h3>
        <textarea value={form.description||""} onChange={e=>set("description",e.target.value)} placeholder="Describe the property — highlights, neighbourhood, amenities…" className="inp" rows={4} style={{resize:"vertical",borderColor:errs.description?"#FCA5A5":"var(--border)"}}/>
        {errs.description&&<div style={{fontSize:11,color:"#DC2626",marginTop:4}}>{errs.description}</div>}
      </div>
      <div className="card-flat" style={{padding:"20px 22px",marginBottom:14}}>
        <h3 style={{margin:"0 0 14px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",paddingBottom:9}}>✨ Key Highlights</h3>
        <div style={{display:"flex",gap:8,marginBottom:10}}><input value={hl} onChange={e=>setHl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addHl())} placeholder="e.g. Sea View" className="inp"/><button onClick={addHl} className="btn-green" style={{padding:"10px 16px",borderRadius:10,fontSize:13,whiteSpace:"nowrap"}}>+ Add</button></div>
        {(form.highlights||[]).map((h,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"var(--green-light)",borderRadius:8,marginBottom:5,border:"1px solid var(--green-mid)"}}><span style={{fontSize:13,color:"var(--text)"}}>{h}</span><button onClick={()=>rmHl(i)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:16}}>×</button></div>)}
      </div>
      <FormSec title="👤 Agent Contact">
        <FI label="Agent Name" k="agentName" form={form} set={set}/>
        <FI label="Phone" k="agentPhone" form={form} set={set} type="tel"/>
        <FI label="Agency Name" k="agencyName" form={form} set={set}/>
        <FI label="Email" k="agentEmail" form={form} set={set} type="email"/>
      </FormSec>
      <div className="card-flat" style={{padding:"20px 22px",marginBottom:14}}>
        <h3 style={{margin:"0 0 14px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",paddingBottom:9}}>📸 Photos * (min 1, max 10)</h3>
        {photoLoading&&<div style={{textAlign:"center",padding:"16px",color:"var(--green)",fontWeight:600,fontSize:13}}>⬆ Uploading photos… please wait</div>}
        {(form.photos||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>{form.photos.map((p,i)=><div key={i} style={{position:"relative"}}><img src={p} alt="" style={{width:100,height:80,objectFit:"cover",borderRadius:8,border:"1px solid var(--border)"}}/><button onClick={()=>rmPhoto(i)} style={{position:"absolute",top:-6,right:-6,background:"#DC2626",color:"#fff",border:"none",borderRadius:"50%",width:20,height:20,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>)}</div>}
        <input type="file" ref={fileRef} multiple accept="image/*" onChange={handlePhotos} style={{display:"none"}}/>
        <button onClick={()=>fileRef.current?.click()} disabled={photoLoading} className="btn-ghost" style={{padding:"10px 20px",borderRadius:10,fontSize:13,borderColor:errs.photos?"#FCA5A5":"var(--border)"}}>📁 {photoLoading?"Uploading…":"Choose Photos"}</button>
        {errs.photos&&<div style={{fontSize:11,color:"#DC2626",marginTop:6}}>{errs.photos}</div>}
      </div>
      <div className="card-flat" style={{padding:"16px 22px",marginBottom:24}}>
        <h3 style={{margin:"0 0 12px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1}}>Status</h3>
        <div style={{display:"flex",gap:8}}>{["Active","Rented","Sold"].map(s=><button key={s} onClick={()=>set("status",s)} style={{padding:"8px 18px",borderRadius:9,border:`2px solid ${form.status===s?"var(--green)":"var(--border)"}`,background:form.status===s?"var(--green-light)":"var(--white)",color:form.status===s?"var(--green2)":"var(--muted)",fontWeight:700,fontSize:13,cursor:"pointer"}}>{s}</button>)}</div>
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
        <button onClick={onBack} className="btn-ghost" style={{padding:"12px 24px",borderRadius:10,fontSize:14}}>Cancel</button>
        <button onClick={handleSave} disabled={saving||photoLoading} className="btn-primary" style={{padding:"12px 28px",borderRadius:10,fontSize:14,display:"flex",alignItems:"center",gap:8}}>{saving?<><span className="spin"/>Saving…</>:(isEdit?"Save Changes":"Create Listing")}</button>
      </div>
    </div>
  );
};

// ── Agent Dashboard ──────────────────────────────────────────────
const AgentDash = ({currentUser,showToast}) => {
  const isSeller=currentUser.role==="seller";
  const maxListings=isSeller?2:9999;
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [view,setView]=useState("grid");const [editId,setEditId]=useState(null);const [modal,setModal]=useState(null);const [deleteTarget,setDeleteTarget]=useState(null);const [tab,setTab]=useState("listings");const [statusChanging,setStatusChanging]=useState(null);
  // Profile state
  const logoRef=useRef();
  const [profile,setProfile]=useState({agencyName:currentUser.agencyName||"",phone:currentUser.phone||"",address:currentUser.agentAddress||"",website:currentUser.agentWebsite||"",logoUrl:currentUser.logoUrl||null});
  const [logoLoading,setLogoLoading]=useState(false);const [profileSaving,setProfileSaving]=useState(false);
  const load=async()=>{
    setLoading(true);
    const {data,error}=await supabase.from("listings").select("*").eq("agent_id",currentUser.id).order("created_at",{ascending:false});
    if(!error) setListings(data||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  // #6 Quick status change
  const quickStatus=async(id,newStatus)=>{
    setStatusChanging(id);
    const {error}=await supabase.from("listings").update({status:newStatus}).eq("id",id);
    if(error){showToast("Update failed","error");}
    else{setListings(ls=>ls.map(l=>l.id===id?{...l,status:newStatus}:l));showToast(`Marked as ${newStatus} ✓`,"success");}
    setStatusChanging(null);
  };
  const delL=async(id)=>{
    const {error}=await supabase.from("listings").delete().eq("id",id);
    if(error){showToast("Delete failed: "+error.message,"error");return;}
    setListings(l=>l.filter(x=>x.id!==id));showToast("Listing deleted","success");setDeleteTarget(null);
  };
  const handleLogoUpload=async(e)=>{
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>2*1024*1024){showToast("Logo must be under 2MB","error");return;}
    setLogoLoading(true);
    try{const url=await uploadPhoto(file);setProfile(p=>({...p,logoUrl:url}));showToast("Logo uploaded ✓","success");}
    catch(err){showToast("Upload failed: "+err.message,"error");}
    setLogoLoading(false); e.target.value="";
  };
  const saveProfile=async()=>{
    setProfileSaving(true);
    try{
      const {error}=await supabase.from("profiles").update({agency_name:profile.agencyName,phone:profile.phone,logo_url:profile.logoUrl,address:profile.address,website:profile.website}).eq("id",currentUser.id);
      if(error) throw error;
      showToast("Profile saved ✓","success");
    }catch(err){showToast("Save failed: "+err.message,"error");}
    setProfileSaving(false);
  };
  const enrichedUser={...currentUser,...profile};
  if(editId!==undefined&&editId!==null) return <ListingForm currentUser={enrichedUser} listingId={editId} allListings={listings} showToast={showToast} onBack={()=>setEditId(null)} onSaved={()=>{setEditId(null);load();}}/>;
  if(view==="create") return <ListingForm currentUser={enrichedUser} listingId={null} allListings={listings} showToast={showToast} onBack={()=>setView("grid")} onSaved={()=>{setView("grid");load();}}/>;
  const stats=[["Total",listings.length,"📊"],["Active",listings.filter(l=>l.status==="Active").length,"✅"],["Rented",listings.filter(l=>l.status==="Rented").length,"🏠"],["Sold",listings.filter(l=>l.status==="Sold").length,"🏆"]];
  const canAddMore=listings.length<maxListings;
  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 20px"}}>
      {deleteTarget&&<ConfirmModal message={`Delete "${deleteTarget.title}"?`} onConfirm={()=>delL(deleteTarget.id)} onCancel={()=>setDeleteTarget(null)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",margin:0}}>{isSeller?"My Properties":"My Listings"}</h1>
          <p style={{fontSize:14,color:"var(--muted)",marginTop:4}}>{isSeller?`Individual seller · ${listings.length}/${maxListings} properties used`:"Manage and market your properties"}</p>
        </div>
        {canAddMore
          ?<button onClick={()=>setView("create")} className="btn-green" style={{padding:"11px 22px",borderRadius:11,fontSize:14}}>+ New Listing</button>
          :<div style={{background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:10,padding:"10px 16px",fontSize:13,color:"#92400E",fontWeight:600}}>⚠️ Limit reached ({maxListings}/{maxListings})</div>
        }
      </div>

      {/* Tabs — agents get Profile tab, sellers don't */}
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--gray)",padding:4,borderRadius:12,border:"1px solid var(--border)",width:"fit-content"}}>
        {[["listings","🏠 Listings"],...(!isSeller?[["profile","🏢 Profile"]]:[])].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 20px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",background:tab===t?"var(--white)":"transparent",color:tab===t?"var(--navy)":"var(--muted)",border:tab===t?"1px solid var(--border)":"none"}}>{l}</button>
        ))}
      </div>

      {tab==="listings"&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}} className="gr">
          {stats.map(([label,val,icon])=>(
            <div key={label} className="card" style={{padding:"20px 22px"}}>
              <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:800,color:"var(--navy)"}}>{val}</div>
              <div style={{fontSize:13,color:"var(--muted)",marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>
        {loading?<div style={{textAlign:"center",padding:48,color:"var(--muted)"}}>Loading…</div>:listings.length===0
          ?<div className="card" style={{padding:56,textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🏠</div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No listings yet</h3><p style={{color:"var(--muted)",marginBottom:20,fontSize:14}}>Create your first listing and start marketing it instantly.</p><button onClick={()=>setView("create")} className="btn-primary" style={{padding:"12px 28px",borderRadius:10,fontSize:14}}>+ Create First Listing</button></div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:20}} className="gr">
            {listings.map(raw=>{const l=mapListing(raw);return(
              <div key={l.id} className="card" style={{overflow:"hidden"}}>
                <div style={{height:160,background:"linear-gradient(135deg,var(--primary-light),var(--primary-mid))",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{fontSize:40,opacity:0.35}}>🏠</div>}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 60%)"}}/>
                  <span className="badge" style={{position:"absolute",top:10,left:10,background:"var(--primary-light)",color:"var(--primary)",border:"1px solid var(--primary-mid)"}}>{l.status}</span>
                  <span className="badge" style={{position:"absolute",top:10,right:10,background:"#fff",color:"var(--navy)",border:"1px solid var(--border)"}}>{l.listingType}</span>
                </div>
                <div style={{padding:"16px 18px"}}>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:800,color:"var(--primary)",marginBottom:2}}>{fmtP(l.price)}</div>
                  <h3 style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:4}}>{l.title}</h3>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:8}}>📍 {l.location}</div>
                  {/* #5 Enquiry counters */}
                  <div style={{display:"flex",gap:10,fontSize:11,marginBottom:10,padding:"6px 10px",background:"var(--gray)",borderRadius:8}}>
                    <span style={{color:"var(--muted)"}}>👁 {l.viewCount||0}</span>
                    <span style={{color:"#25D366",fontWeight:700}}>📲 {l.waCount||0} WA</span>
                    <span style={{color:"var(--muted)"}}>📄 {l.pdfCount||0} PDF</span>
                  </div>
                  {/* #6 Quick status */}
                  {l.status==="Active"?(
                    <div style={{display:"flex",gap:5,marginBottom:8}}>
                      <button onClick={()=>quickStatus(l.id,"Sold")} disabled={statusChanging===l.id} style={{flex:1,padding:"6px 2px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"#F5F3FF",border:"1px solid #DDD6FE",color:"#7C3AED",fontFamily:"inherit"}}>🏆 Sold</button>
                      <button onClick={()=>quickStatus(l.id,"Rented")} disabled={statusChanging===l.id} style={{flex:1,padding:"6px 2px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"#FFFBEB",border:"1px solid #FDE68A",color:"#D97706",fontFamily:"inherit"}}>🔑 Rented</button>
                      <button onClick={()=>quickStatus(l.id,"Inactive")} disabled={statusChanging===l.id} style={{flex:1,padding:"6px 2px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"var(--gray)",border:"1px solid var(--border)",color:"var(--muted)",fontFamily:"inherit"}}>⏸</button>
                    </div>
                  ):(
                    <div style={{marginBottom:8}}>
                      <button onClick={()=>quickStatus(l.id,"Active")} disabled={statusChanging===l.id} style={{width:"100%",padding:"6px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"var(--primary-light)",border:"1px solid var(--primary-mid)",color:"var(--primary)",fontFamily:"inherit"}}>▶ Re-activate</button>
                    </div>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
                    <button onClick={()=>setModal(l)} className="btn-ghost" style={{padding:"7px 4px",borderRadius:8,fontSize:11}}>View</button>
                    <button onClick={()=>setEditId(l.id)} className="btn-ghost" style={{padding:"7px 4px",borderRadius:8,fontSize:11}}>Edit</button>
                    <button onClick={()=>showWACard(l)} style={{padding:"7px 4px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}><WALogo size={10}/>WA</button>
                    <button onClick={()=>setDeleteTarget(l)} className="btn-danger" style={{padding:"7px 4px",borderRadius:8,fontSize:11}}>Del</button>
                  </div>
                </div>
              </div>
            );})}
          </div>
        }
      </>}

      {tab==="profile"&&!isSeller&&(
        <div style={{maxWidth:620}}>
          <div className="card" style={{padding:28,marginBottom:16}}>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:800,color:"var(--navy)",marginBottom:20}}>🏢 Agency / Firm Profile</h2>
            <p style={{fontSize:13,color:"var(--muted)",marginBottom:12,background:"var(--primary-light)",padding:"10px 14px",borderRadius:10,border:"1px solid var(--primary-mid)"}}>⭐ Your logo and details will appear as the <strong>header of every PDF brochure</strong> you generate.</p>
            {/* Public Page Link */}
            <div style={{background:"var(--gray)",borderRadius:10,padding:"12px 14px",marginBottom:20,border:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--navy)",marginBottom:2}}>🔗 Your Public Profile Page</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>{window.location.origin}?agent={currentUser.id}</div>
              </div>
              <button onClick={()=>{navigator.clipboard?.writeText(`${window.location.origin}?agent=${currentUser.id}`);showToast("Link copied! Share it on WhatsApp or Instagram bio ✓","success");}} style={{padding:"8px 16px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:"var(--primary)",color:"#fff",border:"none",fontFamily:"inherit",whiteSpace:"nowrap"}}>📋 Copy Link</button>
            </div>

            {/* Logo Upload */}
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>Company Logo</label>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:80,height:80,borderRadius:14,border:"2px dashed var(--border)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"var(--gray)",flexShrink:0}}>
                  {profile.logoUrl?<img src={profile.logoUrl} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:28,opacity:0.4}}>🏢</span>}
                </div>
                <div>
                  <input type="file" ref={logoRef} accept="image/*" onChange={handleLogoUpload} style={{display:"none"}}/>
                  <button onClick={()=>logoRef.current?.click()} disabled={logoLoading} className="btn-ghost" style={{padding:"9px 18px",borderRadius:9,fontSize:13,marginBottom:6}}>
                    {logoLoading?"Uploading…":"📁 Upload Logo"}
                  </button>
                  <div style={{fontSize:11,color:"var(--muted)"}}>PNG or JPG · Max 2MB · Square recommended</div>
                </div>
              </div>
            </div>

            {[["Agency / Firm Name","agencyName","e.g. Sharma Realty"],["Phone","phone","10-digit mobile"],["Office Address","address","Full office address"],["Website","website","https://yoursite.com"]].map(([label,key,placeholder])=>(
              <div key={key} style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>
                <input className="inp" placeholder={placeholder} value={profile[key]||""} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}/>
              </div>
            ))}

            <button onClick={saveProfile} disabled={profileSaving} className="btn-primary" style={{padding:"12px 28px",borderRadius:10,fontSize:14,display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              {profileSaving?<><span className="spin"/>Saving…</>:"Save Profile →"}
            </button>
          </div>

          {/* Preview */}
          <div className="card" style={{padding:20}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:12,textTransform:"uppercase",letterSpacing:0.5}}>PDF Header Preview</div>
            <div style={{background:"var(--gray)",borderRadius:12,padding:16,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {profile.logoUrl?<img src={profile.logoUrl} alt="" style={{width:52,height:52,objectFit:"contain",borderRadius:8,border:"1px solid var(--border)",background:"#fff"}}/>:<div style={{width:52,height:52,borderRadius:8,background:"var(--primary-light)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:"1px solid var(--primary-mid)"}}>🏢</div>}
                <div>
                  <div style={{fontWeight:800,fontSize:16,color:"var(--navy)"}}>{profile.agencyName||"Your Firm Name"}</div>
                  {profile.phone&&<div style={{fontSize:12,color:"var(--muted)"}}>📞 {profile.phone}</div>}
                  {profile.address&&<div style={{fontSize:11,color:"var(--muted)"}}>📍 {profile.address}</div>}
                  {profile.website&&<div style={{fontSize:11,color:"var(--primary)"}}>{profile.website}</div>}
                </div>
              </div>
              <div style={{textAlign:"right",fontSize:10,color:"var(--muted)"}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"var(--muted)"}}>PHENIQ</div>
                <div>Powered by Pheniq</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

// ── User Dashboard ───────────────────────────────────────────────
const UserDash = ({currentUser,showToast}) => {
  const [saved,setSaved]=useState([]);const [loading,setLoading]=useState(true);const [tab,setTab]=useState("saved");const [modal,setModal]=useState(null);
  useEffect(()=>{
    (async()=>{
      const {data,error}=await supabase.from("saved_listings").select("listings(*)").eq("user_id",currentUser.id);
      if(!error) setSaved((data||[]).map(r=>mapListing(r.listings)).filter(Boolean));
      setLoading(false);
    })();
  },[]);
  const unsave=async(id)=>{
    await supabase.from("saved_listings").delete().eq("user_id",currentUser.id).eq("listing_id",id);
    setSaved(s=>s.filter(l=>l.id!==id));
    showToast("Removed from saved","success");
  };
  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 20px"}}>
      <div style={{marginBottom:28}}><h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",margin:0}}>My Account</h1><p style={{fontSize:14,color:"var(--muted)",marginTop:4}}>Welcome back, {currentUser.name}</p></div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--gray)",padding:4,borderRadius:12,border:"1px solid var(--border)",width:"fit-content"}}>
        {[["saved","❤️ Saved"],["profile","👤 Profile"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 20px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",background:tab===t?"var(--white)":"transparent",color:tab===t?"var(--navy)":"var(--muted)",border:tab===t?"1px solid var(--border)":"none",boxShadow:tab===t?"0 1px 4px rgba(27,58,45,0.08)":"none"}}>{l}</button>)}
      </div>
      {tab==="saved"&&(
        loading?<div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Loading…</div>:saved.length===0?<div className="card" style={{padding:56,textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>💔</div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No saved listings</h3><p style={{color:"var(--muted)",fontSize:14}}>Browse properties and tap ❤️ to save them here.</p></div>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}} className="gr">
            {saved.map(l=>(
              <div key={l.id} className="card" style={{overflow:"hidden"}}>
                <div style={{height:155,background:"linear-gradient(135deg,#E8F5EE,#C2E8D4)",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{fontSize:36,opacity:0.3}}>🏠</div>}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(27,58,45,0.4) 0%,transparent 60%)"}}/>
                  <div style={{position:"absolute",bottom:10,left:12,fontSize:18,fontWeight:800,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{fmtP(l.price)}</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <h3 style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:3}}>{l.title}</h3>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>📍 {l.location}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                    <button onClick={()=>setModal(l)} className="btn-ghost" style={{padding:"7px",borderRadius:8,fontSize:11}}>View</button>
                    <button onClick={()=>showWACard(l)} style={{padding:"7px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}><WALogo size={10}/>WA</button>
                    <button onClick={()=>unsave(l.id)} className="btn-danger" style={{padding:"7px",borderRadius:8,fontSize:11}}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {tab==="profile"&&(
        <div className="card" style={{maxWidth:480,padding:28}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:20}}>Profile Info</h2>
          {[["Name",currentUser.name],["Email",currentUser.email],["Phone",currentUser.phone||"—"],["Role",currentUser.role]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid var(--border)",fontSize:14}}>
              <span style={{color:"var(--muted)",fontWeight:600}}>{k}</span>
              <span style={{fontWeight:700,color:"var(--navy)"}}>{v}</span>
            </div>
          ))}
        </div>
      )}
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

// ── Master Dashboard ─────────────────────────────────────────────
const MasterDash = ({showToast}) => {
  const [listings,setListings]=useState([]);const [agents,setAgents]=useState([]);const [users,setUsers]=useState([]);const [tab,setTab]=useState("overview");const [search,setSearch]=useState("");const [modal,setModal]=useState(null);const [loading,setLoading]=useState(true);const [deleteTarget,setDeleteTarget]=useState(null);
  useEffect(()=>{
    (async()=>{
      const [lr,ar,ur]=await Promise.all([
        supabase.from("listings").select("*").order("created_at",{ascending:false}),
        supabase.from("profiles").select("*").eq("role","agent"),
        supabase.from("profiles").select("*").eq("role","user"),
      ]);
      setListings(lr.data||[]);setAgents(ar.data||[]);setUsers(ur.data||[]);
      setLoading(false);
    })();
  },[]);
  const delL=async(id)=>{
    await supabase.from("listings").delete().eq("id",id);
    setListings(l=>l.filter(x=>x.id!==id));
    setDeleteTarget(null);showToast("Listing deleted","success");
  };
  const delU=async(id)=>{
    await supabase.from("profiles").update({role:"disabled"}).eq("id",id);
    setAgents(a=>a.filter(x=>x.id!==id));setUsers(u=>u.filter(x=>x.id!==id));
    showToast("User removed","success");
  };
  const filtered=listings.filter(l=>!search||(mapListing(l).title||"").toLowerCase().includes(search.toLowerCase())||(l.location||"").toLowerCase().includes(search.toLowerCase()));
  const tabs=[["overview","📊 Overview"],["analytics","🔥 Analytics"],["listings","🏠 Listings"],["agents","🏢 Agents"],["users","👥 Users"]];
  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 20px"}}>
      {deleteTarget&&<ConfirmModal message={`Delete "${deleteTarget.title}"? This cannot be undone.`} onConfirm={()=>delL(deleteTarget.id)} onCancel={()=>setDeleteTarget(null)}/>}
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",margin:0}}>Platform Control</h1>
        <p style={{fontSize:14,color:"var(--muted)",marginTop:4}}>Full platform visibility and management</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}} className="gr">
        {[["Total Listings",listings.length,"📋"],["Active",listings.filter(l=>l.status==="Active").length,"✅"],["Agents",agents.length,"🏢"],["Users",users.length,"👥"]].map(([l,v,i])=>(
          <div key={l} className="card" style={{padding:"20px 22px"}}><div style={{fontSize:24,marginBottom:8}}>{i}</div><div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:800,color:"var(--navy)"}}>{v}</div><div style={{fontSize:13,color:"var(--muted)",marginTop:2}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--gray)",padding:4,borderRadius:12,border:"1px solid var(--border)",overflowX:"auto"}}>
        {tabs.map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",background:tab===t?"var(--white)":"transparent",color:tab===t?"var(--navy)":"var(--muted)",border:tab===t?"1px solid var(--border)":"none",whiteSpace:"nowrap"}}>{l}</button>)}
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Loading…</div>:(
        <>
          {tab==="overview"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}} className="gr">
              <div className="card" style={{padding:24}}><h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:700,color:"var(--navy)",marginBottom:18}}>Top Agents</h3>{agents.sort((a,b)=>listings.filter(l=>l.agent_id===b.id).length-listings.filter(l=>l.agent_id===a.id).length).slice(0,5).map(a=>{const c=listings.filter(l=>l.agent_id===a.id).length;return(<div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}><div><div style={{fontSize:14,fontWeight:700,color:"var(--navy)"}}>{a.name}</div><div style={{fontSize:12,color:"var(--muted)"}}>{a.agency_name||"Independent"}</div></div><span className="badge tag">{c} listings</span></div>);})}</div>
              <div className="card" style={{padding:24}}><h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:700,color:"var(--navy)",marginBottom:18}}>Status Distribution</h3>{[["Active","#059669","#ECFDF5"],["Rented","#D97706","#FFFBEB"],["Sold","#7C3AED","#F5F3FF"]].map(([s,c,bg])=>{const n=listings.filter(l=>l.status===s).length;const p=listings.length?Math.round(n/listings.length*100):0;return(<div key={s} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5,fontWeight:600}}><span style={{color:"var(--muted)"}}>{s}</span><span style={{color:c}}>{n} ({p}%)</span></div><div style={{height:6,background:"var(--border)",borderRadius:3}}><div style={{height:"100%",width:`${p}%`,background:c,borderRadius:3,transition:"width 0.5s"}}/></div></div>);})}</div>
            </div>
          )}
          {tab==="analytics"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}} className="gr3">
                <div className="card" style={{padding:"20px 22px",borderTop:"3px solid #0ea5e9"}}>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:900,color:"var(--navy)",marginBottom:4}}>{listings.reduce((s,l)=>s+(l.view_count||0),0)}</div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>Total Views</div>
                </div>
                <div className="card" style={{padding:"20px 22px",borderTop:"3px solid #25D366"}}>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:900,color:"var(--navy)",marginBottom:4}}>{listings.reduce((s,l)=>s+(l.wa_count||0),0)}</div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>WhatsApp Taps</div>
                </div>
                <div className="card" style={{padding:"20px 22px",borderTop:"3px solid var(--primary)"}}>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:900,color:"var(--navy)",marginBottom:4}}>{listings.reduce((s,l)=>s+(l.pdf_count||0),0)}</div>
                  <div style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>PDF Opens</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:20}} className="gr">
                <div className="card" style={{padding:24}}>
                  <h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:700,color:"var(--navy)",marginBottom:16}}>Hottest Listings</h3>
                  {[...listings].sort((a,b)=>((b.view_count||0)+(b.wa_count||0)*2+(b.pdf_count||0))-((a.view_count||0)+(a.wa_count||0)*2+(a.pdf_count||0))).slice(0,8).map((raw,i)=>{
                    const l=mapListing(raw);
                    if(!l) return null;
                    return (
                      <div key={l.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
                        <span style={{width:22,fontWeight:800,color:"var(--muted)",fontSize:12,flexShrink:0}}>{i+1}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:"var(--navy)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</div>
                          <div style={{fontSize:11,color:"var(--muted)"}}>{l.agentName}</div>
                        </div>
                        <div style={{display:"flex",gap:6,fontSize:11,fontWeight:700,flexShrink:0}}>
                          <span style={{color:"#0ea5e9"}}>{l.viewCount}v</span>
                          <span style={{color:"#25D366"}}>{l.waCount}w</span>
                          <span style={{color:"var(--primary)"}}>{l.pdfCount}p</span>
                        </div>
                      </div>
                    );
                  })}
                  {listings.length===0&&<p style={{color:"var(--muted)",fontSize:13,marginTop:12}}>No data yet.</p>}
                </div>
                <div className="card" style={{padding:24}}>
                  <h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:700,color:"var(--navy)",marginBottom:16}}>Most WA Enquiries</h3>
                  {[...listings].filter(l=>(l.wa_count||0)>0).sort((a,b)=>(b.wa_count||0)-(a.wa_count||0)).slice(0,5).map((raw,i,arr)=>{
                    const l=mapListing(raw);
                    if(!l) return null;
                    const pct=arr[0].wa_count?Math.round((raw.wa_count||0)/arr[0].wa_count*100):0;
                    return (
                      <div key={l.id} style={{padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <div style={{fontSize:13,fontWeight:700,color:"var(--navy)",flex:1,paddingRight:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</div>
                          <span style={{fontWeight:900,color:"#25D366",flexShrink:0}}>{l.waCount}</span>
                        </div>
                        <div style={{fontSize:11,color:"var(--muted)",marginBottom:5}}>{l.agentName} - {fmtP(l.price)}</div>
                        <div style={{height:4,background:"var(--gray)",borderRadius:99}}>
                          <div style={{height:"100%",width:pct+"%",background:"#25D366",borderRadius:99}}/>
                        </div>
                      </div>
                    );
                  })}
                  {listings.filter(l=>(l.wa_count||0)>0).length===0&&<p style={{color:"var(--muted)",fontSize:13,marginTop:12}}>No WA taps recorded yet.</p>}
                </div>
              </div>
            </div>
          )}
          {tab==="listings"&&(
            <div>
              <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search listings…" className="inp" style={{maxWidth:340}}/><span style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>{filtered.length} results</span></div>
              <div className="card" style={{overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:650}}><thead><tr style={{background:"var(--navy)"}}>{["Title","Location","Agent","Type","Price","Status","Actions"].map(h=><th key={h} style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead><tbody>{filtered.map((raw,i)=>{const l=mapListing(raw);return(<tr key={l.id} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--white)":"var(--cream)"}}><td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"var(--navy)"}}>{l.title}</td><td style={{padding:"11px 14px",fontSize:12,color:"var(--muted)"}}>{l.location}</td><td style={{padding:"11px 14px",fontSize:12,color:"var(--muted)"}}>{l.agentName}</td><td style={{padding:"11px 14px"}}><span className="badge" style={{background:l.listingType==="Rent"?"#FFFBEB":"#ECFDF5",color:l.listingType==="Rent"?"#B45309":"#059669",border:"1px solid rgba(0,0,0,0.06)"}}>{l.listingType}</span></td><td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"var(--green2)",fontFamily:"'Fraunces',serif"}}>{fmtP(l.price)}</td><td style={{padding:"11px 14px"}}><span className="badge tag">{l.status}</span></td><td style={{padding:"11px 14px"}}><div style={{display:"flex",gap:5}}><button onClick={()=>setModal(l)} className="btn-ghost" style={{padding:"4px 9px",borderRadius:6,fontSize:11}}>View</button><button onClick={()=>showWACard(l)} style={{padding:"4px 9px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:3}}><WALogo size={10}/>WA</button><button onClick={()=>showPDF(l)} className="btn-ghost" style={{padding:"4px 9px",borderRadius:6,fontSize:11}}>📄</button><button onClick={()=>setDeleteTarget(l)} className="btn-danger" style={{padding:"4px 9px",borderRadius:6,fontSize:11}}>Del</button></div></td></tr>);})} </tbody></table></div>{filtered.length===0&&<div style={{textAlign:"center",padding:"36px",color:"var(--muted)"}}>No listings found</div>}</div>
            </div>
          )}
          {tab==="agents"&&(<div className="card" style={{overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:"var(--navy)"}}>{["Name","Email","Agency","Listings","Action"].map(h=><th key={h} style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead><tbody>{agents.map((a,i)=><tr key={a.id} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--white)":"var(--cream)"}}><td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:"var(--navy)"}}>{a.name}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{a.email}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{a.agency_name||"—"}</td><td style={{padding:"12px 14px"}}><span className="badge tag">{listings.filter(l=>l.agent_id===a.id).length} listings</span></td><td style={{padding:"12px 14px"}}><button onClick={()=>delU(a.id)} className="btn-danger" style={{padding:"5px 12px",borderRadius:7,fontSize:11}}>Remove</button></td></tr>)}</tbody></table>{agents.length===0&&<div style={{textAlign:"center",padding:32,color:"var(--muted)"}}>No agents yet</div>}</div>)}
          {tab==="users"&&(<div className="card" style={{overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:"var(--navy)"}}>{["Name","Email","Phone","Role","Action"].map(h=><th key={h} style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead><tbody>{users.map((u,i)=><tr key={u.id} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--white)":"var(--cream)"}}><td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:"var(--navy)"}}>{u.name}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{u.email}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{u.phone||"—"}</td><td style={{padding:"12px 14px"}}><span className="badge tag-navy">{u.role}</span></td><td style={{padding:"12px 14px"}}><button onClick={()=>delU(u.id)} className="btn-danger" style={{padding:"5px 12px",borderRadius:7,fontSize:11}}>Remove</button></td></tr>)}</tbody></table>{users.length===0&&<div style={{textAlign:"center",padding:32,color:"var(--muted)"}}>No users yet</div>}</div>)}
        </>
      )}
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

// ── Feed ─────────────────────────────────────────────────────────
const Feed = ({currentUser,showToast,onNavigate}) => {
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [savedIds,setSavedIds]=useState(currentUser?.savedListings||[]);const [filters,setFilters]=useState({search:"",propertyType:"",listingType:"",city:"",minPrice:"",maxPrice:"",bedrooms:"",furnishing:""});const [sort,setSort]=useState("newest");const [modal,setModal]=useState(null);const [open,setOpen]=useState(false);
  const requireAuth=(fn)=>(...args)=>{if(!currentUser){showToast("Please sign in to access this feature","error");onNavigate&&onNavigate("login");return;}fn(...args);};
  useEffect(()=>{
    (async()=>{
      const {data}=await supabase.from("listings").select("*").eq("status","Active").order("created_at",{ascending:false});
      setListings((data||[]).map(mapListing));setLoading(false);
    })();
  },[]);
  const setF=(k,v)=>setFilters(f=>({...f,[k]:v}));
  const clear=()=>setFilters({search:"",propertyType:"",listingType:"",city:"",minPrice:"",maxPrice:"",bedrooms:"",furnishing:""});
  const af=Object.values(filters).filter(v=>v).length;
  const cities=[...new Set(listings.map(l=>l.location?.split(",")[1]?.trim()).filter(Boolean))];
  const filtered=listings.filter(l=>{const f=filters;if(f.search&&!l.title?.toLowerCase().includes(f.search.toLowerCase())&&!l.location?.toLowerCase().includes(f.search.toLowerCase())) return false;if(f.propertyType&&l.propertyType!==f.propertyType) return false;if(f.listingType&&l.listingType!==f.listingType) return false;if(f.city&&!l.location?.includes(f.city)) return false;if(f.minPrice&&l.price<Number(f.minPrice)) return false;if(f.maxPrice&&l.price>Number(f.maxPrice)) return false;if(f.bedrooms&&Number(l.bedrooms)<Number(f.bedrooms)) return false;if(f.furnishing&&l.furnishingStatus!==f.furnishing) return false;return true;}).sort((a,b)=>sort==="price_asc"?a.price-b.price:sort==="price_desc"?b.price-a.price:new Date(b.createdAt)-new Date(a.createdAt));
  const handleSave=async(id)=>{
    if(!currentUser){showToast("Sign in to save listings","error");return;}
    if(currentUser.role!=="user"){showToast("Only seekers can save listings","error");return;}
    const isSaved=savedIds.includes(id);
    if(isSaved){await supabase.from("saved_listings").delete().eq("user_id",currentUser.id).eq("listing_id",id);setSavedIds(s=>s.filter(x=>x!==id));showToast("Removed from saved","success");}
    else{await supabase.from("saved_listings").insert({user_id:currentUser.id,listing_id:id});setSavedIds(s=>[...s,id]);showToast("Saved! ❤️","success");}
  };
  return (
    <div style={{minHeight:"100vh",background:"var(--cream)"}}>
      <div style={{background:"var(--navy)",padding:"80px 24px 110px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-100,right:-100,width:400,height:400,borderRadius:"50%",background:"rgba(61,170,126,0.1)"}} className="af"/>
        <div style={{maxWidth:700,margin:"0 auto",position:"relative",textAlign:"center"}}>
          <span style={{fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:2,display:"block",marginBottom:12}}>India's Property Marketing Platform</span>
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:48,fontWeight:800,color:"#fff",marginBottom:16,lineHeight:1.1}} className="h1big">Find Your <span style={{color:"var(--green)"}}>Dream</span> Property</h1>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.6)",marginBottom:32}}>Browse verified listings from professional agents across India.</p>
          <div style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:8,display:"flex",gap:8,maxWidth:560,margin:"0 auto",backdropFilter:"blur(12px)"}}>
            <input value={filters.search} onChange={e=>setF("search",e.target.value)} placeholder="Search by location or title…" className="inp" style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff"}}/>
            <div style={{display:"flex",gap:6}} className="hm">
              {["Apartment","Villa","Commercial"].map(t=><button key={t} onClick={()=>setF("propertyType",filters.propertyType===t?"":t)} style={{padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:filters.propertyType===t?"var(--green)":"rgba(255,255,255,0.08)",color:"#fff",border:`1px solid ${filters.propertyType===t?"var(--green)":"rgba(255,255,255,0.15)"}`,transition:"all 0.2s"}}>{t}</button>)}
            </div>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1180,margin:"-50px auto 0",padding:"0 20px 60px",position:"relative"}}>
        <div className="card" style={{padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <button onClick={()=>setOpen(o=>!o)} style={{padding:"8px 16px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",background:open?"var(--navy)":"var(--gray)",color:open?"#fff":"var(--text)",border:`1px solid ${open?"var(--navy)":"var(--border)"}`,transition:"all 0.2s"}}>
              🔍 Filters {af>0&&<span style={{background:open?"rgba(255,255,255,0.2)":"var(--green-light)",color:open?"#fff":"var(--green)",borderRadius:10,padding:"1px 7px",fontSize:11,marginLeft:4}}>{af}</span>}
            </button>
            {af>0&&<button onClick={clear} style={{fontSize:12,color:"var(--muted)",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Clear all</button>}
            <span style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>{loading?"Loading…":`${filtered.length} ${filtered.length===1?"property":"properties"} found`}</span>
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="inp" style={{width:"auto",fontSize:13}}>
            <option value="newest">Newest First</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        {open&&(
          <div className="card" style={{padding:"20px 24px",marginBottom:20,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px 20px"}} className="gr">
            <FS label="City" k="city" form={filters} set={setF} opts={cities}/>
            <FS label="Property Type" k="propertyType" form={filters} set={setF} opts={["Apartment","Villa","Plot","Commercial"]}/>
            <FS label="Listing Type" k="listingType" form={filters} set={setF} opts={["Rent","Sale"]}/>
            <FS label="Min Beds" k="bedrooms" form={filters} set={setF} opts={["1","2","3","4","5"]}/>
            <FI label="Min Price ₹" k="minPrice" form={filters} set={setF} type="number"/>
            <FI label="Max Price ₹" k="maxPrice" form={filters} set={setF} type="number"/>
            <FS label="Furnishing" k="furnishing" form={filters} set={setF} opts={["Furnished","Semi-Furnished","Unfurnished"]}/>
          </div>
        )}
        {loading?<div style={{textAlign:"center",padding:80,color:"var(--muted)"}}>Loading listings…</div>:filtered.length===0?<div className="card" style={{padding:56,textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🔍</div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No properties found</h3><p style={{color:"var(--muted)",fontSize:14,marginBottom:16}}>Try adjusting your filters.</p><button onClick={clear} className="btn-outline" style={{padding:"10px 24px",borderRadius:10,fontSize:13}}>Clear Filters</button></div>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:24}} className="gr">
            {filtered.map(l=><PropCard key={l.id} listing={l} currentUser={currentUser} savedIds={savedIds} onSave={handleSave} onView={setModal}/>)}
          </div>
        )}
      </div>
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

// ── Home Page ────────────────────────────────────────────────────
const Home = ({currentUser,onNavigate}) => {
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState({type:"",listing:"",location:""});
  const [waListing,setWAListing]=useState(null);const [pdfListing,setPdfListing]=useState(null);const [modal,setModal]=useState(null);
  useEffect(()=>{
    (async()=>{
      const {data}=await supabase.from("listings").select("*").eq("status","Active").order("created_at",{ascending:false}).limit(24);
      setListings((data||[]).map(mapListing).filter(Boolean));
      setLoading(false);
    })();
  },[]);
  const filtered=listings.filter(l=>{
    if(filter.type&&l.propertyType!==filter.type) return false;
    if(filter.listing&&l.listingType!==filter.listing) return false;
    if(filter.location&&!l.location?.toLowerCase().includes(filter.location.toLowerCase())) return false;
    return true;
  });
  const testimonials=[
    {name:"Ravi Sharma",agency:"Sharma Realty, Mumbai",text:"Generated my first brochure in 2 minutes. Clients were blown away!"},
    {name:"Priya Nair",agency:"NRI Homes, Pune",text:"WhatsApp cards get shared instantly. More enquiries same day."},
    {name:"Deepika Joshi",agency:"REO Properties",text:"RERA fields, Vastu, BHK — everything an Indian agent needs."},
  ];
  return (
    <div style={{background:"var(--cream)"}}>

      {/* ── ANNOUNCEMENT RIBBON ── */}
      <div style={{background:"var(--primary)",padding:"10px 24px",textAlign:"center",display:"flex",alignItems:"center",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
        <span style={{color:"#fff",fontSize:13,fontWeight:600}}>✨ <strong>India's first instant property brochure platform</strong> — PDF + WhatsApp card in under 2 minutes</span>
        <button onClick={()=>onNavigate(currentUser?"dashboard":"login")} style={{background:"rgba(255,255,255,0.2)",border:"1px solid rgba(255,255,255,0.4)",color:"#fff",padding:"4px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>{currentUser?"Open Dashboard →":"Sign Up Free →"}</button>
      </div>

      {/* ── HERO (compact) ── */}
      <section style={{background:"#fff",padding:"48px 24px 40px",textAlign:"center",borderBottom:"1px solid var(--border)"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--primary-light)",color:"var(--primary)",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:18,border:"1px solid var(--primary-mid)"}}>🇮🇳 Built for Indian Real Estate</div>
        <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:900,fontSize:52,color:"var(--navy)",lineHeight:1.08,marginBottom:14,letterSpacing:"-1px"}} className="h1big">
          <ShinyText text="Buy, Sell & Rent" color="#1a1410" shineColor="#FF6B00" speed={3.5} spread={180}/>{" "}
          <span style={{color:"var(--primary)"}}><ShinyText text="Properties" color="#FF6B00" shineColor="#ffb366" speed={2.5} spread={140}/></span>
        </h1>
        <p style={{fontSize:16,color:"var(--muted)",maxWidth:560,margin:"0 auto 24px",lineHeight:1.7}}>Verified listings with instant PDF brochures and WhatsApp cards — for buyers, sellers, and agents.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={()=>onNavigate(currentUser?"dashboard":"login")} className="btn-green" style={{padding:"13px 28px",borderRadius:12,fontSize:15}}>
            {currentUser?"Go to Dashboard →":"List Your Property →"}
          </button>
          <button onClick={()=>document.getElementById("prop-grid")?.scrollIntoView({behavior:"smooth"})} className="btn-outline" style={{padding:"13px 24px",borderRadius:12,fontSize:15}}>Browse Properties ↓</button>
        </div>
      </section>

      {/* ── PROPERTY GRID ── */}
      <section id="prop-grid" style={{padding:"40px 24px",maxWidth:1180,margin:"0 auto"}}>
        {/* Filters */}
        <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:800,color:"var(--navy)"}}>
            {loading?"Loading…":`${filtered.length} Propert${filtered.length!==1?"ies":"y"} Available`}
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <input className="inp" placeholder="🔍 Search location…" value={filter.location} onChange={e=>setFilter(f=>({...f,location:e.target.value}))} style={{width:180,padding:"8px 12px",fontSize:13}}/>
            <select className="inp" value={filter.listing} onChange={e=>setFilter(f=>({...f,listing:e.target.value}))} style={{width:130,padding:"8px 12px",fontSize:13}}>
              <option value="">All Types</option>
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
            </select>
            <select className="inp" value={filter.type} onChange={e=>setFilter(f=>({...f,type:e.target.value}))} style={{width:150,padding:"8px 12px",fontSize:13}}>
              <option value="">All Properties</option>
              {["Apartment","Independent House","Villa","Plot","Office","Shop","Warehouse"].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            {(filter.type||filter.listing||filter.location)&&<button onClick={()=>setFilter({type:"",listing:"",location:""})} style={{padding:"8px 14px",borderRadius:9,background:"var(--primary-light)",color:"var(--primary)",border:"1px solid var(--primary-mid)",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✕ Clear</button>}
          </div>
        </div>

        {/* Cards */}
        {loading?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}} className="gr">
            {[1,2,3,4,5,6].map(i=><div key={i} style={{height:280,borderRadius:16,background:"linear-gradient(90deg,#f0f0f0 25%,#fafafa 50%,#f0f0f0 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>)}
          </div>
        ):filtered.length===0?(
          <div className="card" style={{padding:56,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>🏘️</div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No properties found</h3>
            <p style={{color:"var(--muted)",fontSize:14}}>Try clearing your filters or check back soon.</p>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}} className="gr">
            {filtered.map(l=>(
              <div key={l.id} className="card" style={{overflow:"hidden",cursor:"pointer"}} onClick={()=>setModal(l)}>
                <div style={{height:190,background:"linear-gradient(135deg,var(--primary-light),var(--primary-mid))",position:"relative",overflow:"hidden"}}>
                  {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,opacity:0.3}}>🏠</div>}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)"}}/>
                  <span style={{position:"absolute",top:10,left:10,background:l.listingType==="Sale"?"var(--primary)":"#0ea5e9",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{l.listingType==="Sale"?"For Sale":"For Rent"}</span>
                  <div style={{position:"absolute",bottom:12,left:12,right:12}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:"#fff"}}>{fmtP(l.price)}{l.listingType==="Rent"&&<span style={{fontSize:12,fontWeight:400,opacity:0.8}}>/mo</span>}</div>
                  </div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <h3 style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:3,lineHeight:1.3}}>{l.title}</h3>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>📍 {l.location}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                    {l.bedrooms>0&&<span style={{fontSize:11,fontWeight:600,color:"var(--muted)",background:"var(--gray)",padding:"3px 8px",borderRadius:6}}>🛏 {l.bedrooms} Bed</span>}
                    {l.bathrooms>0&&<span style={{fontSize:11,fontWeight:600,color:"var(--muted)",background:"var(--gray)",padding:"3px 8px",borderRadius:6}}>🚿 {l.bathrooms} Bath</span>}
                    {l.sizesqft&&<span style={{fontSize:11,fontWeight:600,color:"var(--muted)",background:"var(--gray)",padding:"3px 8px",borderRadius:6}}>📐 {l.sizesqft} sqft</span>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setWAListing(l)} style={{padding:"8px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><WALogo size={12}/>WhatsApp</button>
                    <button onClick={()=>{if(!currentUser){alert("Please sign in to download PDF");onNavigate("login");return;}setPdfListing(l);}} className="btn-primary" style={{padding:"8px",borderRadius:9,fontSize:12,border:"none"}}>📄 PDF</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SELL YOUR PROPERTY CTA ── */}
      <section style={{background:"#fff",padding:"60px 24px",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)"}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}} className="gr">
          {[
            {icon:"🏠",title:"Selling or Renting?",desc:"List your property in minutes. Individual sellers get 2 free listings. Instant PDF brochure included.",cta:"List My Property",role:"seller"},
            {icon:"🏢",title:"Real Estate Agent?",desc:"Unlimited listings, white-label PDF with your firm's logo, and WhatsApp cards. Built for professionals.",cta:"Join as Agent",role:"agent"},
          ].map(({icon,title,desc,cta})=>(
            <div key={title} style={{background:"var(--primary-light)",border:"1px solid var(--primary-mid)",borderRadius:20,padding:"28px 24px",display:"flex",gap:16,alignItems:"flex-start"}}>
              <div style={{width:52,height:52,borderRadius:14,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{icon}</div>
              <div>
                <h3 style={{fontFamily:"'Fraunces',serif",fontSize:19,fontWeight:800,color:"var(--navy)",marginBottom:6}}>{title}</h3>
                <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:14}}>{desc}</p>
                <button onClick={()=>onNavigate(currentUser?"dashboard":"login")} className="btn-primary" style={{padding:"9px 20px",borderRadius:10,fontSize:13,border:"none"}}>{cta} →</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{background:"var(--cream)",padding:"60px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <span style={{fontSize:11,fontWeight:800,color:"var(--primary)",textTransform:"uppercase",letterSpacing:2}}>Trusted by Agents Across India</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}} className="gr3">
            {testimonials.map((t,i)=>(
              <div key={i} className="card" style={{padding:24}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:15,flexShrink:0}}>{t.name.charAt(0)}</div>
                  <div><div style={{fontWeight:700,fontSize:13,color:"var(--navy)"}}>{t.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{t.agency}</div></div>
                </div>
                <div style={{fontSize:13,marginBottom:8}}>⭐⭐⭐⭐⭐</div>
                <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.7,fontStyle:"italic"}}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{background:"var(--navy)",padding:"36px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,background:"var(--primary)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:900,fontFamily:"'Fraunces',serif",fontSize:15}}>P</span></div>
            <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:18,color:"#fff"}}>PHENIQ</span>
          </div>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>© 2026 Pheniq · Professional Property Marketing · Made in India</p>
          <div style={{display:"flex",gap:20,fontSize:12,color:"rgba(255,255,255,0.3)"}}>
            <span style={{cursor:"pointer"}}>Privacy</span><span>·</span><span style={{cursor:"pointer"}}>Terms</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div style={{display:"none",position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid var(--border)",padding:"8px 0 12px",zIndex:200,justifyContent:"space-around"}} className="mob-nav">
        {[["🏠","Home","home"],["🔍","Browse","feed"],["➕","Sell","dashboard"],["👤","Account","dashboard"]].map(([icon,label,pg])=>(
          <button key={label} onClick={()=>onNavigate(pg)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontFamily:"inherit",padding:"0 8px"}}>
            <span style={{fontSize:20}}>{icon}</span>
            <span style={{fontSize:10,fontWeight:700}}>{label}</span>
          </button>
        ))}
      </div>

  const testimonials=[
    {name:"Ravi Sharma",agency:"Sharma Realty, Mumbai",text:"Generated my first brochure in 2 minutes. My clients were blown away by how professional it looked!"},
    {name:"Priya Nair",agency:"NRI Homes, Pune",text:"WhatsApp cards are a game changer. Buyers share them instantly and I get more enquiries the same day."},
    {name:"Deepika Joshi",agency:"REO Properties",text:"Finally a platform built for Indian agents. RERA fields, Vastu, BHK — everything is already there."},
  ];
  const features=[
    {icon:"📄",title:"Instant PDF Brochures",desc:"Print-ready property brochures in seconds. Agent logo, contact and photos included."},
    {icon:"📱",title:"WhatsApp Cards",desc:"One-tap shareable cards with full property details. Buyers screenshot and share instantly."},
    {icon:"🔍",title:"Smart Duplicate Check",desc:"AI similarity scoring catches duplicate listings before they go live on the platform."},
  ];
  return (
    <div style={{background:"var(--cream)"}}>

      {/* Hero */}
      <section style={{background:"#fff",overflow:"hidden"}}>
        <div style={{maxWidth:1180,margin:"0 auto",padding:"72px 24px 80px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}} className="gr">
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"var(--primary-light)",color:"var(--primary)",padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:700,marginBottom:24,border:"1px solid var(--primary-mid)"}}>✨ The Future of Property Marketing is Here</div>
            <h1 style={{fontFamily:"'Fraunces',serif",fontWeight:900,fontSize:58,color:"var(--navy)",lineHeight:1.06,marginBottom:20,letterSpacing:"-1px"}} className="h1big">
              <ShinyText text="Transform Your" color="#1a1410" shineColor="#FF6B00" speed={4} spread={180}/><br/>
              <span style={{color:"var(--primary)"}}><ShinyText text="Property Marketing" color="#FF6B00" shineColor="#ffb366" speed={3} spread={160}/></span>
            </h1>
            <p style={{fontSize:17,color:"var(--muted)",lineHeight:1.8,marginBottom:36,maxWidth:480}}>Instant PDF brochures, WhatsApp cards, and verified listings — all in one platform built for Indian real estate agents.</p>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              <button onClick={()=>onNavigate(currentUser?"dashboard":"login")} className="btn-green" style={{padding:"16px 32px",borderRadius:14,fontSize:16,display:"flex",alignItems:"center",gap:8}}>
                {currentUser?"Go to Dashboard":"Get Started"} →
              </button>
              <button onClick={()=>onNavigate("feed")} className="btn-outline" style={{padding:"16px 28px",borderRadius:14,fontSize:16}}>Browse Properties</button>
            </div>
          </div>
          {/* Hero Visual */}
          <div style={{position:"relative"}}>
            <div style={{background:"linear-gradient(135deg,var(--primary-light) 0%,var(--primary-mid) 100%)",borderRadius:28,aspectRatio:"4/3",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"6px solid #fff",boxShadow:"0 24px 64px rgba(255,107,0,0.15)"}}>
              <div style={{textAlign:"center",padding:32}}>
                <div style={{fontSize:64,marginBottom:16}}>🏠</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:800,color:"var(--primary)",marginBottom:6}}>₹85.00 L</div>
                <div style={{fontSize:14,fontWeight:600,color:"var(--navy)",marginBottom:4}}>3BHK Premium Apartment</div>
                <div style={{fontSize:12,color:"var(--muted)"}}>📍 Bandra West, Mumbai</div>
              </div>
            </div>
            {/* Floating badge */}
            <div style={{position:"absolute",bottom:-18,left:-18,background:"#fff",padding:"14px 18px",borderRadius:18,boxShadow:"0 8px 32px rgba(0,0,0,0.12)",border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:10,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>✅</div>
              <div><div style={{fontSize:11,color:"var(--muted)",fontWeight:600}}>Brochure Ready</div><div style={{fontSize:15,fontWeight:800,color:"var(--navy)"}}>Under 2 minutes</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section style={{background:"var(--primary-light)",padding:"20px 24px",borderTop:"1px solid var(--primary-mid)",borderBottom:"1px solid var(--primary-mid)"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"center",gap:48,flexWrap:"wrap"}}>
          {[["500+","Listings"],["100+","Agents"],["2 min","Brochure Time"],["₹0","To Start"]].map(([v,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:900,color:"var(--primary)"}}>{v}</div>
              <div style={{fontSize:11,color:"var(--muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{background:"var(--cream)",padding:"80px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <span style={{fontSize:11,fontWeight:800,color:"var(--primary)",textTransform:"uppercase",letterSpacing:2}}>Trusted by Leading Agents</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}} className="gr3">
            {testimonials.map((t,i)=>(
              <div key={i} className="card" style={{padding:28}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:16,flexShrink:0}}>{t.name.charAt(0)}</div>
                  <div><div style={{fontWeight:700,fontSize:14,color:"var(--navy)"}}>{t.name}</div><div style={{fontSize:11,color:"var(--muted)"}}>{t.agency}</div></div>
                </div>
                <div style={{display:"flex",gap:2,marginBottom:12}}>{"⭐⭐⭐⭐⭐".split("").map((s,j)=><span key={j} style={{fontSize:13}}>{s}</span>)}</div>
                <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.7,fontStyle:"italic"}}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{background:"#fff",padding:"80px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:52}}>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:40,fontWeight:900,color:"var(--navy)",marginBottom:10}}>Powerful Tools for Modern Agents</h2>
            <p style={{fontSize:15,color:"var(--muted)",maxWidth:520,margin:"0 auto"}}>Everything you need to market properties and close deals — in one platform.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:32}} className="gr3">
            {features.map(({icon,title,desc})=>(
              <div key={title} style={{textAlign:"center",padding:"40px 28px",borderRadius:24,border:"1px solid var(--border)",transition:"all 0.2s",cursor:"default"}}
                onMouseEnter={e=>{e.currentTarget.style.background="var(--primary-light)";e.currentTarget.style.borderColor="var(--primary-mid)";}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="var(--border)";}}>
                <div style={{width:72,height:72,borderRadius:20,background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 20px",boxShadow:"0 8px 24px rgba(255,107,0,0.3)"}}>{icon}</div>
                <h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:800,color:"var(--navy)",marginBottom:10}}>{title}</h3>
                <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.7}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Efficiency Bar */}
      <section style={{background:"var(--cream)",padding:"80px 24px"}}>
        <div style={{maxWidth:860,margin:"0 auto",background:"#fff",borderRadius:32,boxShadow:"0 8px 40px rgba(255,107,0,0.1)",overflow:"hidden",border:"1px solid var(--border)"}}>
          <div style={{padding:"48px 52px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center"}} className="gr">
            <div>
              <h2 style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:900,color:"var(--navy)",lineHeight:1.2,marginBottom:14}}>Measure Your<br/><span style={{color:"var(--primary)"}}>Efficiency Boost</span></h2>
              <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.7,marginBottom:20}}>Agents using Pheniq save an average of 8 hours per listing — from photos to brochure to WhatsApp share.</p>
              {[["✅","Professional brochure in 2 minutes"],["✅","WhatsApp-ready card instantly"],["✅","RERA, Vastu & all Indian fields"]].map(([i,t])=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,fontSize:14,fontWeight:600,color:"var(--navy)"}}><span>{i}</span>{t}</div>
              ))}
            </div>
            <div>
              <div style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,marginBottom:6,color:"var(--muted)"}}><span>Manual (Canva + WhatsApp)</span><span>8+ hrs</span></div>
                <div style={{height:14,background:"var(--gray)",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:"100%",background:"#e2e8f0",borderRadius:99}}/></div>
              </div>
              <div style={{marginBottom:24}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,marginBottom:6,color:"var(--primary)"}}><span>With Pheniq</span><span>2 min</span></div>
                <div style={{height:14,background:"var(--primary-light)",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:"4%",background:"var(--primary)",borderRadius:99}}/></div>
              </div>
              <div style={{textAlign:"center",paddingTop:8,borderTop:"1px solid var(--border)"}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:36,fontWeight:900,color:"var(--primary)"}}>Save 8 hrs</div>
                <div style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>per listing on average</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{background:"var(--primary)",padding:"80px 24px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:42,fontWeight:900,color:"#fff",marginBottom:14}}>Ready to scale your business?</h2>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.75)",marginBottom:36}}>Join 100+ agents already closing faster with Pheniq.</p>
          <button onClick={()=>onNavigate(currentUser?"dashboard":"login")} style={{background:"#fff",color:"var(--primary)",padding:"18px 44px",borderRadius:18,fontSize:18,fontWeight:900,border:"none",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 8px 32px rgba(0,0,0,0.15)",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            {currentUser?"Open Dashboard →":"Start Free Today →"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:"var(--navy)",padding:"40px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,background:"var(--primary)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:900,fontFamily:"'Fraunces',serif",fontSize:15}}>P</span></div>
            <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:18,color:"#fff"}}>PHENIQ</span>
          </div>
          <p style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>© 2026 Pheniq · Professional Property Marketing · Made in India</p>
          <div style={{display:"flex",gap:20,fontSize:12,color:"rgba(255,255,255,0.3)"}}>
            <span style={{cursor:"pointer"}}>Privacy</span><span>·</span><span style={{cursor:"pointer"}}>Terms</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div style={{display:"none",position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid var(--border)",padding:"8px 0 12px",zIndex:200}} className="mob-nav">
        {[["🏠","Home","home"],["🔍","Browse","feed"],["👤","Account","dashboard"]].map(([icon,label,pg])=>(
          <button key={pg} onClick={()=>onNavigate(pg)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",color:pg==="home"?"var(--primary)":"var(--muted)",fontFamily:"inherit"}}>
            <span style={{fontSize:20}}>{icon}</span>
            <span style={{fontSize:10,fontWeight:700}}>{label}</span>
          </button>
        ))}
      </div>

      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
      {waListing&&<WACardModal listing={waListing} onClose={()=>setWAListing(null)}/>}
      {pdfListing&&<PDFModal listing={pdfListing} onClose={()=>setPdfListing(null)}/>}
    </div>
  );
};
const AgentPage = ({agentId,onNavigate,currentUser}) => {
  const [agent,setAgent]=useState(null);const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [modal,setModal]=useState(null);const [waL,setWaL]=useState(null);const [pdfL,setPdfL]=useState(null);const [copied,setCopied]=useState(false);
  useEffect(()=>{
    (async()=>{
      const [{data:a},{data:l}]=await Promise.all([
        supabase.from("profiles").select("*").eq("id",agentId).single(),
        supabase.from("listings").select("*").eq("agent_id",agentId).eq("status","Active").order("created_at",{ascending:false}),
      ]);
      setAgent(a);setListings((l||[]).map(mapListing).filter(Boolean));setLoading(false);
    })();
  },[agentId]);
  if(loading) return <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>Loading agent profile…</div>;
  if(!agent) return <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>Agent not found.</div>;
  const copyLink=()=>{navigator.clipboard?.writeText(`${window.location.origin}?agent=${agentId}`);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return (
    <div style={{background:"var(--cream)",minHeight:"100vh"}}>
      {/* Hero Banner */}
      <div style={{background:"var(--navy)",padding:"48px 24px 40px"}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
          <div style={{width:88,height:88,borderRadius:20,background:agent.logo_url?"#fff":"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"3px solid rgba(255,255,255,0.15)",flexShrink:0}}>
            {agent.logo_url?<img src={agent.logo_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{color:"#fff",fontWeight:900,fontFamily:"'Fraunces',serif",fontSize:36}}>{agent.name?.charAt(0)}</span>}
          </div>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Verified Agent · Pheniq</div>
            <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,color:"#fff",margin:"0 0 4px"}}>{agent.agency_name||agent.name}</h1>
            {agent.agency_name&&<div style={{fontSize:14,color:"rgba(255,255,255,0.5)",marginBottom:8}}>{agent.name}</div>}
            <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:6}}>
              {agent.phone&&<span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>📞 {agent.phone}</span>}
              {agent.address&&<span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>📍 {agent.address}</span>}
              {agent.website&&<a href={agent.website} target="_blank" rel="noreferrer" style={{fontSize:13,color:"var(--primary)",textDecoration:"none"}}>{agent.website}</a>}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"stretch",minWidth:160}}>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 16px",textAlign:"center",border:"1px solid rgba(255,255,255,0.12)"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:900,color:"#fff"}}>{listings.length}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:0.8}}>Active Listings</div>
            </div>
            <button onClick={copyLink} style={{padding:"9px 14px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:copied?"#059669":"var(--primary)",color:"#fff",border:"none",fontFamily:"inherit",transition:"background 0.2s"}}>{copied?"✅ Copied!":"🔗 Copy Profile Link"}</button>
            {agent.phone&&<a href={`https://wa.me/91${agent.phone}?text=${encodeURIComponent("Hi, I found your profile on Pheniq and would like to enquire about your properties.")}`} target="_blank" rel="noreferrer" style={{padding:"9px 14px",borderRadius:9,fontSize:12,fontWeight:700,background:"#25D366",color:"#fff",border:"none",fontFamily:"inherit",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><WALogo size={12}/>WhatsApp Agent</a>}
          </div>
        </div>
      </div>

      {/* Listings */}
      <div style={{maxWidth:960,margin:"0 auto",padding:"36px 24px"}}>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:800,color:"var(--navy)",marginBottom:20}}>{listings.length} Active Listing{listings.length!==1?"s":""}</h2>
        {listings.length===0
          ?<div className="card" style={{padding:48,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🏘️</div><p style={{color:"var(--muted)"}}>No active listings right now.</p></div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:20}} className="gr">
            {listings.map(l=>(
              <div key={l.id} className="card" style={{overflow:"hidden",cursor:"pointer"}} onClick={()=>setModal(l)}>
                <div style={{height:175,background:"linear-gradient(135deg,var(--primary-light),var(--primary-mid))",position:"relative",overflow:"hidden"}}>
                  {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,opacity:0.3}}>🏠</div>}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 55%)"}}/>
                  <span style={{position:"absolute",top:10,left:10,background:l.listingType==="Sale"?"var(--primary)":"#0ea5e9",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{l.listingType==="Sale"?"For Sale":"For Rent"}</span>
                  <div style={{position:"absolute",bottom:10,left:12,fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:"#fff"}}>{fmtP(l.price)}{l.listingType==="Rent"&&<span style={{fontSize:11,opacity:0.8}}>/mo</span>}</div>
                </div>
                <div style={{padding:"13px 15px"}}>
                  <h3 style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:3}}>{l.title}</h3>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>📍 {l.location}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                    {l.bedrooms>0&&<span style={{fontSize:10,fontWeight:600,color:"var(--muted)",background:"var(--gray)",padding:"3px 7px",borderRadius:6}}>🛏 {l.bedrooms}</span>}
                    {l.bathrooms>0&&<span style={{fontSize:10,fontWeight:600,color:"var(--muted)",background:"var(--gray)",padding:"3px 7px",borderRadius:6}}>🚿 {l.bathrooms}</span>}
                    {l.sizesqft&&<span style={{fontSize:10,fontWeight:600,color:"var(--muted)",background:"var(--gray)",padding:"3px 7px",borderRadius:6}}>📐 {l.sizesqft}sqft</span>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setWaL(l)} style={{padding:"8px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><WALogo size={12}/>WA</button>
                    <button onClick={()=>setPdfL(l)} className="btn-primary" style={{padding:"8px",borderRadius:9,fontSize:12,border:"none"}}>📄 PDF</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
      {waL&&<WACardModal listing={waL} onClose={()=>setWaL(null)}/>}
      {pdfL&&<PDFModal listing={pdfL} onClose={()=>setPdfL(null)}/>}
    </div>
  );
};

// ── Navbar ───────────────────────────────────────────────────────
const Nav = ({currentUser,page,onNavigate,onLogout,onSecretClick}) => {
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>10);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);
  return (
    <nav style={{position:"sticky",top:0,zIndex:100,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",background:"rgba(255,255,255,0.88)",backdropFilter:"blur(16px) saturate(180%)",borderBottom:"1px solid rgba(255,107,0,0.1)",transition:"all 0.3s",boxShadow:scrolled?"0 2px 16px rgba(255,107,0,0.08)":"none"}}>
      <button onClick={()=>{onNavigate("home");onSecretClick();}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:36,height:36,background:"var(--primary)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 12px rgba(255,107,0,0.3)"}}><span style={{color:"#fff",fontSize:17,fontWeight:900,fontFamily:"'Fraunces',serif"}}>P</span></div>
        <span style={{fontFamily:"'Fraunces',serif",fontWeight:800,fontSize:20,color:"var(--navy)",letterSpacing:"-0.5px"}}>PHENIQ</span>
      </button>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {["home","feed"].map(p=><button key={p} onClick={()=>onNavigate(p)} style={{padding:"7px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer",background:page===p?"var(--primary-light)":"transparent",color:page===p?"var(--primary)":"var(--muted)",border:"none",transition:"all 0.2s",textTransform:"capitalize"}}>{p==="feed"?"Browse":p}</button>)}
        {currentUser?<>
          <button onClick={()=>onNavigate("dashboard")} className="hm" style={{padding:"7px 14px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer",background:"transparent",color:"var(--muted)",border:"none"}}>{currentUser.role==="master"?"Control":currentUser.role==="agent"?"Listings":currentUser.role==="seller"?"My Properties":"Account"}</button>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--gray)",borderRadius:24,padding:"5px 12px 5px 5px",border:"1px solid var(--border)",cursor:"pointer"}} onClick={()=>onNavigate("dashboard")}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800}}>{currentUser.name?.charAt(0)}</div>
            <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}} className="hm">{currentUser.name?.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} style={{padding:"7px 13px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer",background:"var(--gray)",color:"var(--muted)",border:"1px solid var(--border)",transition:"all 0.2s"}}>Sign Out</button>
        </>:<>
          <button onClick={()=>onNavigate("login")} style={{padding:"7px 16px",borderRadius:9,fontWeight:600,fontSize:13,cursor:"pointer",background:"transparent",color:"var(--primary)",border:"none"}}>Log In</button>
          <button onClick={()=>onNavigate("login")} className="btn-green" style={{padding:"9px 20px",borderRadius:9,fontSize:13}}>Sign Up →</button>
        </>}
      </div>
    </nav>
  );
};

// ── App Root ─────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("home");
  const [agentPageId,setAgentPageId]=useState(null);
  const [user,setUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [toast,setToast]=useState(null);
  const [adminModal,setAdminModal]=useState(false);
  const [waListing,setWAListing]=useState(null);
  const [pdfListing,setPDFListing]=useState(null);

  useEffect(()=>{
    // Check for ?agent= URL param
    const params=new URLSearchParams(window.location.search);
    const agentParam=params.get("agent");
    if(agentParam){setAgentPageId(agentParam);setPage("agentpage");}
    // Restore session on page load
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(session){
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
        if(profile){
          const savedRes=await supabase.from("saved_listings").select("listing_id").eq("user_id",profile.id);
          const savedIds=(savedRes.data||[]).map(r=>r.listing_id);
          setUser({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,logoUrl:profile.logo_url||null,agentAddress:profile.address||null,agentWebsite:profile.website||null,savedListings:savedIds});
          if(!agentParam) setPage("dashboard");
        }
      }
      setAuthLoading(false);
    });
    _h.openWA=(l)=>setWAListing(l);
    _h.openPDF=(l)=>setPDFListing(l);
  },[]);

  const showToast=(msg,type="info")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  const nav=(p)=>{setPage(p);window.scrollTo(0,0);};
  const login=(u)=>{setUser(u);nav("dashboard");};
  const logout=async()=>{await supabase.auth.signOut();setUser(null);nav("home");showToast("Signed out successfully","success");};
  const secretTrigger=useSecretAdmin(()=>{if(!user||user.role!=="master") setAdminModal(true);});

  if(authLoading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--cream)",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{G}</style>
      <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",marginBottom:12}}>PHENIQ</div><div style={{width:28,height:28,border:"3px solid var(--border)",borderTopColor:"var(--green)",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}></div></div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"var(--cream)",color:"var(--text)"}}>
      <style>{G}</style>
      {page!=="login"&&<Nav currentUser={user} page={page} onNavigate={nav} onLogout={logout} onSecretClick={secretTrigger}/>}
      {page==="home"&&<Home currentUser={user} onNavigate={nav}/>}
      {page==="feed"&&<Feed currentUser={user} showToast={showToast} onNavigate={nav}/>}
      {page==="login"&&<LoginPage onLogin={login} showToast={showToast} onNavigate={nav}/>}
      {page==="agentpage"&&agentPageId&&<AgentPage agentId={agentPageId} onNavigate={nav} currentUser={user}/>}
      {page==="dashboard"&&user?.role==="agent"&&<AgentDash currentUser={user} showToast={showToast}/>}
      {page==="dashboard"&&user?.role==="seller"&&<AgentDash currentUser={user} showToast={showToast}/>}
      {page==="dashboard"&&user?.role==="user"&&<UserDash currentUser={user} showToast={showToast}/>}
      {page==="dashboard"&&user?.role==="master"&&<MasterDash showToast={showToast}/>}
      {page==="dashboard"&&!user&&<LoginPage onLogin={login} showToast={showToast} onNavigate={nav}/>}
      {adminModal&&<SecretAdminModal onLogin={login} onClose={()=>setAdminModal(false)} showToast={showToast}/>}
      {waListing&&<WACardModal listing={waListing} onClose={()=>setWAListing(null)}/>}
      {pdfListing&&<PDFModal listing={pdfListing} onClose={()=>setPDFListing(null)}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
  );
}
