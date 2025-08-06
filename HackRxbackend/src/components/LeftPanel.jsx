import React from 'react';
import { PlusCircle, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const LeftPanel = ({ chatHistory, activeChatId, onSelectChat, onNewChat, onDeleteChat }) => {
  const getStatusIcon = (chat) => {
    const lastDecisionMsg = [...chat.messages].reverse().find(m => m.role === 'ai' && m.decision);
    if (!lastDecisionMsg) return null;
    const decision = lastDecisionMsg.decision.toLowerCase();
    if (decision.includes('approved')) return <CheckCircle className="text-green-500 flex-shrink-0" size={14} />;
    if (decision.includes('denied')) return <XCircle className="text-red-500 flex-shrink-0" size={14} />;
    if (decision.includes('information')) return <AlertCircle className="text-yellow-500 flex-shrink-0" size={14} />;
    return null;
  };

  return (
    <div className="flex-shrink-0 w-1/4 bg-slate-100 border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <button 
          onClick={onNewChat} 
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={18} /> New Claim Chat
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        <h2 className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Chat History</h2>
        {chatHistory.map(chat => (
          <div key={chat.id} className="relative group">
            <button 
              onClick={() => onSelectChat(chat.id)} 
              className={`w-full text-left text-sm p-2 rounded-md flex items-center gap-2 ${
                activeChatId === chat.id ? 'bg-blue-200 text-blue-900' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {getStatusIcon(chat)}
              <span className="truncate flex-grow">{chat.title}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftPanel;
