import React, { useState, useEffect } from 'react';
import { 
  Users,
  Search,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { formatCurrency, formatDate } from '../lib/utils';

interface Customer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  lastPurchaseDate: any;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Note: In this simple app, we might get customers from 'sales' as a unique set
    // or from a 'customers' collection if we implement customer profiles properly.
    // For now, let's use a 'customers' collection.
    const q = query(collection(db, 'customers'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'customers'));
    return unsubscribe;
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-xl font-black">قائمة الزبائن</h3>
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="البحث عن زبون..."
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
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">الاسم</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">رقم الهاتف</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">آخر زيارة</th>
                <th className="px-6 py-4 font-bold text-zinc-500 text-xs">إجمالي المشتريات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <span className="font-bold">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 flex items-center gap-2">
                    <Phone size={14} className="text-zinc-400" />
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">
                    {customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : 'لم يتم الشراء بعد'}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    {formatCurrency(customer.totalSpent || 0)}
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-zinc-400">
                    <Users className="mx-auto mb-4 opacity-20" size={64} />
                    <p className="text-lg font-medium">لم يتم العثور على زبائن</p>
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
