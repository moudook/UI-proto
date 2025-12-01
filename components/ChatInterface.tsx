import React, { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Bot, User, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text || "I received your message." }]);
      
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "Could not connect to backend server at localhost:8080." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[440px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-500 z-40 font-sans ring-1 ring-black/5 border border-white/50">
       
       {/* Glass Header */}
       <div className="absolute top-0 w-full h-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center px-8 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Sparkles size={18} className="text-white fill-current" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900 leading-tight text-sm">Analyst AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Online</p>
                </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-all">
            <X size={16} />
          </button>
       </div>

       {/* Messages Area */}
       <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6 bg-[#F8F9FB]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50 select-none">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-soft flex items-center justify-center mb-6">
                <MessageSquare size={24} className="text-indigo-300" />
              </div>
              <p className="text-gray-900 font-bold text-sm mb-1">How can I help you?</p>
              <p className="text-gray-400 text-xs max-w-[200px]">Connected to local backend.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role !== 'user' && (
                <div className="flex-none w-6 h-6 rounded-lg bg-white border border-gray-100 text-indigo-500 flex items-center justify-center shadow-sm mt-1">
                    <Bot size={12} />
                </div>
              )}
              <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 text-gray-600 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
             <div className="flex gap-3">
               <div className="flex-none w-6 h-6 rounded-lg bg-white border border-gray-100 text-indigo-500 flex items-center justify-center shadow-sm mt-1">
                    <Bot size={12} />
               </div>
               <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"></span>
                 <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100">
          <div className="relative">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="w-full pl-5 pr-12 py-3.5 bg-gray-50 hover:bg-white focus:bg-white border border-transparent hover:border-gray-200 focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50/30 rounded-2xl text-sm text-gray-800 placeholder-gray-400 transition-all outline-none shadow-inner-light"
                disabled={isLoading}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gray-900 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-0 disabled:scale-75 transition-all shadow-md shadow-gray-200 active:scale-95"
            >
                <Send size={14} className="ml-0.5" />
            </button>
          </div>
       </div>
    </div>
  );
};