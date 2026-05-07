import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Calendar,
  FileText,
  Search,
  ArrowUpRight,
  Printer
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { generateInvoice } from '../lib/pdf';

interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  profit: number;
  timestamp: Timestamp;
  items: any[];
}

export default function Profits() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, today, month
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    salesCount: 0
  });

  useEffect(() => {
    let q = query(collection(db, 'sales'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
      setSales(data);

      // Calculate stats based on current filter (simple client-side for now)
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const filtered = data.filter(sale => {
        const saleDate = sale.timestamp?.toDate() || new Date();
        if (filter === 'today') return saleDate >= today;
        if (filter === 'month') return saleDate >= thisMonth;
        return true;
      });

      const totalS = filtered.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalP = filtered.reduce((sum, s) => sum + (s.profit || 0), 0);
      
      setStats({
        totalSales: totalS,
        totalProfit: totalP,
        salesCount: filtered.length
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sales'));
    return unsubscribe;
  }, [filter]);

  const filteredSales = sales.filter(s => 
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'إجمالي المبيعات', value: stats.totalSales, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'إجمالي الأرباح', value: stats.totalProfit, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'عدد العمليات', value: stats.salesCount, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <div className={`p-3 w-fit rounded-2xl ${stat.bg} ${stat.color} mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black">{typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Sales History */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-black">سجل المبيعات</h3>
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'today', label: 'اليوم' },
                { id: 'month', label: 'الشهر' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                    filter === f.id ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="بحث في الفواتير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">رقم الفاتورة</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">الزبون</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">التاريخ</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">المبلغ</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">الربح</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded text-zinc-600">
                      #{sale.id.substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-sm">{sale.customerName}</td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">{formatDate(sale.timestamp)}</td>
                  <td className="px-6 py-4 font-bold text-sm">{formatCurrency(sale.totalAmount)}</td>
                  <td className="px-6 py-4 text-green-600 font-bold text-sm">+{formatCurrency(sale.profit || 0)}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => generateInvoice(sale)}
                      className="p-2 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="طباعة الفاتورة"
                    >
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-zinc-400">
                    <FileText className="mx-auto mb-4 opacity-20" size={64} />
                    <p className="text-lg font-medium">لا توجد مبيعات مسجلة</p>
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
