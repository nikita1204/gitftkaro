'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux.js';
import { closeModal } from '@/redux/slices/uiSlice.js';
import { Modal } from '@/components/ui/Modal.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Badge } from '@/components/ui/Badge.jsx';

export const QuoteModal = () => {
  const dispatch = useAppDispatch();
  const activeModal = useAppSelector((state) => state.ui?.activeModal);
  const isOpen = activeModal === 'quoteModal';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    quantity: '10',
    deliveryTime: '24h',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const qty = parseInt(formData.quantity, 10);
    if (isNaN(qty) || qty < 10) {
      setError('Minimum order quantity for custom printing is 10 pieces.');
      return;
    }

    setIsSubmitting(true);

    // Simulate instant quote processing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          phone: '',
          quantity: '10',
          deliveryTime: '24h',
          notes: '',
        });
        dispatch(closeModal());
      }, 2500);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(closeModal())}
      title="Request Custom T-shirt Quote"
      description="24-Hour Express Printing in selected areas of Raipur, CG &bull; MOQ: 10 Pieces"
      size="md"
    >
      {isSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Quote Request Received!</h3>
          <p className="text-xs text-stone-500 max-w-xs">
            Our Raipur print desk will contact you on WhatsApp with mockup proofs and exact bulk pricing.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Full Name"
            name="name"
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <Input
            label="WhatsApp / Phone Number"
            name="phone"
            type="tel"
            placeholder="e.g. +91 98765-43210"
            helperText="We will send digital mockups and pricing breakdown here"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Quantity (MOQ: 10 Pieces)"
              name="quantity"
              type="number"
              min="10"
              value={formData.quantity}
              onChange={handleChange}
              error={error}
              required
            />

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-stone-700">
                Delivery Urgency
              </label>
              <select
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                className="w-full rounded-xl bg-white text-sm text-stone-900 border border-stone-300 px-3 py-2.5 outline-none focus:border-brand-500 transition-colors"
              >
                <option value="24h">⚡ 24-Hour Express (Eligible Raipur)</option>
                <option value="3-5days">Standard (3-5 Days)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">
              Customization Notes (Optional)
            </label>
            <textarea
              name="notes"
              rows="3"
              placeholder="e.g., Black cotton round neck tees with front logo and back names..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full rounded-xl bg-white text-sm text-stone-900 placeholder:text-stone-400 border border-stone-300 p-3 outline-none focus:border-brand-500 transition-colors resize-none"
            />
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => dispatch(closeModal())}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              rightIcon={<Send className="h-3.5 w-3.5" />}
            >
              Submit Quote Request
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default QuoteModal;
