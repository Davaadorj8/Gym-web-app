'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  CheckCircle2,
  Database,
  Layers,
  Code2,
  GitBranch,
  Terminal,
  Server,
  Zap,
  Copy,
  Check,
} from 'lucide-react';

export default function TechStackStatus() {
  const reduxState = useAppSelector((state) => state);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [systemData, setSystemData] = useState<{
    status: string;
    databaseStatus: { configured: boolean; provider: string; connectionMode: string };
  } | null>(null);

  useEffect(() => {
    fetch('/api/system')
      .then((res) => res.json())
      .then((data) => setSystemData(data))
      .catch((err) => console.error(err));
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const stackItems = [
    {
      name: 'Next.js 15+ App Router',
      role: 'Core Full-Stack Framework & Rendering Engine',
      status: 'Active',
      icon: Code2,
      desc: 'Server Components, API Routes & client boundary hydration',
    },
    {
      name: 'Redux Toolkit & React-Redux',
      role: 'Client State Architecture & Domain Slices',
      status: 'Active',
      icon: Layers,
      desc: 'Modular state for auth, gym operations, locker bays, logs & modals',
    },
    {
      name: 'Prisma ORM 7 + Driver Adapter',
      role: 'Type-safe Database Access & Schema Modeling',
      status: 'Active',
      icon: Database,
      desc: 'PostgreSQL connection pooling via @prisma/adapter-pg',
    },
    {
      name: 'Neon Serverless PostgreSQL',
      role: 'Cloud Relational Database & Migrations',
      status: 'Ready',
      icon: Server,
      desc: 'Configurable via DATABASE_URL environment variable',
    },
    {
      name: 'Tailwind CSS v4 + Lucide Icons',
      role: 'Dark Athletic Aesthetic & Modern UI',
      status: 'Active',
      icon: Zap,
      desc: 'High-contrast midnight theme with electric lime accents',
    },
    {
      name: 'Zod Validation Layer',
      role: 'Strict Request Contract & Schema Validation',
      status: 'Active',
      icon: CheckCircle2,
      desc: 'Runtime data integrity validation for inputs and mutations',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            System Stack &amp; Infrastructure
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Active full-stack SaaS architecture overview and GitHub sync instructions
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-lime-400/10 text-lime-400 border border-lime-400/30">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          Architecture Verified
        </span>
      </div>

      {/* Tech Stack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stackItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-[#0A1324] border border-[#142644] rounded-2xl p-5 space-y-3 hover:border-lime-400/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#0E203C] border border-[#1D3B6C] text-lime-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30">
                  {item.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">{item.name}</h3>
                <p className="text-xs text-lime-400/90 font-medium mt-0.5">{item.role}</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Git Sync Panel */}
      <div className="bg-[#0A1324] border border-[#142644] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-lime-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              GitHub Repository Sync
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            arche.fitness-web-app.git
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Push your codebase to your GitHub repository using the following shell commands:
        </p>

        <div className="relative bg-[#070E1C] border border-[#142644] rounded-xl p-4 font-mono text-xs text-slate-200">
          <pre className="overflow-x-auto whitespace-pre leading-relaxed">
{`git remote add origin https://github.com/Davaadorj8/arche.fitness-web-app.git
git branch -M main
git push -u origin main`}
          </pre>
          <button
            type="button"
            onClick={() =>
              copyToClipboard(
                `git remote add origin https://github.com/Davaadorj8/arche.fitness-web-app.git\ngit branch -M main\ngit push -u origin main`,
                'git-sync'
              )
            }
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#0E203C] hover:bg-[#152F56] text-slate-300 hover:text-white transition-colors"
          >
            {copiedSection === 'git-sync' ? (
              <Check className="w-4 h-4 text-lime-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
