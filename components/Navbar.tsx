import Link from 'next/link';
import { User, Shield, Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
        <Zap className="fill-blue-600" />
        NextUp
      </Link>
      
      <div className="flex items-center gap-6">
        <Link href="/players" className="text-gray-600 hover:text-blue-600 transition-colors">Players</Link>
        <Link href="/trials" className="text-gray-600 hover:text-blue-600 transition-colors">Trials</Link>
        <div className="h-6 w-px bg-gray-200 mx-2" />
        <Link href="/login" className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-blue-100 transition-colors">
          <User size={18} />
          Login
        </Link>
      </div>
    </nav>
  );
}
