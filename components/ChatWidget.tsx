
import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService.ts';
import { Message, PortfolioData } from '../types.ts';

interface ChatWidgetProps {
  data: PortfolioData;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Systems online. I'm ${data.name.split(' ')[0]}'s digital double. Ask me to summarize the work or check the resume link.` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await chatWithAssistant(userMsg, history, data);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[120]">
      {isOpen && (
        <div className="absolute bottom-24 right-0 w-[380px] sm:w-[420px] max-h-[600px] glass rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/20 transition-all duration-300">
          <div className="p-6 bg-white/[0.03] border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-sm shadow-xl shadow-blue-500/30">AI</div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Studio Assistant</h3>
                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Context Synced
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-white transition-all">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-[350px]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] px-5 py-3 rounded-[1.5rem] text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 px-5 py-4 rounded-[1.5rem] rounded-tl-none flex gap-1.5 border border-white/5">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-6 border-t border-white/10 bg-white/[0.02]">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask for a summary..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-white transition-all shadow-inner"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="absolute right-2 p-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all disabled:opacity-50 shadow-lg"
              >
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.5rem] shadow-2xl transition-all duration-500 flex items-center justify-center transform ${
          isOpen ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        {isOpen ? (
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
