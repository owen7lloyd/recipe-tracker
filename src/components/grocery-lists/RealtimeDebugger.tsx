'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RealtimeDebugger({ listId }: { listId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      addLog('❌ Supabase not configured');
      return;
    }

    addLog('🔌 Connecting to Supabase Realtime...');

    const channel = supabase
      .channel(`debug_grocery_list:${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grocery_list_items',
          filter: `grocery_list_id=eq.${listId}`,
        },
        (payload) => {
          addLog(`✅ RECEIVED ${payload.eventType}: ${JSON.stringify(payload)}`);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          addLog('✅ Successfully subscribed to realtime');
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          addLog(`❌ Channel error: ${err}`);
          setIsConnected(false);
        } else if (status === 'TIMED_OUT') {
          addLog('❌ Subscription timed out');
          setIsConnected(false);
        } else {
          addLog(`ℹ️  Status: ${status}`);
        }
      });

    return () => {
      addLog('🔌 Unsubscribing...');
      channel.unsubscribe();
    };
  }, [listId]);

  const testDirectUpdate = async () => {
    if (!supabase) return;

    addLog('🧪 Testing direct Supabase update...');

    try {
      // Get first item from the list
      const { data: items, error: fetchError } = await supabase
        .from('grocery_list_items')
        .select('*')
        .eq('grocery_list_id', listId)
        .limit(1);

      if (fetchError) {
        addLog(`❌ Error fetching item: ${fetchError.message}`);
        return;
      }

      if (!items || items.length === 0) {
        addLog('❌ No items found to update');
        return;
      }

      const item = items[0];
      addLog(`📝 Updating item ${item.id} via Supabase client...`);

      // Toggle the checked status
      const { error: updateError } = await supabase
        .from('grocery_list_items')
        .update({ checked: !item.checked })
        .eq('id', item.id);

      if (updateError) {
        addLog(`❌ Error updating: ${updateError.message}`);
      } else {
        addLog('✅ Update sent successfully');
      }
    } catch (error: any) {
      addLog(`❌ Exception: ${error.message}`);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🐛 Realtime Debugger
          <span
            className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}
          >
            {isConnected ? '● Connected' : '○ Disconnected'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button onClick={testDirectUpdate} disabled={!isConnected}>
            🧪 Test Direct Supabase Update
          </Button>
          <p className="mt-2 text-xs text-slate-600">
            This bypasses your API and updates directly via Supabase to test if
            realtime works at all.
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto rounded border bg-slate-50 p-4 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-slate-400">No logs yet...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setLogs([])}
        >
          Clear Logs
        </Button>
      </CardContent>
    </Card>
  );
}
