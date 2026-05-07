import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(pin);
    if (success) {
      navigate('/');
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-emerald-500/20">
          <Lock size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-white mb-1">الحاج طيب</h1>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">نظام الإدارة</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input 
              type="password"
              maxLength={4}
              value={pin}
              autoFocus
              onChange={(e) => setPin(e.target.value)}
              placeholder="أدخل رمز الدخول"
              className={`w-full bg-slate-800/50 border-2 ${error ? 'border-red-500' : 'border-slate-700'} rounded-2xl py-5 px-6 text-2xl text-center font-black text-white outline-none focus:border-emerald-500 transition-all placeholder:text-slate-600 placeholder:text-lg`}
            />
            {error && <p className="text-red-500 text-sm mt-2 font-bold">الرمز غير صحيح</p>}
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-white py-5 px-6 rounded-2xl font-black text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/10 active:scale-95"
          >
            دخول للنظام
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800 text-slate-500 text-xs font-bold uppercase tracking-widest">
          المؤسسة الرائدة في مواد البناء
        </div>
      </motion.div>
    </div>
  );
}
