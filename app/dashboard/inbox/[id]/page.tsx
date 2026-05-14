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

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

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
      <Link href="/dashboard/inbox" className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back to Inbox
      </Link>
      
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
