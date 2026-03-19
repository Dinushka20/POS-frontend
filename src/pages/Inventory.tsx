import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  History,
  TrendingDown
} from "lucide-react";
import { stockApi, type StockDto } from "../api/stock.api";
import { useAuth } from "../context/AuthContext";

export default function Inventory() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<StockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    if (!user?.branchId) return;
    setLoading(true);
    setError("");
    try {
      const data = await stockApi.getByBranch(user.branchId);
      setStocks(data);
    } catch (err: any) {
      setError("Failed to fetch inventory data. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.branchId]);

  const filteredStocks = useMemo(() => {
    return stocks.filter(s => 
      s.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stocks, searchQuery]);

  const lowStockCount = useMemo(() => 
    stocks.filter(s => s.status === "Low" || s.status === "OutOfStock").length, 
    [stocks]
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">Inventory Control</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium italic">Monitor stock levels and manage branch inventory.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2.5 border rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-primary"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-destructive/20 shadow-sm animate-pulse">
            <TrendingDown size={18} />
            <span className="text-xs uppercase tracking-widest">{lowStockCount} Low Stock Alerts</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search by product name..." 
            className="w-full pl-10 pr-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 border bg-card rounded-xl hover:bg-muted/50 transition-all font-bold text-sm">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="bg-card rounded-3xl border shadow-sm overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-20 flex items-center justify-center flex-col gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Fetching Stock Data...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">In Stock</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Threshold</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground text-right">Rapid Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStocks.map(stock => (
                <tr key={stock.productId} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Package size={20} />
                      </div>
                      <span className="font-bold text-sm">{stock.productName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-lg">{stock.quantity}</span>
                    <span className="text-[10px] text-muted-foreground uppercase ml-1">Units</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-sm text-muted-foreground">
                    {stock.lowStockThreshold}
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      stock.status === "InStock" ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" :
                      stock.status === "Low" ? "text-amber-600 bg-amber-500/10 border-amber-500/20" :
                      "text-destructive bg-destructive/10 border-destructive/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                    )}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                      {stock.status === "OutOfStock" ? "Out of Stock" : stock.status === "Low" ? "Low Stock" : "Healthy"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-emerald-500/10 text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20">
                        <ArrowUpRight size={18} />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors border border-transparent hover:border-destructive/20">
                        <ArrowDownRight size={18} />
                      </button>
                      <button className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20">
                        <History size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {!loading && filteredStocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-muted-foreground grayscale opacity-40">
                    <div className="flex flex-col items-center gap-3">
                      <Package size={48} />
                      <div className="font-black uppercase tracking-widest text-sm">Inventory synchronized but empty</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
