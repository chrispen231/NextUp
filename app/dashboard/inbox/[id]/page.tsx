'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/infrastructure/database/supabase';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MessageThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      // 1. Fetch conversation and other participant
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();
      
      if (conv) {
        const otherId = conv.participant_ids.find((id: string) => id !== user.id);
        const { data: actor } = await supabase
          .from('actors')
          .select('id, display_name, metadata')
          .eq('id', otherId)
          .single();
        setOtherParticipant(actor);
      }

      // 2. Fetch messages
      const { data } = await supabase
        .from('messages')
        .select('*, sender:sender_id(display_name)')
        .eq('conversation_id', resolvedParams.id)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
      setLoading(false);
    };
    init();
  }, [resolvedParams.id, router]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);

    const { error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: resolvedParams.id,
        sender_id: currentUser.id,
        content: newMessage
      }]);

    if (!error) {
      setMessages([...messages, { content: newMessage, sender_id: currentUser.id, sender: { display_name: 'You' }, created_at: new Date().toISOString() }]);
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard/inbox" className="flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back
        </Link>
        <Link href={`/players/${otherParticipant?.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 overflow-hidden">
            {otherParticipant?.metadata?.avatar_url ? (
              <img src={otherParticipant.metadata.avatar_url} alt={otherParticipant.display_name} className="w-full h-full object-cover" />
            ) : (
              otherParticipant?.display_name?.charAt(0)
            )}
          </div>
          <h2 className="font-bold text-gray-900 dark:text-white">{otherParticipant?.display_name || 'Chat'}</h2>
        </Link>
        <div className="w-16" />
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-6 mb-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-4 rounded-2xl ${msg.sender_id === currentUser.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="flex gap-4">
        <input 
          className="flex-1 px-5 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button disabled={sending} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
          {sending ? <Loader2 className="animate-spin" /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
}
