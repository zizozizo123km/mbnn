import React, { useState, useEffect } from 'react';
import { 
  Database,
  Search,
  Package,
  AlertTriangle,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatCurrency, cn } from '../lib/utils';

interface Material {
  id: string;
  name: string;
  stock: number;
  unit: string;
  category: string;
  price: number;
}

export default function Inventory() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('stock', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material));
      setMaterials(data);
    });
    return unsubscribe;
  }, []);

  const lowStock = materials.filter(m => m.stock <= 5);
  const totalStockValue = materials.reduce((sum, m) => sum + (m.price * m.stock), 0);

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-sm mb-1">إجمالي قيمة المخزون</p>
            <h3 className="text-3xl font-black">{formatCurrency(totalStockValue)}</h3>
          </div>
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
            <Database size={32} />
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-red-500 text-sm mb-1">مواد قاربت على النفاذ</p>
            <h3 className="text-3xl font-black text-red-700">{lowStock.length} مادة</h3>
          </div>
          <div className="p-4 bg-red-100 text-red-600 rounded-2xl">
            <AlertTriangle size={32} />
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-black">حالة المخزون</h3>
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="البحث في المخزون..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">المادة</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">الكمية المتبقية</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">الحالة</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">قيمة الكمية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        material.stock <= 5 ? "bg-red-50 text-red-500" : "bg-zinc-100 text-zinc-400"
                      )}>
                        <Package size={16} />
                      </div>
                      <span className="font-bold">{material.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {material.stock} {material.unit}
                  </td>
                  <td className="px-6 py-4">
                    {material.stock <= 0 ? (
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">نفذت</span>
                    ) : material.stock <= 5 ? (
                      <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">منخفضة جداً</span>
                    ) : (
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">جيدة</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">
                    {formatCurrency(material.price * material.stock)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
