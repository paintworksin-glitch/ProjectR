import { useMemo, useRef, useState } from "react";

const templates = {
  classic: { name: "Classic", bg: "linear-gradient(135deg,#1f2937,#111827)", fg: "#fff" },
  bright: { name: "Bright", bg: "linear-gradient(135deg,#fff7ed,#ffedd5)", fg: "#1a1410" },
  premium: { name: "Premium", bg: "linear-gradient(135deg,#312e81,#0f172a)", fg: "#fff" },
};

const MarketModule = ({ listings = [], brand }) => {
  const [listingId, setListingId] = useState(listings[0]?.id || "");
  const [template, setTemplate] = useState("classic");
  const [brandColor, setBrandColor] = useState(brand?.color || "#1a1a1a");
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl || "");
  const cardRef = useRef();
  const listing = useMemo(() => listings.find((l) => l.id === listingId) || listings[0], [listings, listingId]);

  const exportPng = async () => {
    if (!cardRef.current) return;
    const html = cardRef.current;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1080'><foreignObject width='100%' height='100%'>${new XMLSerializer().serializeToString(html)}</foreignObject></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080; canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `market-card-${listing?.id||Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  if (!listing) return <div className="card" style={{padding:16}}>Create a listing first to build marketing cards.</div>;
  const t = templates[template];

  return (
    <div className="card" style={{padding:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:8,marginBottom:10}} className="gr">
        <select className="inp" value={listingId} onChange={e=>setListingId(e.target.value)}>{listings.map((l)=><option key={l.id} value={l.id}>{l.title}</option>)}</select>
        <select className="inp" value={template} onChange={e=>setTemplate(e.target.value)}>{Object.entries(templates).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select>
        <input className="inp" type="color" value={brandColor} onChange={e=>setBrandColor(e.target.value)} />
        <button className="btn-primary" onClick={exportPng} style={{borderRadius:10,padding:"0 12px"}}>Export PNG</button>
      </div>
      <input className="inp" placeholder="Brand logo URL (optional)" value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} style={{marginBottom:10}} />
      <div ref={cardRef} style={{width:"100%",aspectRatio:"1/1",borderRadius:16,padding:22,background:t.bg,color:t.fg,display:"flex",flexDirection:"column",justifyContent:"space-between",fontFamily:"Inter,sans-serif"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:900,fontSize:22}}>Northing Market</div>
          {logoUrl ? <img src={logoUrl} alt="" style={{width:56,height:56,objectFit:"contain",background:"#fff",borderRadius:8,padding:4}}/> : <div style={{background:brandColor,color:"#fff",padding:"8px 10px",borderRadius:8,fontWeight:800}}>BRAND</div>}
        </div>
        <div>
          <div style={{fontSize:36,fontWeight:900,lineHeight:1.1}}>{listing.title}</div>
          <div style={{marginTop:8,opacity:0.85}}>📍 {listing.location}</div>
          <div style={{marginTop:12,fontSize:34,fontWeight:900,color:brandColor}}>{`₹${Number(listing.price||0).toLocaleString("en-IN")}`}</div>
        </div>
        <div style={{fontSize:12,opacity:0.85}}>WhatsApp-ready · 1080x1080</div>
      </div>
    </div>
  );
};

export default MarketModule;
