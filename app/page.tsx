import { ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
          NextUp: The Future of <span className="text-blue-600">Liberian Football</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          The safest way for players, scouts, and clubs to connect. 
          Optimized for performance on any connection.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200">
            Join the Network
            <ArrowRight size={20} />
          </Link>
          <Link href="/trials" className="bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-xl font-bold text-lg hover:border-blue-100 transition-all">
            Explore Trials
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Safe Shield</h3>
            <p className="text-gray-500 text-sm">Strict verification for agents and scouts. Your data, your rules.</p>
          </div>
          
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Data Saver</h3>
            <p className="text-gray-500 text-sm">Ultra-lightweight media loading. Perfect for 3G and limited data.</p>
          </div>
          
          <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Globe size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Direct Pipeline</h3>
            <p className="text-gray-500 text-sm">Direct access to LFA clubs and international opportunities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
