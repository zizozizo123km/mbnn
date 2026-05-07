import React from 'react';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex">
      <Sidebar />
      <main className="flex-1 mr-64 min-h-screen flex flex-col">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
          <div className="flex flex-col">
            <h2 className="font-bold text-2xl text-slate-900 tracking-tight">
              {location.pathname === '/' && 'لوحة التحكم الرئيسية'}
              {location.pathname === '/cashier' && 'نظام المبيعات'}
              {location.pathname === '/products' && 'إدارة المواد والأسعار'}
              {location.pathname === '/inventory' && 'مراقبة المخزون'}
              {location.pathname === '/profits' && 'الأرباح والمحاسبة'}
              {location.pathname === '/customers' && 'قاعدة بيانات الزبائن'}
            </h2>
            <p className="text-sm text-slate-500">نظام إدارة شركة الحاج طيب</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full text-xs text-emerald-700 font-bold border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              حالة النظام: نشط
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900">
                {new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'medium' }).format(new Date())}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                {new Intl.DateTimeFormat('ar-DZ', { timeStyle: 'short' }).format(new Date())}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
