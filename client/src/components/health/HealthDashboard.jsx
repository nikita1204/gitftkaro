'use client';

import {
  Server,
  Database,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Layers,
} from 'lucide-react';
import { useHealthCheck } from '../../hooks/useHealthCheck.js';
import { formatUptime, formatDateTime } from '../../utils/formatters.js';

export const HealthDashboard = () => {
  const { data, status, error, lastCheckedAt, refetch, isLoading } = useHealthCheck(true);

  const isServerHealthy = status === 'succeeded' && data?.status === 'healthy';
  const isDbConnected = data?.database?.connected === true;
  const dbStatusText = data?.database?.status || 'unconnected';

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              System Architecture & Health Probe
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry verifying Frontend &harr; Express Backend &harr; MongoDB
            connection
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/20"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Checking...' : 'Refresh Health'}</span>
        </button>
      </div>

      {/* Grid of Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Express Server Health */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Server className="h-4 w-4 text-blue-400" />
              Express Backend API
            </span>
            {isServerHealthy ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="h-3 w-3 mr-1" /> ONLINE
              </span>
            ) : isLoading ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                TESTING
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <XCircle className="h-3 w-3 mr-1" /> OFFLINE
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {isServerHealthy ? data.service : 'Service unreachable'}
          </p>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>
              Uptime: {data?.uptimeSeconds ? formatUptime(data.uptimeSeconds) : '0s'}
            </span>
            <span>Env: {data?.environment || 'unknown'}</span>
          </div>
        </div>

        {/* MongoDB Status */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Database className="h-4 w-4 text-emerald-400" />
              MongoDB Database
            </span>
            {isDbConnected ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="h-3 w-3 mr-1" /> CONNECTED
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-3 w-3 mr-1" /> {dbStatusText.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-200 capitalize">
            Status: {dbStatusText}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            {isDbConnected
              ? `DB: ${data?.database?.name || 'gift_kro_dev'}`
              : 'Server runs resiliently without hanging'}
          </p>
        </div>

        {/* Raipur Express Delivery USP Telemetry */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-400" />
              Raipur Express USP
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              MOQ: 10 PCS
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            24-Hour Custom T-shirt Printing
          </p>
          <p className="mt-2 text-[11px] text-slate-400">Region: Raipur, Chhattisgarh</p>
        </div>
      </div>

      {/* Raw Diagnostic JSON Preview */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 text-xs">
          <span className="text-slate-400 font-mono flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            Endpoint: GET /api/health
          </span>
          <span className="text-slate-500 text-[11px]">
            Last Synced: {lastCheckedAt ? formatDateTime(lastCheckedAt) : 'Not checked'}
          </span>
        </div>

        {error ? (
          <div className="text-rose-400 text-xs font-mono p-2 bg-rose-950/20 rounded border border-rose-900/40">
            Error: {error.message || 'Server connection failed.'} (Make sure backend is
            running on port 5000)
          </div>
        ) : (
          <pre className="text-[11px] font-mono text-emerald-400/90 overflow-x-auto p-1 leading-relaxed">
            {JSON.stringify(data || { status: 'waiting for probe...' }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
