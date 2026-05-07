import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-3xl text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-green-600 rounded-2xl mx-auto flex items-center justify-center font-black text-4xl text-white mb-6">ط</div>
        <h1 className="text-3xl font-black text-white mb-2">الحاج طيب</h1>
        <p className="text-zinc-400 mb-10">إدارة مواد البناء والنظام المحاسبي</p>
        
        <button 
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 px-6 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-colors shadow-lg active:scale-95"
        >
          <LogIn size={24} />
          الدخول باستخدام جوجل
        </button>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-zinc-500 text-sm">
          أهلاً بكم في نظام الحاج طيب الإحترافي
        </div>
      </motion.div>
    </div>
  );
}
