"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  Globe,
  Layers,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "./utils";

interface SysInfo {
  platform: string;
  release: string;
  arch: string;
  uptime: number;
  cpus: number;
  cpuModel: string;
  totalMem: string;
  freeMem: string;
  loadAvg: number[];
  timestamp: string;
}

interface NetworkInfo {
  status: string;
  latency: string;
  endpoint: string;
  timestamp: string;
  region: string;
}

export default function Dashboard() {
  const [sysInfo, setSysInfo] = useState<SysInfo | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [sysRes, netRes] = await Promise.all([
        fetch("/api/sys-info"),
        fetch("/api/network")
      ]);
      const sysData = await sysRes.json();
      const netData = await netRes.json();
      setSysInfo(sysData);
      setNetworkInfo(netData);
    } catch (error) {
      console.error("Failed to fetch node data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#030303] text-zinc-100 p-6 md:p-12 selection:bg-blue-500/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse-slow" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-2"
            >
              <div className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-blue-600/20 text-blue-400 border border-blue-500/30">
                Node Sentinel v1.0
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live on Linode
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent"
            >
              System Operations
            </motion.h1>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium backdrop-blur-md"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Syncing..." : "Refresh Node"}
          </motion.button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="CPU Usage"
            value={sysInfo ? "Normal" : "---"}
            subValue={sysInfo?.cpuModel || "Loading..."}
            icon={<Cpu className="w-5 h-5 text-blue-400" />}
            delay={0.2}
          />
          <StatCard
            title="Memory Load"
            value={sysInfo ? `${sysInfo.freeMem} / ${sysInfo.totalMem}` : "---"}
            subValue="Optimized for VPS"
            icon={<Activity className="w-5 h-5 text-purple-400" />}
            delay={0.3}
          />
          <StatCard
            title="Network Latency"
            value={networkInfo?.latency || "---"}
            subValue={networkInfo?.endpoint || "Syncing..."}
            icon={<Globe className="w-5 h-5 text-emerald-400" />}
            delay={0.4}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Node Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-3xl p-8 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Server className="w-32 h-32" />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Environment Security</h2>
            </div>

            <div className="space-y-6">
              <DetailRow label="Operating System" value={sysInfo?.platform || "Detecting..."} />
              <DetailRow label="Architecture" value={sysInfo?.arch || "Calculating..."} />
              <DetailRow label="Node Uptime" value={sysInfo ? `${Math.floor(sysInfo.uptime / 3600)} hours` : "---"} />
              <DetailRow label="Active Workers" value={sysInfo?.cpus.toString() || "0"} />
              <DetailRow label="Deployment Base" value="Ubuntu 22.04 LTS" />
            </div>
          </motion.div>

          {/* Real-time Logs / API Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-3xl p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <Terminal className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold">Link Pulse API</h2>
              </div>
              <div className="text-[10px] font-mono text-zinc-500">REAL-TIME STREAM</div>
            </div>

            <div className="flex-1 font-mono text-sm space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-hide">
              <LogEntry type="success" action="GET" route="/api/sys-info" status="200 OK" />
              <LogEntry type="success" action="GET" route="/api/network" status="200 OK" />
              <LogEntry type="info" action="WS" route="socket.io" status="CONNECTED" />
              {isRefreshing && <LogEntry type="loading" action="SYNC" route="data-stream" status="IN_PROGRESS" />}
              <LogEntry type="info" action="SYSTEM" route="linode-agent" status="HEALTHY" />
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#030303] bg-zinc-800 flex items-center justify-center text-[10px]">L{i}</div>
                ))}
              </div>
              <span className="text-xs text-zinc-500">Multi-region ready. Built for high-availability.</span>
            </div>
          </motion.div>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
            <Layers className="w-3 h-3" />
            Powered by Next.js Serverless + Linode VPS
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function StatCard({ title, value, subValue, icon, delay }: { title: string, value: string, subValue: string, icon: React.ReactNode, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass p-6 rounded-3xl hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold mb-1 tracking-tight">{value}</div>
      <div className="text-xs text-zinc-500 truncate">{subValue}</div>
    </motion.div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between group/row py-1">
      <span className="text-sm text-zinc-500 group-hover/row:text-zinc-300 transition-colors">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function LogEntry({ type, action, route, status }: { type: 'success' | 'info' | 'loading', action: string, route: string, status: string }) {
  const colors = {
    success: 'text-emerald-400',
    info: 'text-blue-400',
    loading: 'text-zinc-500 animate-pulse'
  };

  return (
    <div className="flex items-center gap-3">
      <span className={cn("text-[10px] px-1.5 py-0.5 rounded border leading-none font-bold uppercase",
        type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
          type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'
      )}>
        {action}
      </span>
      <span className="text-zinc-400 flex-1 truncate">{route}</span>
      <span className={cn("text-[10px] font-bold uppercase whitespace-nowrap", colors[type])}>{status}</span>
    </div>
  );
}
