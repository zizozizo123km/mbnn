import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Package, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatCurrency } from '../lib/utils';

const data = [
  { name: 'الأحد', sales: 4000, profit: 2400 },
  { name: 'الإثنين', sales: 3000, profit: 1398 },
  { name: 'الثلاثاء', sales: 2000, profit: 9800 },
  { name: 'الأربعاء', sales: 2780, profit: 3908 },
  { name: 'الخميس', sales: 1890, profit: 4800 },
  { name: 'الجمعة', sales: 2390, profit: 3800 },
  { name: 'السبت', sales: 3490, profit: 4300 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 pb-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي المبيعات اليوم', value: 152400, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12%', suffix: 'د.ج' },
          { label: 'الأرباح الصافية (شهر)', value: 840000, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5.4%', suffix: 'د.ج' },
          { label: 'المواد المنتهية', value: '03', icon: Package, color: 'text-red-500', bg: 'bg-red-50', trend: 'تنبيه', suffix: '' },
          { label: 'أكثر مادة مبيعاً', value: 'إسمنت (لافارج)', icon: ArrowUpRight, color: 'text-slate-600', bg: 'bg-slate-100', trend: '850 كيس', suffix: '' },
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
          <div className="flex-1 overflow-hidden p-4">
            <table className="w-full text-right">
              <thead className="text-slate-400 text-xs border-b border-slate-100 font-bold tracking-wider uppercase">
                <tr>
                  <th className="pb-3 px-2">الزبون</th>
                  <th className="pb-3 px-2">المادة</th>
                  <th className="pb-3 px-2 text-center">الكمية</th>
                  <th className="pb-3 px-2">الإجمالي</th>
                  <th className="pb-3 px-2">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { customer: 'محمد بن عيسى', material: 'حديد صلب 12 ملم', qty: '2.5 طن', total: 45000, status: 'تم الدفع', statusColor: 'bg-emerald-100 text-emerald-600' },
                  { customer: 'شركة البنيان', material: 'إسمنت رمادي', qty: '100 كيس', total: 85000, status: 'تم الدفع', statusColor: 'bg-emerald-100 text-emerald-600' },
                  { customer: 'علي محمودي', material: 'رمل البناء', qty: '1 شاحنة', total: 12000, status: 'قيد التسليم', statusColor: 'bg-blue-100 text-blue-600' },
                  { customer: 'سليم بلال', material: 'ياجور أحمر', qty: '3000 قطعة', total: 9000, status: 'تم الدفع', statusColor: 'bg-emerald-100 text-emerald-600' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-2 font-bold text-sm text-slate-900">{row.customer}</td>
                    <td className="py-4 px-2 text-sm text-slate-600">{row.material}</td>
                    <td className="py-4 px-2 text-center text-sm text-slate-400 font-medium">{row.qty}</td>
                    <td className="py-4 px-2 font-black text-emerald-600 text-sm">{formatCurrency(row.total)}</td>
                    <td className="py-4 px-2">
                       <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide", row.statusColor)}>
                        {row.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Monitor Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col p-6 space-y-6">
          <h3 className="font-black text-lg border-b border-slate-100 pb-4 text-slate-900">مراقبة المخزون</h3>
          <div className="space-y-6 flex-1 overflow-y-auto pr-1">
            {[
              { name: 'إسمنت بورتلاند', current: 45, max: 500, unit: 'كيس', color: 'bg-red-500', warning: 'وصل للحد الأدنى!' },
              { name: 'حديد 10 ملم', current: 12, max: 20, unit: 'طن', color: 'bg-blue-500' },
              { name: 'ياجور أحمر 12', current: 8400, max: 10000, unit: 'قطعة', color: 'bg-emerald-500' },
              { name: 'حصى (جرافيتي)', current: 15, max: 50, unit: 'م³', color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">{item.name}</span>
                  <span className="text-slate-400">{item.current} / {item.max} {item.unit}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", item.color)} 
                    style={{ width: `${(item.current / item.max) * 100}%` }}
                  />
                </div>
                {item.warning && <p className="text-[10px] text-red-500 font-black italic text-left">{item.warning}</p>}
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-500/10 active:scale-95 transition-all hover:bg-emerald-600 mt-4">
            + إضافة طلبية توريد
          </button>
        </div>
      </div>
    </div>
  );
}
