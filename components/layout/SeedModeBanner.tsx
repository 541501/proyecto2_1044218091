'use client';

import React from 'react';

const SeedModeBanner: React.FC = () => {
  return (
    <div className="seed-banner border-b px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-semibold">Modo de Semilla Activado</p>
            <p className="text-sm opacity-90">
              El sistema está funcionando con datos de prueba. Completa el bootstrap para pasar a modo producción.
            </p>
          </div>
        </div>
        <a
          href="/admin/db-setup"
          className="whitespace-nowrap rounded-lg bg-[var(--seed-banner-text)] px-3 py-1 text-sm font-medium text-white hover:opacity-90"
        >
          Ir a Bootstrap
        </a>
      </div>
    </div>
  );
};

export default SeedModeBanner;
