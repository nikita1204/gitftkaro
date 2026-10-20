'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  RotateCcw,
  Sliders,
  Shield,
  Layers,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import {
  fetchDeliveryConfig,
  updateDeliveryConfig,
  fetchAllZones,
  createDeliveryZone,
  toggleDeliveryZone,
  deleteDeliveryZone,
} from '@/redux/slices/deliverySlice.js';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { Loader } from '@/components/ui/Loader.jsx';

export function AdminDeliveryManager() {
  const dispatch = useAppDispatch();
  const { config, isLoadingConfig, zones, isLoadingZones, isMutatingZone } = useAppSelector(
    (state) => state.delivery
  );

  const [activeTab, setActiveTab] = useState('zones'); // 'zones' | 'rules'
  const [configForm, setConfigForm] = useState({
    expressPromiseHours: 24,
    minExpressQuantity: 10,
    maxExpressQuantity: 100,
    isCutOffActive: false,
    cutOffTime: '14:00',
    requireArtworkApproval: true,
  });

  const [newZoneForm, setNewZoneForm] = useState({
    pincode: '',
    areaName: '',
    isExpressEligible: true,
    expressDeliveryHours: 24,
    standardDeliveryHours: 48,
    notes: '',
  });

  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    dispatch(fetchDeliveryConfig());
    dispatch(fetchAllZones());
  }, [dispatch]);

  useEffect(() => {
    if (config) {
      setConfigForm({
        expressPromiseHours: config.expressPromiseHours || 24,
        minExpressQuantity: config.minExpressQuantity || 10,
        maxExpressQuantity: config.maxExpressQuantity || 100,
        isCutOffActive: Boolean(config.isCutOffActive),
        cutOffTime: config.cutOffTime || '14:00',
        requireArtworkApproval: config.requireArtworkApproval !== false,
      });
    }
  }, [config]);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaveSuccessMsg('');
    try {
      await dispatch(
        updateDeliveryConfig({
          expressPromiseHours: Number(configForm.expressPromiseHours),
          minExpressQuantity: Number(configForm.minExpressQuantity),
          maxExpressQuantity: Number(configForm.maxExpressQuantity),
          isCutOffActive: Boolean(configForm.isCutOffActive),
          cutOffTime: configForm.cutOffTime,
          requireArtworkApproval: Boolean(configForm.requireArtworkApproval),
        })
      ).unwrap();
      setSaveSuccessMsg('Delivery rules & cut-off configuration updated successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save delivery configuration');
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!/^[1-9][0-9]{5}$/.test(newZoneForm.pincode)) {
      setErrorMsg('Please enter a valid 6-digit PIN code');
      return;
    }
    if (!newZoneForm.areaName.trim()) {
      setErrorMsg('Area/Locality name is required');
      return;
    }

    try {
      await dispatch(createDeliveryZone(newZoneForm)).unwrap();
      setShowAddZoneModal(false);
      setNewZoneForm({
        pincode: '',
        areaName: '',
        isExpressEligible: true,
        expressDeliveryHours: 24,
        standardDeliveryHours: 48,
        notes: '',
      });
      setSaveSuccessMsg('New serviceable PIN code added successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add delivery zone');
    }
  };

  const handleToggleZone = async (id) => {
    try {
      await dispatch(toggleDeliveryZone(id)).unwrap();
    } catch (err) {
      alert(`Error toggling zone: ${err}`);
    }
  };

  const handleDeleteZone = async (id, pin) => {
    if (!confirm(`Are you sure you want to delete PIN code ${pin}?`)) return;
    try {
      await dispatch(deleteDeliveryZone(id)).unwrap();
    } catch (err) {
      alert(`Error deleting zone: ${err}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'zones'
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Serviceable PIN Codes & Zones ({zones.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rules'
                ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            24h Operational Rules & Cut-Off
          </button>
        </div>

        {activeTab === 'zones' && (
          <Button
            size="sm"
            onClick={() => setShowAddZoneModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add New PIN Code
          </Button>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: SERVICEABLE ZONES & PINCODES */}
      {activeTab === 'zones' && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Configured Raipur Postal Delivery Zones</span>
              <span>Total: {zones.length} Zones</span>
            </div>

            {isLoadingZones && zones.length === 0 ? (
              <div className="p-12 flex justify-center">
                <Loader size="md" text="Loading serviceable PIN codes..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">PIN Code</th>
                      <th className="py-3 px-4">Area / Locality</th>
                      <th className="py-3 px-4">Express Window</th>
                      <th className="py-3 px-4">24h Eligible</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {zones.map((zone) => (
                      <tr key={zone._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {zone.pincode}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-200 block">
                            {zone.areaName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {zone.city}, {zone.district}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {zone.expressDeliveryHours} Hours
                        </td>
                        <td className="py-3 px-4">
                          {zone.isExpressEligible ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Yes (24h Express)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              Standard Only
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleZone(zone._id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                              zone.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {zone.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteZone(zone._id, zone.pincode)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete PIN code"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OPERATIONAL RULES & CUT-OFF */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-800">
              <Sliders className="w-5 h-5 text-brand-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Production Capacity & Turnaround Parameters
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Express Turnaround Guarantee (Hours)
                </label>
                <input
                  type="number"
                  min="12"
                  max="72"
                  value={configForm.expressPromiseHours}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, expressPromiseHours: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-500">Default: 24 hours for Raipur orders</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Maximum Express Quantity (Batch Limit)
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={configForm.maxExpressQuantity}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, maxExpressQuantity: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-500">
                  Orders exceeding this (e.g. &gt;100 pcs) receive 48–72h bulk production
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Minimum Order Quantity (MOQ)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={configForm.minExpressQuantity}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, minExpressQuantity: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-slate-500">Default: 10 customized t-shirts</p>
              </div>
            </div>

            {/* Cut-Off Configuration */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Daily Order Cut-Off Time</h4>
                  <p className="text-[11px] text-slate-400">
                    When enabled, orders confirmed after this time roll over into next-day production cycle (+24h).
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.isCutOffActive}
                    onChange={(e) =>
                      setConfigForm({ ...configForm, isCutOffActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>

              {configForm.isCutOffActive && (
                <div className="max-w-xs space-y-1.5">
                  <label className="text-[11px] text-slate-300 font-semibold block">
                    Cut-Off Time (IST, 24-Hour Format HH:MM)
                  </label>
                  <input
                    type="time"
                    value={configForm.cutOffTime}
                    onChange={(e) => setConfigForm({ ...configForm, cutOffTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}
            </div>

            {/* Artwork Approval Constraint */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Require Customer Artwork Proof Confirmation</h4>
                <p className="text-[11px] text-slate-400">
                  Display condition stating 24-hour turnaround begins once client confirms digital proof.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={configForm.requireArtworkApproval}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, requireArtworkApproval: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
                Save Delivery Rules
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Add Zone Modal */}
      {showAddZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white">Add Serviceable Raipur PIN Code</h3>
              <button
                onClick={() => setShowAddZoneModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddZone} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">6-Digit PIN Code *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newZoneForm.pincode}
                  onChange={(e) =>
                    setNewZoneForm({
                      ...newZoneForm,
                      pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                    })
                  }
                  placeholder="e.g. 492016"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Area / Locality Names *</label>
                <input
                  type="text"
                  value={newZoneForm.areaName}
                  onChange={(e) => setNewZoneForm({ ...newZoneForm, areaName: e.target.value })}
                  placeholder="e.g. Kumhari / Durg Bypass Hub"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="expressEligible"
                  checked={newZoneForm.isExpressEligible}
                  onChange={(e) =>
                    setNewZoneForm({ ...newZoneForm, isExpressEligible: e.target.checked })
                  }
                  className="rounded bg-slate-950 border-slate-800 text-brand-500 focus:ring-0"
                />
                <label htmlFor="expressEligible" className="text-slate-300 font-semibold">
                  Eligible for 24-Hour Express Production
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowAddZoneModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save PIN Code
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
