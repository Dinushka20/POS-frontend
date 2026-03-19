import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard, 
  Banknote,
  Loader2,
  Package,
  ChevronRight,
  CheckCircle2,
  User,
  X
} from "lucide-react";
import { productsApi, type ProductDto } from "../api/products.api";
import { customersApi, type CustomerDto } from "../api/customers.api";
import { ordersApi, type CreateOrderDto } from "../api/orders.api";
import { useAuth } from "../context/AuthContext";

interface CartItem extends ProductDto {
  quantity: number;
}

export default function POSTerminal() {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [p, c] = await Promise.all([
          productsApi.getAll(),
          customersApi.getAll()
        ]);
        setProducts(Array.isArray(p) ? p.filter(prod => prod.isActive) : []);
        setCustomers(Array.isArray(c) ? c : []);
      } catch (err) {
        setError("Failed to initialize terminal.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [products, searchQuery]
  );

  const addToCart = (product: ProductDto) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cart]
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!user?.branchId) return;

    setIsProcessing(true);
    try {
      const order: CreateOrderDto = {
        branchId: user.branchId,
        customerId: selectedCustomer?.id,
        paymentMode: paymentMode,
        cashAmount: paymentMode === "Cash" ? subtotal : 0,
        cardAmount: paymentMode === "Card" ? subtotal : 0,
        redeemPoints: false,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          discountAmount: 0
        }))
      };

      await ordersApi.create(order);
      setShowSuccess(true);
      setCart([]);
      setSelectedCustomer(null);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Checkout failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-sm font-black text-primary animate-pulse tracking-[.3em] uppercase">Booting Terminal</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden bg-muted/10">
      {/* Products Section */}
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden border-r bg-background/50 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Scan Barcode or Search Products..." 
              className="w-full pl-10 pr-4 py-3 bg-card border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm h-14"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive">
            <Package size={20} />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start pb-8">
          {filteredProducts.map(p => (
            <button 
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-card border rounded-2xl p-4 text-left hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden h-fit active:scale-95"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Plus size={32} />
              </div>
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-3">
                <Package size={20} />
              </div>
              <div className="font-bold text-sm tracking-tight line-clamp-2 min-h-[2.5rem]">{p.name}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-black text-primary text-base">${p.price.toFixed(2)}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-black bg-muted px-2 py-0.5 rounded-full">{p.categoryName}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout Section */}
      <div className="w-[450px] bg-card border-l flex flex-col shadow-2xl relative z-20 overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between bg-primary text-primary-foreground">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <ShoppingCart size={24} />
            Active Order
          </h2>
        </div>

        {/* Customer Selector & Details */}
        <div className="p-6 border-b space-y-4 bg-muted/50">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[.2em] text-muted-foreground ml-1">Customer Selection</label>
            <div className="relative group">
              <select 
                className="w-full bg-card border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                value={selectedCustomer?.id || ""}
                onChange={e => setSelectedCustomer(customers.find(c => c.id === parseInt(e.target.value)) || null)}
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                ))}
              </select>
              {selectedCustomer && (
                <button 
                  onClick={() => setSelectedCustomer(null)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {selectedCustomer && (
            <div className="bg-card border-2 border-primary/20 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                   <User size={20} />
                 </div>
                 <div>
                   <div className="text-sm font-black tracking-tight">{selectedCustomer.fullName}</div>
                   <div className="text-[10px] text-muted-foreground font-bold">{selectedCustomer.phone}</div>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-2 pt-2 border-t border-dashed">
                 <div className="bg-muted/30 p-2 rounded-lg text-center">
                   <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Loyalty Pts</div>
                   <div className="text-xs font-black text-primary">{selectedCustomer.loyaltyPoints}</div>
                 </div>
                 <div className="bg-muted/30 p-2 rounded-lg text-center">
                   <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Membership</div>
                   <div className="text-xs font-black text-emerald-600 uppercase">{selectedCustomer.tier}</div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.map(item => (
            <div key={item.id} className="flex gap-4 animate-in slide-in-from-right-4 duration-300">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
                <Package size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">${item.price.toFixed(2)} / unit</div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border rounded-lg overflow-hidden h-8">
                    <button onClick={() => updateQuantity(item.id, -1)} className="px-2 hover:bg-muted transition-colors"><Minus size={14} /></button>
                    <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="px-2 hover:bg-muted transition-colors"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-sm">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
              <ShoppingCart size={64} className="animate-bounce" />
              <div className="max-w-[200px]">
                <h4 className="font-bold">Terminal Empty</h4>
                <p className="text-xs italic">Select products from the catalog to begin checkout.</p>
              </div>
            </div>
          )}
        </div>

        {/* Payment & Checkout Summary */}
        <div className="p-8 bg-muted/20 border-t space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setPaymentMode("Cash")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all ${paymentMode === "Cash" ? "bg-primary text-primary-foreground shadow-lg border-primary" : "bg-card hover:bg-muted"}`}
            >
              <Banknote size={16} /> CASH
            </button>
            <button 
              onClick={() => setPaymentMode("Card")}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all ${paymentMode === "Card" ? "bg-primary text-primary-foreground shadow-lg border-primary" : "bg-card hover:bg-muted"}`}
            >
              <CreditCard size={16} /> CARD
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm font-bold text-muted-foreground italic">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end border-t pt-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[.2em] text-muted-foreground">Amount Due</span>
                <span className="text-4xl font-black tracking-tighter text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <button 
                disabled={cart.length === 0 || isProcessing}
                onClick={handleCheckout}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/40 enabled:hover:scale-105 enabled:active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} />}
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="bg-emerald-500 text-white px-10 py-6 rounded-3xl shadow-2xl animate-in zoom-in slide-in-from-bottom-10 flex items-center gap-4">
            <CheckCircle2 size={40} className="animate-bounce" />
            <div>
              <div className="font-black text-xl uppercase tracking-tighter">Transaction Success</div>
              <div className="text-xs font-bold text-white/80 italic">Inventory updated & receipts generated.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
