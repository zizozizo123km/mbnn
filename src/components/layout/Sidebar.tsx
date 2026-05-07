import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users, 
  Database, 
  LogOut,
  Info
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const MENU_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { path: '/cashier', icon: ShoppingCart, label: 'نظام المبيعات' },
  { path: '/products', icon: Package, label: 'إدارة المواد' },
  { path: '/inventory', icon: Database, label: 'المخزون' },
  { path: '/profits', icon: TrendingUp, label: 'الأرباح والمحاسبة' },
  { path: '/customers', icon: Users, label: 'الزبائن' },
];

export function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-screen fixed right-0 top-0 flex flex-col z-50 border-l border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Package className="text-white" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-tight tracking-tight">الحاج طيب</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">لمواد البناء</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
              isActive 
                ? "bg-emerald-500/10 text-emerald-400" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={18} className={cn("transition-colors", "group-hover:text-emerald-400")} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 mb-4">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-slate-700" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {user?.email?.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.displayName || 'أدمن النظام'}</p>
            <p className="text-[10px] text-slate-500 truncate uppercase">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-xl text-slate-500 hover:text-red-400 transition-colors text-sm font-bold"
        >
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
