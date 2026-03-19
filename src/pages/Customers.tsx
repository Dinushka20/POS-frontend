import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { customersApi, type CustomerDto } from "../api/customers.api";

export default function Customers() {
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await customersApi.getAll();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("Failed to fetch customers.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredCustomers = useMemo(() => {
    return Array.isArray(customers) ? customers.filter(c => 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phone.includes(searchQuery)
    ) : [];
  }, [customers, searchQuery]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customersApi.create(newCustomer);
      setIsModalOpen(false);
      setNewCustomer({ fullName: "", email: "", phone: "" });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create customer.");
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">Customers</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium italic">Manage your customer relationships and loyalty.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            className="w-full pl-10 pr-4 py-3 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-20 flex items-center justify-center flex-col gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-bold text-primary animate-pulse tracking-widest uppercase">Fetching Customers...</p>
          </div>
        )}

        {filteredCustomers.map(customer => (
          <div key={customer.id} className="bg-card border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
             <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
             
             <div className="flex items-start justify-between relative z-10">
               <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                 <User size={28} />
               </div>
             </div>

             <div className="mt-6 space-y-4 relative z-10">
               <div>
                 <h3 className="font-black text-lg tracking-tight">{customer.fullName}</h3>
                 <p className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                   {customer.loyaltyPoints} Points
                 </p>
               </div>

               <div className="space-y-2 text-sm">
                 <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                   <Mail size={16} className="text-primary/60" />
                   <span className="font-medium truncate">{customer.email || "No Email"}</span>
                 </div>
                 <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                   <Phone size={16} className="text-primary/60" />
                   <span className="font-medium">{customer.phone}</span>
                 </div>
               </div>

               <div className="pt-4 border-t flex items-center justify-between">
                 <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</div>
                 <div className="font-black text-primary uppercase text-[10px] tracking-widest bg-primary/5 px-2 py-1 rounded-lg">{customer.tier}</div>
               </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-[4px] z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-400">
            <div className="p-8 border-b bg-muted/30">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Plus size={24} className="text-primary" />
                Add New Customer
              </h2>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                    value={newCustomer.fullName}
                    onChange={e => setNewCustomer({...newCustomer, fullName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                      value={newCustomer.email}
                      onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phone</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                      value={newCustomer.phone}
                      onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border rounded-xl font-bold text-sm hover:bg-muted transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-95 transition-all uppercase tracking-widest"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
