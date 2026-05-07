import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  Edit2, 
  Trash2, 
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatCurrency, cn } from '../lib/utils';
import { Modal } from '../components/ui/Modal';
import { motion } from 'motion/react';

interface Material {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
  category: string;
}

export default function Products() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    costPrice: '',
    stock: '',
    unit: 'كيس',
    category: 'عام'
  });

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material));
      setMaterials(data);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        price: material.price.toString(),
        costPrice: material.costPrice?.toString() || '',
        stock: material.stock.toString(),
        unit: material.unit,
        category: material.category
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        name: '',
        price: '',
        costPrice: '',
        stock: '',
        unit: 'كيس',
        category: 'عام'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice || '0'),
      stock: parseFloat(formData.stock),
      unit: formData.unit,
      category: formData.category,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingMaterial) {
        await updateDoc(doc(db, 'products', editingMaterial.id), data);
      } else {
        await addDoc(collection(db, 'products'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="البحث عن مادة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-200"
        >
          <Plus size={20} />
          إضافة مادة جديدة
        </button>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-zinc-50 border-b border-zinc-100">
            <tr>
              <th className="px-6 py-4 font-bold text-zinc-500 text-sm">المادة</th>
              <th className="px-6 py-4 font-bold text-zinc-500 text-sm">التصنيف</th>
              <th className="px-6 py-4 font-bold text-zinc-500 text-sm">السعر (بيع)</th>
              <th className="px-6 py-4 font-bold text-zinc-500 text-sm">السعر (شراء)</th>
              <th className="px-6 py-4 font-bold text-zinc-500 text-sm">المخزون</th>
              <th className="px-6 py-4 font-bold text-zinc-500 text-sm">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filteredMaterials.map((material) => (
              <tr key={material.id} className="hover:bg-zinc-50/50 transition-colors cursor-pointer group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="font-bold">{material.name}</p>
                      <p className="text-xs text-zinc-500">{material.unit}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-600">{material.category}</td>
                <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(material.price)}</td>
                <td className="px-6 py-4 text-zinc-500 font-medium">{formatCurrency(material.costPrice)}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    material.stock <= 5 ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-600"
                  )}>
                    {material.stock} {material.unit}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenModal(material)}
                      className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(material.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredMaterials.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-zinc-400">
                  <Package className="mx-auto mb-4 opacity-20" size={64} />
                  <p className="text-lg font-medium">لا توجد مواد مضافة حالياً</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? 'تعديل مادة' : 'إضافة مادة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">ชื่อ المادة</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="مثال: حديد 12 مم"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">سعر البيع</label>
              <input 
                required
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">سعر الشراء</label>
              <input 
                required
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">الكمية المتوفرة</label>
              <input 
                required
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">الوحدة</label>
              <select 
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="طن">طن</option>
                <option value="كيس">كيس</option>
                <option value="قطعة">قطعة</option>
                <option value="شاحنة">شاحنة</option>
                <option value="كغ">كغ</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700">التصنيف</label>
            <input 
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="مثال: حديد، إسمنت، رمل..."
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-colors shadow-lg active:scale-95"
          >
            {editingMaterial ? 'حفظ التعديلات' : 'إضافة المادة'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
