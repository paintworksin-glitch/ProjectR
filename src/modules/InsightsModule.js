import { formatConversionRate } from "./brokerData";

const StatCard = ({ label, value }) => <div className="card-flat" style={{padding:12}}><div style={{fontSize:11,color:"var(--muted)"}}>{label}</div><div style={{fontSize:20,fontWeight:800,color:"var(--navy)"}}>{value}</div></div>;

const InsightsModule = ({ listings = [], leads = [] }) => {
  const totalViews = listings.reduce((s, l) => s + Number(l.view_count || l.viewCount || 0), 0);
  const totalShares = listings.reduce((s, l) => s + Number(l.wa_count || l.waCount || 0), 0);
  const totalLeads = leads.length;
  const closed = leads.filter((l) => l.stage === "Closed").length;
  const top = [...listings].sort((a, b) => Number((b.view_count||b.viewCount||0)+(b.wa_count||b.waCount||0)) - Number((a.view_count||a.viewCount||0)+(a.wa_count||a.waCount||0)))[0];

  return (
    <div style={{display:"grid",gap:12}}>
      <div className="card" style={{padding:14,display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}} className="gr">
        <StatCard label="Listing views" value={totalViews} />
        <StatCard label="Card shares" value={totalShares} />
        <StatCard label="Total leads" value={totalLeads} />
        <StatCard label="Conversion rate" value={formatConversionRate(closed, totalLeads)} />
      </div>
      <div className="card" style={{padding:14}}>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:4}}>Top performing listing</div>
        <div style={{fontWeight:800,fontSize:15}}>{top?.title || "No data"}</div>
      </div>
    </div>
  );
};

export default InsightsModule;
