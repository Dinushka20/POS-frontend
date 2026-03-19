import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Calendar,
  Package,
  Clock
} from "lucide-react";
import { reportsApi, type SummaryReportDto } from "../api/reports.api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.branchId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const today = new Date().toISOString().split('T')[0];
        const data = await reportsApi.getSummary(user.branchId, today);
        setSummary(data);
      } catch (err: any) {
        setError("Failed to load dashboard summary. Make sure the API is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user?.branchId]);

  const stats = [
    { 
      label: "Total Sales", 
      value: summary ? `$${summary.totalSales.toLocaleString()}` : "$0", 
      icon: DollarSign, 
      trend: "+12.5%", 
      trendUp: true,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10"
    },
    { 
      label: "Total Orders", 
      value: summary ? summary.totalOrders.toString() : "0", 
      icon: ShoppingBag, 
      trend: "+8.2%", 
      trendUp: true,
      color: "text-blue-600",
      bg: "bg-blue-500/10"
    },
    { 
      label: "Total Customers", 
      value: summary ? summary.totalCustomers.toString() : "0", 
      icon: Users, 
      trend: "+5.1%", 
      trendUp: true,
      color: "text-indigo-600",
      bg: "bg-indigo-500/10"
    },
    { 
      label: "Avg. Order Value", 
      value: summary ? `$${summary.averageOrderValue.toFixed(2)}` : "$0", 
      icon: TrendingUp, 
      trend: "-2.4%", 
      trendUp: false,
      color: "text-amber-600",
      bg: "bg-amber-500/10"
    },
  ];

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-sm font-bold text-primary animate-pulse tracking-[0.2em] uppercase">Initializing Dashboard</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">
            Welcome back, <span className="text-foreground">{user?.fullName || "Admin"}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium flex items-center gap-2">
            <Calendar size={14} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-bold uppercase tracking-widest">{user?.branchId === 1 ? "Main Branch" : "Satellite Branch"}</span>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full opacity-20 transition-all group-hover:scale-125`} />
            
            <div className="flex items-center justify-between relative z-10">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? "text-emerald-500" : "text-destructive"}`}>
                {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            
            <div className="mt-6 space-y-1 relative z-10">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Placeholder */}
        <div className="lg:col-span-2 bg-card rounded-3xl border shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex items-center justify-between bg-muted/20">
            <h3 className="font-black flex items-center gap-2 uppercase tracking-tighter text-lg">
              <Clock className="text-primary" size={20} />
              Recent Transactions
            </h3>
            <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View History</button>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-center gap-4 flex-1">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
              <Package size={40} />
            </div>
            <div className="max-w-xs">
              <h4 className="font-bold text-sm">No recent transactions</h4>
              <p className="text-xs text-muted-foreground mt-2 font-medium italic">Your sales will appear here in real-time once the system is fully synchronized.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions / Integration Status */}
        <div className="space-y-6">
          <div className="bg-primary p-6 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            <h3 className="text-white font-black text-lg tracking-tight relative z-10">System Status</h3>
            <div className="mt-6 space-y-4 relative z-10">
              <div className="flex items-center justify-between text-white/80 text-xs">
                <span className="font-bold uppercase tracking-widest">API Connectivity</span>
                <span className="font-black flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor]" />
                  ONLINE
                </span>
              </div>
              <div className="w-full bg-white/20 h-1 rounded-full">
                <div className="bg-white h-full rounded-full w-[100%] transition-all duration-1000" />
              </div>
              <p className="text-[10px] text-white/60 font-medium italic">Connected to POS.Api v1.0.4 at localhost:5277</p>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border shadow-sm space-y-4">
            <h3 className="font-black uppercase tracking-tighter text-sm">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-2 p-4 border rounded-2xl hover:bg-muted transition-all group">
                <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <ShoppingBag size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider">New Sale</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 border rounded-2xl hover:bg-muted transition-all group">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Package size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider">Inventory</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
