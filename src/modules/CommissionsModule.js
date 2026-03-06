import { useEffect, useMemo, useState } from "react";

const CommissionsModule = ({ supabase, brokerId, listings = [], showToast }) => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ property_id:"", deal_value:"", commission_amount:"", status:"pending" });

  const load = async () => {
    const { data, error } = await supabase.from("commissions").select("*").eq("broker_id", brokerId).order("created_at", { ascending: false });
    if (error) showToast(`Commissions load failed: ${error.message}`, "error");
    else setRows(data || []);
  };
  useEffect(() => { load(); }, [brokerId]);

  const totals = useMemo(() => ({
    paid: rows.filter(r=>r.status==="paid").reduce((s,r)=>s+Number(r.commission_amount||0),0),
    pending: rows.filter(r=>r.status!=="paid").reduce((s,r)=>s+Number(r.commission_amount||0),0),
  }), [rows]);

  const save = async () => {
    if (!form.property_id || !form.deal_value || !form.commission_amount) return showToast("Complete deal details", "error");
    const payload = { ...form, broker_id: brokerId, deal_value: Number(form.deal_value), commission_amount: Number(form.commission_amount) };
    const { data, error } = await supabase.from("commissions").insert(payload).select("*").single();
    if (error) return showToast(error.message, "error");
    setRows((r)=>[data,...r]);
    setForm({ property_id:"", deal_value:"", commission_amount:"", status:"pending" });
  };

  return <div className="card" style={{padding:16}}>
    <div style={{fontWeight:800,marginBottom:8}}>Commission Tracker</div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:8}} className="gr">
      <select className="inp" value={form.property_id} onChange={e=>setForm(f=>({...f,property_id:e.target.value}))}><option value="">Select property</option>{listings.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select>
      <input className="inp" placeholder="Deal value" type="number" value={form.deal_value} onChange={e=>setForm(f=>({...f,deal_value:e.target.value}))}/>
      <input className="inp" placeholder="Commission" type="number" value={form.commission_amount} onChange={e=>setForm(f=>({...f,commission_amount:e.target.value}))}/>
      <select className="inp" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="pending">Pending</option><option value="paid">Paid</option></select>
      <button className="btn-primary" onClick={save} style={{borderRadius:10,padding:"0 12px"}}>Add</button>
    </div>
    <div style={{marginTop:10,fontSize:12,color:"var(--muted)"}}>Paid: ₹{totals.paid.toLocaleString("en-IN")} · Pending: ₹{totals.pending.toLocaleString("en-IN")}</div>
  </div>;
};

export default CommissionsModule;
