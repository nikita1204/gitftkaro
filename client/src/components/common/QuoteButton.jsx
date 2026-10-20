'use client';

import React from 'react';
import { useAppDispatch } from '@/hooks/useRedux.js';
import { openModal } from '@/redux/slices/uiSlice.js';
import { Button } from '@/components/ui/Button.jsx';
import { Send } from 'lucide-react';

export const QuoteButton = ({
  variant = 'outline',
  size = 'md',
  className = '',
  children = 'Request Quote',
}) => {
  const dispatch = useAppDispatch();

  return (
    <Button
      onClick={() => dispatch(openModal({ modalName: 'quoteModal' }))}
      variant={variant}
      size={size}
      className={className}
      leftIcon={<Send className="h-4 w-4" />}
    >
      {children}
    </Button>
  );
};

export default QuoteButton;
