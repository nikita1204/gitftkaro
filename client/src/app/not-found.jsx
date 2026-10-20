import Link from 'next/link';
import { Compass, Home } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState.jsx';
import { Button } from '@/components/ui/Button.jsx';

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center py-12">
      <EmptyState
        icon={<Compass className="h-8 w-8 text-brand-400" />}
        title="404 — Page Not Found"
        description="The custom gifting page or product category you are looking for does not exist on GIFT KRO."
        action={
          <Link href="/">
            <Button variant="primary" size="sm" leftIcon={<Home className="h-4 w-4" />}>
              Return to Raipur Storefront
            </Button>
          </Link>
        }
        className="max-w-md w-full"
      />
    </div>
  );
}
