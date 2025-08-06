import React, { useRef, useEffect } from 'react';
import { MessageSquare, Loader, Send } from 'lucide-react';

const MiddlePanel = ({ messages, onSendMessage, isLoading, activeChatId, draft, onDraftChange }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (draft.trim()) {
      onSendMessage(draft);
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-white">
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={`${activeChatId}-${index}`} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={16} className="text-slate-600" />
                </div>
              )}
              <div className={`max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-slate-600" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-100">
                <Loader size={16} className="animate-spin text-slate-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="relative">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about a claim or policy..."
            className="w-full p-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button 
            onClick={handleSend} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 disabled:text-slate-300"
            disabled={isLoading || !draft.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiddlePanel;
