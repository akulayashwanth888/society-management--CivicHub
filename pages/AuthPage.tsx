
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.RESIDENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const { login, register } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        if (!isLogin) {
            // REGISTER
            await register(email, password, role, name, unitNumber);
        } else {
            // LOGIN
            await login(email, password);
        }
    } catch (err: any) {
        // Errors are alerted in AppContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">C</div>
          <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Join Your Society'}</h2>
          <p className="text-indigo-100 mt-2">{isLogin ? 'Sign in to access your dashboard' : 'Create an account to get started'}</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setRole(UserRole.RESIDENT)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === UserRole.RESIDENT ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Resident
            </button>
            <button 
              onClick={() => setRole(UserRole.ADMIN)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === UserRole.ADMIN ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
            >
              Admin / Staff
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Flat / Building Number</label>
                  <input 
                    type="text" 
                    required={role === UserRole.RESIDENT}
                    value={unitNumber}
                    onChange={e => setUnitNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                    placeholder="e.g. A-102 or Green Villa 4"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                placeholder="••••••••"
              />
            </div>
            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</a>
              </div>
            )}
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              {isLogin ? 'Sign In' : 'Register Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500">
            {isLogin ? (
              <p>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-indigo-600 font-bold hover:underline">Join Now</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setIsLogin(true)} className="text-indigo-600 font-bold hover:underline">Login here</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
