import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Subscribe to real-time changes on a table
 * Usage: useRealtimeSubscription('campaign_requests', handleChange)
 */
export function useRealtimeSubscription<T = any>(
  table: string,
  onUpdate: (payload: T) => void,
  filter?: { column: string; value: string | number }
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    let subscription = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined,
        },
        (payload) => {
          onUpdate(payload.new as T);
        }
      )
      .subscribe();

    setChannel(subscription);

    return () => {
      subscription.unsubscribe();
    };
  }, [table, filter?.column, filter?.value]);

  return channel;
}

/**
 * Subscribe to campaign updates (for users, service, admin)
 */
export function useCampaignUpdates(
  campaignId?: string,
  onUpdate?: (campaign: any) => void
) {
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCampaign = useCallback(async () => {
    if (!campaignId) return;

    const { data, error } = await supabase
      .from('campaign_requests')
      .select(`
        *,
        user:profiles!campaign_requests_user_id_fkey(*),
        assigned_service:profiles!campaign_requests_assigned_to_fkey(*),
        actor:actors(*)
      `)
      .eq('id', campaignId)
      .single();

    if (!error && data) {
      setCampaign(data);
      if (onUpdate) onUpdate(data);
    }
    setLoading(false);
  }, [campaignId, onUpdate]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  // Real-time subscription
  useRealtimeSubscription(
    'campaign_requests',
    (payload) => {
      setCampaign(payload);
      if (onUpdate) onUpdate(payload);
    },
    campaignId ? { column: 'id', value: campaignId } : undefined
  );

  return { campaign, loading, refetch: fetchCampaign };
}

/**
 * Subscribe to notifications for current user
 */
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription
  useRealtimeSubscription(
    'notifications',
    (payload) => {
      setNotifications((prev) => [payload, ...prev]);
      if (!payload.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    },
    userId ? { column: 'user_id', value: userId } : undefined
  );

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

/**
 * Subscribe to messages for a campaign
 */
export function useCampaignMessages(campaignId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!campaignId) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(*)
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  }, [campaignId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription
  useRealtimeSubscription(
    'messages',
    (payload) => {
      setMessages((prev) => [...prev, payload]);
    },
    campaignId ? { column: 'campaign_id', value: campaignId } : undefined
  );

  const sendMessage = async (message: string, isInternal: boolean = false) => {
    if (!campaignId) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        campaign_id: campaignId,
        sender_id: session.user.id,
        message,
        is_internal: isInternal,
      })
      .select(`
        *,
        sender:profiles(*)
      `)
      .single();

    if (!error && data) {
      // Optimistic update handled by realtime subscription
      return data;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
}
