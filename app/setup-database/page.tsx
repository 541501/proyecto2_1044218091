'use client';

import { useState } from 'react';

interface TableStatus {
  [key: string]: { exists: boolean; count: number };
}

interface Step {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
}

export default function SetupDatabasePage() {
  const [status, setStatus] = useState<string>('Ready to start setup...');
  const [isLoading, setIsLoading] = useState(false);
  const [tables, setTables] = useState<TableStatus | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);

  const checkConnection = async () => {
    setIsLoading(true);
    setTables(null);
    setSteps([]);
    setStatus('Testing connection...');

    try {
      const response = await fetch('/api/setup-database');
      const data = await response.json();

      if (data.success) {
        setStatus('✅ Connected to Supabase successfully!');
        setTables(data.tables);
      } else {
        setStatus('❌ Failed to connect to Supabase');
        if (data.error) {
          setSteps([
            {
              name: `Connection Error: ${data.error}`,
              status: 'error',
            },
          ]);
        }
      }
    } catch (error) {
      setStatus('❌ Network error');
      setSteps([
        {
          name: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          status: 'error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const createTables = async () => {
    setIsLoading(true);
    setSteps([]);
    setStatus('Creating database schema...');

    try {
      const response = await fetch('/api/setup-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      setSteps(data.steps);

      if (data.success) {
        setStatus('✅ Database setup completed successfully!');
      } else {
        setStatus('❌ Database setup failed');
      }
    } catch (error) {
      setStatus('❌ Network error');
      setSteps([
        {
          name: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          status: 'error',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-700/50 backdrop-blur rounded-lg p-8 border border-slate-600">
          <h1 className="text-4xl font-bold text-white mb-2">Database Setup</h1>
          <p className="text-slate-300">
            Configure your Supabase connection and create database tables.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
          <p className="text-sm text-slate-400 mb-2">Current Status</p>
          <p className="text-2xl font-semibold text-white">{status}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={checkConnection}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900/50 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⟳</span> Testing...
              </>
            ) : (
              <>📋 Test Connection</>
            )}
          </button>

          <button
            onClick={createTables}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-900/50 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⟳</span> Creating...
              </>
            ) : (
              <>🗄️ Create Tables</>
            )}
          </button>
        </div>

        {/* Table Status (from connection test) */}
        {tables && (
          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
            <h2 className="text-xl font-bold text-white mb-4">📊 Table Status</h2>
            <div className="space-y-2">
              {Object.entries(tables).map(([table, info]) => (
                <div
                  key={table}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    info.exists
                      ? 'bg-green-900/30 border border-green-600/50'
                      : 'bg-red-900/30 border border-red-600/50'
                  }`}
                >
                  <span className="font-mono text-white">{table}</span>
                  <span className="text-right">
                    {info.exists ? (
                      <span className="text-green-400">
                        ✅ {info.count} rows
                      </span>
                    ) : (
                      <span className="text-red-400">❌ Not found</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Steps */}
        {steps.length > 0 && (
          <div className="bg-slate-700/50 backdrop-blur rounded-lg p-6 border border-slate-600">
            <h2 className="text-xl font-bold text-white mb-4">📝 Setup Steps</h2>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    step.status === 'success'
                      ? 'bg-green-900/30 border border-green-600/50'
                      : step.status === 'error'
                      ? 'bg-red-900/30 border border-red-600/50'
                      : 'bg-yellow-900/30 border border-yellow-600/50'
                  }`}
                >
                  <span className="text-lg mt-0.5">
                    {step.status === 'success'
                      ? '✅'
                      : step.status === 'error'
                      ? '❌'
                      : '⏳'}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{step.name}</p>
                    {step.message && (
                      <p className="text-sm text-slate-300 mt-1 font-mono break-words">
                        {step.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-600">
          <h3 className="font-semibold text-slate-300 mb-3 text-lg">📖 Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-400">
            <li>
              Click <span className="bg-blue-900 px-2 py-1 rounded text-white font-mono">Test Connection</span> to verify Supabase configuration
            </li>
            <li>
              If connected, click <span className="bg-green-900 px-2 py-1 rounded text-white font-mono">Create Tables</span> to initialize the database
            </li>
            <li>
              Watch the setup progress in real-time below the buttons
            </li>
            <li>
              After setup completes, delete <span className="bg-slate-700 px-2 py-1 rounded font-mono">/app/setup-database</span>
            </li>
          </ol>
        </div>

        {/* Environment Info */}
        <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-600 text-sm text-slate-400">
          <p className="text-slate-300 font-semibold mb-2">🔑 Environment Variables Required</p>
          <ul className="space-y-1 font-mono">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>SUPABASE_SERVICE_ROLE_KEY</li>
            <li>DATABASE_URL (for schema creation)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
