import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Send, X, MessageSquare, Bot, User, Sparkles } from 'lucide-react';

interface ChatInterfaceProps {
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!process.env.API_KEY) return;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are a helpful investment analyst assistant. You help the user navigate their deal flow, summarize startups, and provide insights on meetings.",
      }
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatRef.current) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: userMsg });
      
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]); 

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || '';
        fullResponse += text;
        
        setMessages(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].text = fullResponse;
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the network right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[480px] h-[650px] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300 z-40 font-sans ring-1 ring-black/5 border border-white/50">
       
       {/* Glass Header */}
       <div className="absolute top-0 w-full h-20 bg-white/80 backdrop-blur-md border-b border-gray-100/50 flex justify-between items-center px-6 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Sparkles size={20} className="text-white fill-current" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900 leading-tight text-base">Analyst AI</h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    <p className="text-xs text-gray-500 font-medium">Gemini 2.5 Flash</p>
                </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-all">
            <X size={18} />
          </button>
       </div>

       {/* Messages Area */}
       <div className="flex-1 overflow-y-auto p-6 pt-24 space-y-6 bg-gradient-to-b from-white to-gray-50/50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40 select-none">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm max-w-[200px]">Ask about deal flow, market trends, or meeting summaries.</p>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100 text-indigo-600'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
             <div className="flex gap-4">
               <div className="flex-none w-8 h-8 rounded-full bg-white border border-gray-100 text-indigo-600 flex items-center justify-center shadow-sm">
                    <Bot size={14} />
               </div>
               <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"></span>
                 <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"></span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       {/* Input Area */}
       <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100/50">
          <div className="relative">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..."
                className="w-full pl-5 pr-12 py-4 bg-gray-50 hover:bg-white focus:bg-white border border-transparent hover:border-gray-200 focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50/50 rounded-2xl text-sm text-gray-800 placeholder-gray-400 transition-all outline-none"
                disabled={isLoading}
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-0 disabled:scale-75 transition-all shadow-md shadow-indigo-200 active:scale-95"
            >
                <Send size={16} className="ml-0.5" />
            </button>
          </div>
       </div>
    </div>
  );
};