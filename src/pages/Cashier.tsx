import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2,
  Printer,
  ChevronLeft
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  increment,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatCurrency, cn } from '../lib/utils';
import { generateInvoice } from '../lib/pdf';
import { motion, AnimatePresence } from 'motion/react';

interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  unit: string;
}

interface CartItem extends Product {
  quantity: number;
  subtotal: number;
}

export default function Cashier() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, subtotal: product.price }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > item.stock) return item;
        return { ...item, quantity: newQty, subtotal: newQty * item.price };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalProfit = cart.reduce((sum, item) => sum + (item.price - (item.costPrice || 0)) * item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Create Sale Record
      const saleRef = await addDoc(collection(db, 'sales'), {
        customerName: customer.name || 'زبون عابر',
        customerPhone: customer.phone,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        })),
        totalAmount,
        profit: totalProfit,
        timestamp: serverTimestamp()
      });

      // 2. Update Stock
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        await updateDoc(productRef, {
          stock: increment(-item.quantity)
        });
      }

      // 3. Update/Create Customer
      if (customer.phone) {
        const customersRef = collection(db, 'customers');
        const q = query(customersRef, where('phone', '==', customer.phone));
        const qSnap = await getDocs(q);
        
        if (!qSnap.empty) {
          const custDoc = qSnap.docs[0];
          await updateDoc(doc(db, 'customers', custDoc.id), {
            totalSpent: increment(totalAmount),
            lastPurchaseDate: serverTimestamp()
          });
        } else if (customer.name) {
          await addDoc(customersRef, {
            name: customer.name,
            phone: customer.phone,
            totalSpent: totalAmount,
            lastPurchaseDate: serverTimestamp(),
            createdAt: serverTimestamp()
          });
        }
      }

      // Generate PDF
      generateInvoice({ 
        id: saleRef.id, 
        customerName: customer.name, 
        items: cart, 
        totalAmount 
      });

      setShowSuccess(true);
      setCart([]);
      setCustomer({ name: '', phone: '' });
      
      // Update local products stock
      setProducts(prev => prev.map(p => {
        const cartItem = cart.find(ci => ci.id === p.id);
        if (cartItem) return { ...p, stock: p.stock - cartItem.quantity };
        return p;
      }));

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex gap-8 h-[calc(100vh-12rem)]">
      {/* Products Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="ابحث عن مادة لبدء البيع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl py-4 pr-12 pl-4 outline-none focus:ring-2 focus:ring-green-500 shadow-sm text-lg"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <motion.button
              key={product.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={cn(
                "bg-white border border-zinc-200 p-4 rounded-3xl text-right transition-all group flex flex-col justify-between",
                product.stock <= 0 ? "opacity-50 grayscale cursor-not-allowed" : "hover:shadow-md hover:border-green-300"
              )}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                    <ShoppingCart size={20} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                    product.stock <= 5 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                  )}>
                    {product.stock > 0 ? `متوفر: ${product.stock}` : 'نفذت الكمية'}
                  </span>
                </div>
                <h4 className="font-bold text-zinc-800 mb-1">{product.name}</h4>
                <p className="text-xs text-zinc-500 mb-4">{product.unit}</p>
              </div>
              <p className="text-xl font-black text-green-600">{formatCurrency(product.price)}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="w-96 bg-white border border-zinc-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="text-lg font-black flex items-center gap-2">
            <ShoppingCart size={20} />
            سلة المشتريات
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4 opacity-50">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="font-medium">السلة فارغة</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h5 className="font-bold text-sm leading-tight">{item.name}</h5>
                  <button onClick={() => removeFromCart(item.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-zinc-800">{formatCurrency(item.subtotal)}</span>
                  <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-green-600"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-green-600"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-zinc-50 border-t border-zinc-100 space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="اسم الزبون"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full bg-white border border-zinc-200 rounded-xl py-2 pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
            </div>
            <input 
              type="text" 
              placeholder="رقم الهاتف"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="w-full bg-white border border-zinc-200 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>

          <div className="pt-4 border-t border-zinc-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-zinc-500 font-medium">المجموع الكلي</span>
              <span className="text-2xl font-black text-black">{formatCurrency(totalAmount)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95",
                cart.length === 0 || isProcessing 
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" 
                  : "bg-green-600 text-white hover:bg-green-700 shadow-green-900/10"
              )}
            >
              {isProcessing ? 'جاري المعالجة...' : (
                <>
                  <CheckCircle2 size={24} />
                  إكمال الطلب والطباعة
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white border border-zinc-200 rounded-3xl p-8 text-center shadow-2xl pointer-events-auto max-w-sm w-full">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-black text-zinc-800 mb-2">تمت العملية بنجاح</h3>
              <p className="text-zinc-500 mb-6">تم تسجيل البيع وتحديث المخزون وتوليد الفاتورة</p>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full bg-black text-white py-3 rounded-xl font-bold"
              >
                متابعة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
