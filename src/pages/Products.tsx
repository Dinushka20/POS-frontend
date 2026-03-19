import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Box, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { productsApi, type ProductDto } from "../api/products.api";
import { stockApi, type StockDto } from "../api/stock.api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Beverages" },
  { id: 3, name: "Snacks" },
];

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [stocks, setStocks] = useState<Record<number, StockDto>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    barcode: "",
    categoryId: 1,
    price: 0,
    costPrice: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsData, stocksData] = await Promise.all([
        productsApi.getAll(),
        user?.branchId ? stockApi.getByBranch(user.branchId) : Promise.resolve([])
      ]);
      setProducts(productsData);
      
      const stockMap: Record<number, StockDto> = {};
      (stocksData as StockDto[]).forEach(s => {
        stockMap[s.productId] = s;
      });
      setStocks(stockMap);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch products. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.branchId]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productsApi.create(newProduct);
      setIsModalOpen(false);
      setNewProduct({ name: "", barcode: "", categoryId: 1, price: 0, costPrice: 0 });
      fetchData(); // Refresh list
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create product.");
    }
  };

  const deleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsApi.delete(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  };

  const getStockInfo = (productId: number) => {
    const stock = stocks[productId];
    if (!stock) return { qty: 0, status: "No Data", color: "text-muted-foreground bg-muted/20" };
    
    if (stock.status === "OutOfStock") return { qty: 0, status: "Out of Stock", color: "text-destructive bg-destructive/10" };
    if (stock.status === "Low") return { qty: stock.quantity, status: "Low Stock", color: "text-amber-600 bg-amber-500/10" };
    return { qty: stock.quantity, status: "In Stock", color: "text-emerald-600 bg-emerald-500/10" };
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header section matches design */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium italic">Manage your inventory and product catalog.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full pl-10 pr-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 border bg-card rounded-xl hover:bg-muted/50 transition-all font-bold text-sm">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive animate-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-card/50 backdrop-blur-[2px] z-20 flex items-center justify-center flex-col gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Fetching Data...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">SKU</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const stockInfo = getStockInfo(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/10">
                            <Box size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-sm">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">ID: #{p.id.toString().padStart(4, "0")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-medium text-muted-foreground uppercase">{p.barcode}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                          {p.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-sm">${p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 font-bold text-xs">
                        {stockInfo.qty} <span className="text-[10px] text-muted-foreground uppercase ml-0.5">Units</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current/20 ${stockInfo.color}`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                          {stockInfo.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors border border-transparent hover:border-primary/10">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="p-2 hover:bg-destructive/5 text-destructive rounded-lg transition-colors border border-transparent hover:border-destructive/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                        <Search size={48} />
                        <div className="font-bold">No products found</div>
                        <p className="text-xs">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination placeholder */}
        <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="font-bold text-foreground">{filteredProducts.length}</span> of <span className="font-bold text-foreground">{products.length}</span> products
          </p>
          <div className="flex gap-2">
            <button disabled className="px-4 py-1.5 border bg-muted/50 rounded-lg text-xs font-bold disabled:opacity-50 transition-all">Previous</button>
            <button disabled className="px-4 py-1.5 border bg-muted/50 rounded-lg text-xs font-bold disabled:opacity-50 transition-all">Next</button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-[4px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-400">
            <div className="p-8 border-b bg-muted/30">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Box size={24} className="text-primary" />
                Add New Product
              </h2>
              <p className="text-muted-foreground text-xs font-medium mt-1 uppercase tracking-widest italic opacity-70">Register a new item in the central catalog.</p>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Enterprise Server X-100"
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Barcode / SKU</label>
                  <input 
                    required
                    type="text" 
                    placeholder="SKU-XXXX"
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                    value={newProduct.barcode}
                    onChange={e => setNewProduct({...newProduct, barcode: e.target.value})}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm appearance-none"
                    value={newProduct.categoryId}
                    onChange={e => setNewProduct({...newProduct, categoryId: parseInt(e.target.value)})}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Price ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                    value={newProduct.price || ""}
                    onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Cost ($)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                    value={newProduct.costPrice || ""}
                    onChange={e => setNewProduct({...newProduct, costPrice: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border rounded-xl font-bold text-sm hover:bg-muted/50 transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
