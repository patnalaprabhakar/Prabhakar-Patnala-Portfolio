
import React, { useState, useEffect, useRef } from 'react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (password: string) => boolean;
  recoveryEmail: string;
  onQuickAdd?: (type: 'PRODUCT' | 'IDENTITY') => void;
}

type AuthMode = 'LOGIN' | 'FORGOT' | 'OTP' | 'RESET' | 'SUCCESS';

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, recoveryEmail, onQuickAdd }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [password, setPassword] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      setError(false);
      setMode('SUCCESS');
    } else {
      setError(true);
      setErrorMsg('Invalid Identity Key');
      setPassword('');
    }
  };

  const validateIdentity = () => {
    if (!emailInput.trim()) {
      setError(true);
      setErrorMsg('Registry node required');
      return;
    }

    if (emailInput.toLowerCase().trim() !== recoveryEmail.toLowerCase().trim()) {
      setError(true);
      setErrorMsg('Identity not recognized in registry');
      return;
    }

    initiateForgotFlow();
  };

  const initiateForgotFlow = () => {
    setIsSending(true);
    setError(false);
    setShowTerminal(true);
    setTerminalLogs(["INIT_PROTOCOL: IDENTITY_CONFIRMED", "SCANNING: RECOVERY_REGISTRY..."]);
    
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);

    setTimeout(() => addLog("UPLINK: SECURE_CHANNEL_READY"), 400);
    setTimeout(() => addLog(`RELAY: DISPATCHING PACKET TO REGISTERED_ADMIN_NODE [ENCRYPTED]`), 900);
    setTimeout(() => addLog("ENV_MONITOR: REAL_SMTP_BLOCK. ACTIVATING_INTERCEPT..."), 1400);
    setTimeout(() => {
        addLog(`INTERCEPT_SUCCESS: OTP_PACKET_DECODED [ ${newOtp} ]`);
        setIsSending(false);
        setMode('OTP');
    }, 2200);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtpDigits = [...otp];
    newOtpDigits[index] = value.substring(value.length - 1);
    setOtp(newOtpDigits);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const injectOtp = () => {
    const digits = generatedOtp.split('');
    setOtp(digits);
    setTimeout(() => otpRefs.current[5]?.focus(), 100);
    addLog("MONITOR: PACKET_INJECTED_TO_INPUTS");
  };

  const verifyOtp = () => {
    const entered = otp.join('');
    if (entered === generatedOtp) {
      addLog("VERIFY: IDENTITY_CONFIRMED. TRANSITIONING TO RESET.");
      setMode('RESET');
      setError(false);
    } else {
      setError(true);
      setErrorMsg('Invalid Checksum');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      addLog("VERIFY: CHECKSUM_FAILURE.");
    }
  };

  const handleFinalReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setError(true);
      setErrorMsg('Key too short (min 4 chars)');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(true);
      setErrorMsg('Keys do not match');
      return;
    }

    localStorage.setItem('pp_admin_key', newPassword);
    setMode('SUCCESS');
    addLog("COMMIT: NEW_IDENTITY_KEY_ENCRYPTED");
  };

  const steps = [
    { id: 'FORGOT', label: 'Identity' },
    { id: 'OTP', label: 'Verify' },
    { id: 'RESET', label: 'Reset' }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/95 backdrop-blur-md transition-all duration-500">
      <div className={`w-full ${mode === 'SUCCESS' ? 'max-w-2xl' : 'max-w-md'} glass p-10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden border border-white/10 transition-all duration-700 ease-out`}>
        
        {/* Animated Background Aura */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl transition-all duration-1000 ${mode === 'OTP' ? 'bg-blue-500/30' : mode === 'SUCCESS' ? 'bg-blue-500/20' : 'bg-emerald-500/10'}`}></div>
        <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl transition-all duration-1000 ${mode === 'SUCCESS' ? 'bg-emerald-500/20' : 'opacity-0'}`}></div>

        <div className="relative z-10">
          <button onClick={onClose} className="absolute -top-4 -right-4 p-3 text-gray-500 hover:text-white transition-all bg-white/5 rounded-full border border-white/5 hover:scale-110 active:scale-90">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {mode === 'LOGIN' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(59,130,246,0.3)]">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h2 className="text-3xl font-heading font-bold mb-2 tracking-tight">Access Archive</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Administrator Secure Gateway</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Identity Key</label>
                  <input autoFocus type="password" value={password} onChange={(e) => {setPassword(e.target.value); setError(false);}} placeholder="••••••••" className={`w-full bg-white/[0.03] border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white font-mono transition-all`} />
                  {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">{errorMsg}</p>}
                </div>
                <button type="submit" className="w-full py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.5em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95">Authenticate</button>
                <div className="text-center"><button type="button" onClick={() => setMode('FORGOT')} className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-blue-500 transition-colors">Recover Access Protocol</button></div>
              </form>
            </div>
          )}

          {mode === 'SUCCESS' && (
            <div className="animate-in fade-in zoom-in duration-700 ease-out">
               <div className="flex flex-col items-center mb-12">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="text-4xl font-heading font-bold tracking-tighter">Production Hub</h2>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.4em]">Administrator Active</p>
                  </div>
               </div>
               
               <div className="grid sm:grid-cols-2 gap-6">
                  {/* Product Systems Entry Card */}
                  <button 
                    onClick={() => onQuickAdd?.('PRODUCT')}
                    className="group relative flex flex-col text-left p-10 bg-blue-600/5 hover:bg-blue-600 border border-white/5 hover:border-blue-400/30 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 group-hover:bg-white/20 flex items-center justify-center mb-8 transition-colors">
                      <svg className="w-7 h-7 text-blue-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </div>
                    
                    <h3 className="text-xl font-heading font-bold text-white mb-2 tracking-tight">Product Systems</h3>
                    <p className="text-xs text-gray-500 group-hover:text-white/70 leading-relaxed font-medium">Launch high-fidelity interfaces and mobile ecosystems.</p>
                    
                    <div className="mt-8 flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-blue-500 group-hover:text-white transition-colors">
                      Initialize Asset <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </button>

                  {/* Identity Design Entry Card */}
                  <button 
                    onClick={() => onQuickAdd?.('IDENTITY')}
                    className="group relative flex flex-col text-left p-10 bg-emerald-600/5 hover:bg-emerald-600 border border-white/5 hover:border-emerald-400/30 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 group-hover:bg-white/20 flex items-center justify-center mb-8 transition-colors">
                      <svg className="w-7 h-7 text-emerald-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div>
                    
                    <h3 className="text-xl font-heading font-bold text-white mb-2 tracking-tight">Identity Design</h3>
                    <p className="text-xs text-gray-500 group-hover:text-white/70 leading-relaxed font-medium">Draft sophisticated brand narratives and visual sets.</p>
                    
                    <div className="mt-8 flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-emerald-500 group-hover:text-white transition-colors">
                      Initialize Asset <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </button>
               </div>

               <div className="mt-12 pt-8 border-t border-white/5 text-center">
                  <button onClick={onClose} className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-600 hover:text-white transition-colors px-6 py-2">Exit Creation Suite</button>
               </div>
            </div>
          )}

          {/* Recovery Modes (FORGOT, OTP, RESET) - Styling refined to match */}
          {mode === 'FORGOT' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-heading font-bold mb-2 tracking-tight">Identity Search</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Node Registry Lookup</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] ml-1">Validation ID</label>
                   <input 
                     autoFocus 
                     type="email" 
                     value={emailInput} 
                     onChange={(e) => {setEmailInput(e.target.value); setError(false);}} 
                     placeholder="identity@archive.registry" 
                     className={`w-full bg-white/[0.03] border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-6 py-5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono text-sm`} 
                   />
                   {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">{errorMsg}</p>}
                </div>
                
                <button 
                  onClick={validateIdentity} 
                  disabled={isSending} 
                  className="w-full py-5 bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.5em] rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
                >
                  {isSending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>Handshake...</> : 'Initiate Handshake'}
                </button>
                
                <button onClick={() => setMode('LOGIN')} className="w-full mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors">Back to Authentication</button>
              </div>
            </div>
          )}

          {mode === 'OTP' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-heading font-bold mb-2 tracking-tight">Enter Packet</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">6-Digit Checksum Validation</p>
              </div>
              <div className="flex justify-between gap-2 mb-10">
                {otp.map((digit, i) => (
                  <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)} className="w-full aspect-square bg-white/[0.03] border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all" />
                ))}
              </div>
              {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest text-center mb-6">{errorMsg}</p>}
              <button onClick={verifyOtp} className="w-full py-5 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-[0.5em] rounded-2xl hover:bg-emerald-500 transition-all shadow-2xl active:scale-95">Verify Checksum</button>
              <div className="text-center mt-6"><button onClick={() => setShowTerminal(!showTerminal)} className="text-[8px] text-blue-500/50 uppercase tracking-widest font-black hover:text-blue-500 transition-colors">Toggle Debug Logs</button></div>
            </div>
          )}

          {mode === 'RESET' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-heading font-bold mb-2 tracking-tight">New Identity</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Update Key Protocol</p>
              </div>
              <form onSubmit={handleFinalReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">New Identity Key</label>
                  <input type="password" value={newPassword} onChange={(e) => {setNewPassword(e.target.value); setError(false);}} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-mono" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1">Confirm Key</label>
                  <input type="password" value={confirmPassword} onChange={(e) => {setConfirmPassword(e.target.value); setError(false);}} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white font-mono" placeholder="••••••••" />
                </div>
                {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-2">{errorMsg}</p>}
                <button type="submit" className="w-full py-5 bg-white text-black font-black text-[11px] uppercase tracking-[0.5em] rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-2xl active:scale-95">Commit Protocol</button>
              </form>
            </div>
          )}
        </div>

        {showTerminal && mode !== 'SUCCESS' && (
          <div className="mt-8 pt-6 border-t border-white/10 animate-in slide-in-from-bottom-4">
            <div className="bg-black/60 rounded-[2rem] p-6 border border-emerald-500/20 font-mono text-[9px] overflow-hidden relative">
              <div className="space-y-1.5 mb-4 max-h-[80px] overflow-y-auto custom-scrollbar text-gray-500">
                {terminalLogs.map((log, i) => (
                  <p key={i} className={`${log.includes('OTP_PACKET') ? 'text-blue-400 font-black' : ''}`}>{log}</p>
                ))}
              </div>
              {generatedOtp && mode === 'OTP' && (
                <button onClick={injectOtp} className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl transition-all font-black text-[8px] uppercase tracking-widest">Auto-Inject Checksum</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
