import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Package, 
  ShoppingCart,
  ArrowUpRight
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { formatCurrency, cn } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    monthProfit: 0,
    lowStockCount: 0,
    bestSeller: '---'
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [inventorySnapshot, setInventorySnapshot] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch Stats & Recent Sales
    const salesQuery = query(collection(db, 'sales'), orderBy('timestamp', 'desc'), limit(10));
    const unsubscribeSales = onSnapshot(salesQuery, (snapshot) => {
      const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentSales(sales);
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let todayS = 0;
      let monthP = 0;

      sales.forEach((sale: any) => {
        const saleDate = sale.timestamp?.toDate() || new Date();
        if (saleDate >= startOfDay) todayS += sale.totalAmount;
        if (saleDate >= startOfMonth) monthP += (sale.profit || 0);
      });

      setStats(prev => ({ ...prev, todaySales: todayS, monthProfit: monthP }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sales'));

    // 2. Fetch Inventory & Customers
    const productsQuery = query(collection(db, 'products'));
    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lowStock = products.filter((p: any) => p.stock <= 5).length;
      
      setInventorySnapshot(products.slice(0, 4)); // Show first 4 for visual
      setStats(prev => ({ ...prev, lowStockCount: lowStock }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    const customersQuery = query(collection(db, 'customers'));
    const unsubscribeCustomers = onSnapshot(customersQuery, (snapshot) => {
      // Could count customers here if needed
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'customers'));

    return () => {
      unsubscribeSales();
      unsubscribeProducts();
      unsubscribeCustomers();
    };
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي المبيعات اليوم', value: stats.todaySales, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+100%', suffix: 'د.ج' },
          { label: 'الأرباح الصافية (شهر)', value: stats.monthProfit, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'مباشر', suffix: 'د.ج' },
          { label: 'المواد المنتهية', value: stats.lowStockCount < 10 ? `0${stats.lowStockCount}` : stats.lowStockCount, icon: Package, color: 'text-red-500', bg: 'bg-red-50', trend: 'تنبيه', suffix: '' },
          { label: 'أكثر مادة مبيعاً', value: stats.bestSeller, icon: ArrowUpRight, color: 'text-slate-600', bg: 'bg-slate-100', trend: 'تحديث آلي', suffix: '' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 group hover:border-emerald-200 transition-all duration-300">
            <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  {stat.suffix && <span className="text-xs text-slate-400 font-bold mr-1">{stat.suffix}</span>}
                </span>
              </div>
              <span className={cn(
                "text-[10px] px-2 py-1 rounded-md font-black uppercase",
                stat.trend.includes('+') ? "bg-emerald-100 text-emerald-600" : 
                stat.trend === 'تنبيه' ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
              )}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart or Recent Sales */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-lg text-slate-900">آخر العمليات</h3>
            <button className="text-emerald-600 text-sm font-black hover:underline">عرض الكل</button>
          </div>
          <div className="flex-1 overflow-hidden p-4 text-right">
            <table className="w-full text-right" dir="rtl">
              <thead className="text-slate-400 text-xs border-b border-slate-100 font-bold tracking-wider uppercase">
                <tr>
                  <th className="pb-3 px-2">الزبون</th>
                  <th className="pb-3 px-2">الإجمالي</th>
                  <th className="pb-3 px-2">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentSales.map((sale, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-2 font-bold text-sm text-slate-900">{sale.customerName}</td>
                    <td className="py-4 px-2 font-black text-emerald-600 text-sm">{formatCurrency(sale.totalAmount)}</td>
                    <td className="py-4 px-2 text-xs text-slate-400">
                      {sale.timestamp?.toDate() ? new Intl.DateTimeFormat('ar-DZ', { timeStyle: 'short' }).format(sale.timestamp.toDate()) : 'الآن'}
                    </td>
                  </tr>
                ))}
                {recentSales.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-slate-400 text-sm">لا توجد عمليات مؤخراً</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Monitor Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-6 space-y-6">
          <h3 className="font-black text-lg border-b border-slate-100 pb-4 text-slate-900">مراقبة المخزون</h3>
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            {inventorySnapshot.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-400">{item.stock} {item.unit}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000", 
                      item.stock <= 5 ? "bg-red-500" : "bg-emerald-500"
                    )} 
                    style={{ width: `${Math.min(100, (item.stock / 100) * 100)}%` }}
                  />
                </div>
                {item.stock <= 5 && <p className="text-[10px] text-red-500 font-black italic text-left">مخزون منخفض!</p>}
              </div>
            ))}
            {inventorySnapshot.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-10">لا توجد بيانات مخزون</p>
            )}
          </div>
          <button className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-500/10 active:scale-95 transition-all hover:bg-emerald-600 mt-4">
            + إضافة طلبية توريد
          </button>
        </div>
      </div>
    </div>
  );
}
