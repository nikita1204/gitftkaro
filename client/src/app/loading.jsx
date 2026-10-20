import { Loader } from '@/components/ui/Loader.jsx';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader size="lg" text="Preparing Custom Gifting Experience..." />
    </div>
  );
}
