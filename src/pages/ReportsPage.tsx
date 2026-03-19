import { useState, useEffect } from "react";
import { 
  Calendar, 
  TrendingUp, 
  Package, 
  Download,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  RefreshCw
} from "lucide-react";
import { reportsApi, type DailyReportDto, type TopProductDto, type HourlyReportDto } from "../api/reports.api";
import { useAuth } from "../context/AuthContext";

export default function ReportsPage() {
  const { user } = useAuth();
  const [dailyData, setDailyData] = useState<DailyReportDto[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductDto[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    if (!user?.branchId) return;
    setLoading(true);
    setError("");
    try {
      const [daily, top, hourly] = await Promise.all([
        reportsApi.getDaily(user.branchId, dateRange.from, dateRange.to),
        reportsApi.getTopProducts(user.branchId, 10),
        reportsApi.getHourly(user.branchId, dateRange.to)
      ]);
      
      setDailyData(Array.isArray(daily) ? daily : []);
      setTopProducts(Array.isArray(top) ? top : []);
      setHourlyData(Array.isArray(hourly) ? hourly : []);
    } catch (err: any) {
      setError("Failed to fetch detailed reports. Check connection to POS.Api.");
      setDailyData([]);
      setTopProducts([]);
      setHourlyData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.branchId, dateRange.from, dateRange.to]);

  const handleExportPdf = async () => {
    if (!user?.branchId) return;
    setExporting(true);
    
    try {
      // 1. Fetch raw binary using standard fetch for maximum transparency
      const token = localStorage.getItem("token");
      const apiUrl = `http://localhost:5277/api/reports/daily-pdf?branchId=${user.branchId}&date=${dateRange.to}`;
      
      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Server failed to generate report.");

      const blob = await response.blob();
      
      // 2. USE DATA URI APPROACH - This is the most robust way to force filename recognition 
      // when blob URIs are being stripped of their names by the OS/Browser.
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.setAttribute('download', `DailyReport_${dateRange.to}.pdf`);
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
        }, 1000);
      };

      reader.onerror = () => {
        alert("Failed to process report binary.");
      };

      reader.readAsDataURL(blob);

    } catch (err: any) {
      console.error("Critical Export Error:", err);
      alert("Failed to export PDF. Ensure the POS Backend is running and you have an active session.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-primary uppercase italic">Analytics Studio</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium tracking-tight">Enterprise business intelligence for Branch #{user?.branchId || "N/A"}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center bg-card border rounded-2xl p-1 shadow-sm">
             <input 
               type="date" 
               className="bg-transparent border-none outline-none px-3 py-2 text-xs font-bold uppercase"
               value={dateRange.from}
               onChange={e => setDateRange({...dateRange, from: e.target.value})}
             />
             <div className="w-4 h-px bg-muted mx-1" />
             <input 
               type="date" 
               className="bg-transparent border-none outline-none px-3 py-2 text-xs font-bold uppercase"
               value={dateRange.to}
               onChange={e => setDateRange({...dateRange, to: e.target.value})}
             />
           </div>
           
           <button 
             onClick={fetchData}
             className="p-3 bg-muted hover:bg-muted/80 rounded-2xl transition-all"
             title="Refresh Data"
           >
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
           </button>

           <button 
             disabled={exporting}
             onClick={handleExportPdf}
             className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
           >
             {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
             Export PDF
           </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-2xl flex items-center gap-3 text-destructive animate-in slide-in-from-top-4">
          <AlertCircle size={20} />
          <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-20 flex items-center justify-center flex-col gap-3">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-xs font-black text-primary animate-pulse tracking-[.5em] uppercase italic">Synthesizing Enterprise Data</p>
          </div>
        )}

        {/* Daily Sales Chart */}
        <div className="bg-card rounded-[2.5rem] border shadow-sm p-8 flex flex-col group hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 grayscale group-hover:grayscale-0 transition-all duration-700" />
           
           <div className="flex items-center justify-between mb-10 relative z-10">
             <h3 className="font-black flex items-center gap-3 uppercase tracking-tighter text-xl">
               <Calendar className="text-primary" size={24} />
               Revenue Trend
             </h3>
             <div className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest">Selected Period</div>
           </div>
          
           <div className="flex-1 flex items-end justify-between gap-3 h-64 min-h-[256px] px-2 relative z-10">
            {dailyData.length > 0 ? (
              dailyData.map((d, i) => {
                const max = Math.max(...dailyData.map(x => x.revenue), 1);
                const height = (d.revenue / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar">
                    <div className="relative w-full flex items-end justify-center">
                      <div 
                        style={{ height: `${height}%` }}
                        className="w-full max-w-[40px] bg-primary rounded-t-xl transition-all duration-1000 group-hover/bar:bg-primary/80 group-hover/bar:scale-x-110 relative shadow-lg shadow-primary/5"
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-black text-white px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap shadow-2xl z-20 pointer-events-none">
                          ${d.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase rotate-45 mt-4 origin-left truncate w-12 text-center group-hover/bar:text-primary transition-colors">
                      {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground italic text-xs gap-3">
                <FileText size={40} className="opacity-20" />
                No revenue data for this period.
              </div>
            )}
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-card rounded-[2.5rem] border shadow-sm p-8 flex flex-col group hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[5rem] -mr-8 -mt-8 grayscale group-hover:grayscale-0 transition-all duration-700" />
           
           <div className="flex items-center justify-between mb-10 relative z-10">
             <h3 className="font-black flex items-center gap-3 uppercase tracking-tighter text-xl">
               <Clock className="text-amber-600" size={24} />
               Hourly Traffic
             </h3>
             <div className="text-[10px] font-black bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest">Live: {dateRange.to}</div>
           </div>

           <div className="flex-1 grid grid-cols-12 gap-1 items-end h-64 px-2 relative z-10">
             {hourlyData.length > 0 ? (
               hourlyData.map((h, i) => {
                 const max = Math.max(...hourlyData.map(x => x.revenue), 1);
                 const height = (h.revenue / max) * 100;
                 return (
                   <div key={i} className="flex flex-col items-center gap-2 group/h">
                     <div 
                       style={{ height: `${height}%` }}
                       className="w-full bg-amber-500/20 group-hover/h:bg-amber-500 rounded-t-sm transition-all duration-700"
                     />
                     <span className="text-[8px] font-bold text-muted-foreground">{h.hour}h</span>
                   </div>
                 );
               })
             ) : (
               <div className="col-span-12 flex flex-col items-center justify-center text-muted-foreground italic text-xs gap-3">
                 <Clock size={40} className="opacity-20" />
                 No hourly traffic logged for today yet.
               </div>
             )}
           </div>
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-[2.5rem] border shadow-sm p-8 flex flex-col group hover:shadow-2xl transition-all duration-700 overflow-hidden relative">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="font-black flex items-center gap-3 uppercase tracking-tighter text-xl">
              <TrendingUp className="text-emerald-600" size={24} />
              Performance Leaders
            </h3>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Top 10 SKUs</span>
          </div>

          <div className="space-y-3 relative z-10 overflow-y-auto custom-scrollbar max-h-[400px] pr-2">
            {topProducts.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-5 p-5 rounded-3xl hover:bg-muted/50 transition-all border border-transparent hover:border-border group/item animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-12 h-12 bg-card border rounded-2xl flex items-center justify-center text-foreground font-black text-xs shadow-sm group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-black text-base tracking-tight group-hover/item:text-primary transition-colors">{p.productName}</div>
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[.2em] mt-1">{p.totalQtySold} Units Distributed</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg tracking-tighter text-emerald-600">${p.totalRevenue.toLocaleString()}</div>
                  <div className="text-[9px] font-black text-muted-foreground uppercase">Revenue Contribution</div>
                </div>
              </div>
            ))}
            
            {topProducts.length === 0 && (
              <div className="py-20 flex flex-col items-center gap-6 grayscale opacity-20">
                <Package size={64} className="animate-pulse" />
                <p className="text-xs font-black uppercase tracking-[.3em] italic">Inventory circulation zero</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Quick View */}
        <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl shadow-primary/30 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="relative z-10">
            <h3 className="text-white/60 font-black uppercase tracking-[.3em] text-xs mb-2">Aggregate Performance</h3>
            <h2 className="text-white text-4xl font-black tracking-tighter leading-tight">Branch Optimization <br/> & Scale Audit</h2>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-10 relative z-10">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all">
               <div className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Cumulative Rev</div>
               <div className="text-white text-2xl font-black tracking-tight">${dailyData.reduce((s,d) => s + d.revenue, 0).toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all">
               <div className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Order Volume</div>
               <div className="text-white text-2xl font-black tracking-tight">{dailyData.reduce((s,d) => s + d.orderCount, 0)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
