import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  title?: string;
  badge?: string;
}

export default function Header({ title = "진로·취업 의식조사", badge }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">Career & Employment Survey</span>
            <span className="text-base font-bold text-slate-800 leading-tight block">{title}</span>
          </div>
        </Link>
        {badge && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            {badge}
          </span>
        )}
      </div>
    </header>
  );
}
