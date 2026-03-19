import React, { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  Search,
  User,
  CreditCard
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";

const Navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "POS Terminal", href: "/terminal", icon: CreditCard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Inventory", href: "/inventory", icon: ShoppingBag },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans antialiased text-foreground selection:bg-primary/10 selection:text-primary">
      {/* Sidebar */}
      <aside className={cn(
        "bg-primary text-primary-foreground transition-all duration-500 ease-in-out flex flex-col relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-white/5",
        isCollapsed ? "w-20" : "w-72"
      )}>
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between border-b border-white/10 bg-black/10 backdrop-blur-md">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-xl shadow-black/20">
                <span className="font-black text-2xl tracking-tighter">D</span>
              </div>
              <span className="font-black text-xl tracking-tighter uppercase whitespace-nowrap">Deep Blue Enterprise</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-xl shadow-black/20 mx-auto">
              <span className="font-black text-2xl tracking-tighter">D</span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-4 top-20 w-8 h-8 bg-card border text-foreground rounded-full items-center justify-center hover:bg-muted transition-all shadow-lg active:scale-90 z-40"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {Navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden font-bold tracking-tight",
                isActive 
                  ? "bg-white/15 text-white shadow-inner translate-x-1" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={22} className="shrink-0 group-hover:scale-110 transition-transform duration-300" />
              {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300 text-sm uppercase tracking-widest">{item.name}</span>}
              <ActiveIndicator />
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-white/60 hover:text-white rounded-2xl hover:bg-white/5 transition-all group font-bold tracking-tight">
            <Settings size={22} className="group-hover:rotate-90 transition-transform duration-500" />
            {!isCollapsed && <span className="text-sm uppercase tracking-widest">Settings</span>}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-white/60 hover:text-destructive-foreground rounded-2xl hover:bg-destructive/20 transition-all font-bold group tracking-tight"
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span className="text-sm uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-muted/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        {/* Header */}
        <header className="h-20 bg-card/80 backdrop-blur-xl border-b flex items-center justify-between px-8 relative z-20">
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10 group">
              <Bell size={22} className="group-hover:animate-bounce" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-card shadow-sm" />
            </button>
            <div className="h-8 w-px bg-muted hidden sm:block" />
            <div className="flex items-center gap-4 ml-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">{user?.fullName || "Admin User"}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{user?.branchId === 1 ? "Main Branch" : "Satellite Branch"}</div>
              </div>
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-transparent group-hover:ring-primary/20 transition-all group-hover:scale-105 overflow-hidden">
                <User size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function ActiveIndicator() {
  return (
    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] opacity-0 group-[.active]:opacity-100 transition-opacity" />
  );
}
