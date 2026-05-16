'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('conversations')
        .select('*, messages(content, created_at)')
        .contains('participant_ids', [user.id])
        .order('created_at', { ascending: false });
      
      if (data) {
        // Fetch participant names for each conversation and sort messages locally to ensure the latest is first
        const enrichedConversations = await Promise.all(data.map(async (conv) => {
          const otherParticipantId = conv.participant_ids.find((id: string) => id !== user.id);
          const { data: actor } = await supabase
            .from('actors')
            .select('display_name, metadata')
            .eq('id', otherParticipantId)
            .single();
          
          // Sort messages to get the latest one
          const sortedMessages = (conv.messages || []).sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          return { 
            ...conv, 
            lastMessage: sortedMessages[0],
            otherParticipantName: actor?.display_name || 'Unknown',
            otherParticipantAvatar: actor?.metadata?.avatar_url || null
          };
        }));
        
        // Sort conversations by the latest message's timestamp
        enrichedConversations.sort((a, b) => {
          const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
          const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
          return timeB - timeA;
        });

        setConversations(enrichedConversations);
      }
      setLoading(false);
    };
    fetchConversations();
  }, []);

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Inbox</h1>
      <div className="space-y-4">
        {conversations.length > 0 ? conversations.map(conv => (
          <Link key={conv.id} href={`/dashboard/inbox/${conv.id}`} className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 overflow-hidden ring-4 ring-white dark:ring-gray-950 shadow-sm">
                {conv.otherParticipantAvatar ? (
                  <img src={conv.otherParticipantAvatar} alt={conv.otherParticipantName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{conv.otherParticipantName?.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                   <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                    {conv.otherParticipantName}
                  </h4>
                  {conv.lastMessage && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter ml-2">
                      {new Date(conv.lastMessage.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                  {conv.lastMessage?.content || 'Start a new conversation'}
                </p>
              </div>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors ml-4" />
          </Link>
        )) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <p className="text-gray-400">No conversations found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
