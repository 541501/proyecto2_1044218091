import { Suspense } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { BlocksClient } from './BlocksClient';

export default function BlocksPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="text-center py-12">Cargando...</div>}>
        <BlocksClient />
      </Suspense>
    </AppLayout>
  );
}
