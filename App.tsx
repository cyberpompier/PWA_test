
import React, { useState, useEffect, useMemo } from 'react';
import { Task, NetworkStatus } from './types';

// Composants Icones SVG optimisés, ok
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const EmptyBoxIcon = () => (
  <svg className="w-16 h-16 text-indigo-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<NetworkStatus>(navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Stats calculées pour éviter les re-rendus inutiles
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  }), [tasks]);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_v2_core');
    if (saved) setTasks(JSON.parse(saved));

    const handleOnline = () => setStatus(NetworkStatus.ONLINE);
    const handleOffline = () => setStatus(NetworkStatus.OFFLINE);
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_v2_core', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setInputValue('');
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    if (navigator.vibrate) navigator.vibrate(5);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(t => !t.completed));
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
  };

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-indigo-100 pb-20">
      {/* Barre de statut immersive */}
      <div className={`fixed top-0 inset-x-0 h-1.5 z-50 transition-colors duration-500 ${status === NetworkStatus.ONLINE ? 'bg-indigo-500' : 'bg-amber-500 animate-pulse'}`} />

      <div className="max-w-xl mx-auto px-5 pt-12 sm:pt-20">
        <header className="flex justify-between items-end mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-4xl font-black tracking-tighter text-indigo-950">Lumina</h1>
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-indigo-100">v2.1</span>
            </div>
            <p className="text-slate-400 font-medium">Votre espace de clarté mentale.</p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {deferredPrompt && (
              <button 
                onClick={installApp}
                className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Installer l'App
              </button>
            )}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-tight ${status === NetworkStatus.ONLINE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status === NetworkStatus.ONLINE ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {status}
            </div>
          </div>
        </header>

        <main className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Formulaire d'ajout */}
          <form onSubmit={addTask} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[2rem] blur opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
            <div className="relative bg-white border border-slate-100 rounded-[1.8rem] shadow-2xl shadow-indigo-50/50 p-2 flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nouvel objectif..."
                className="flex-1 px-5 py-3.5 bg-transparent outline-none text-slate-700 font-semibold placeholder:text-slate-300 placeholder:font-normal"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all shadow-lg shadow-indigo-100"
              >
                <PlusIcon />
              </button>
            </div>
          </form>

          {/* Liste des tâches */}
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 overflow-hidden min-h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto max-h-[50vh] scrollbar-hide p-4">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-in zoom-in-95 duration-500">
                  <EmptyBoxIcon />
                  <h3 className="mt-4 text-slate-800 font-bold">L'esprit est libre</h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-[200px]">Ajoutez une tâche pour structurer votre journée.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`group flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-500 border ${task.completed ? 'bg-slate-50/50 border-transparent opacity-60' : 'bg-white border-slate-50 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/30'}`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 transform ${task.completed ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-100 rotate-0' : 'border-2 border-slate-200 text-transparent hover:border-indigo-300 -rotate-12 hover:rotate-0'}`}
                      >
                        <CheckIcon />
                      </button>
                      
                      <span className={`flex-1 text-sm font-bold transition-all duration-500 ${task.completed ? 'text-slate-400 line-through decoration-indigo-300/50' : 'text-slate-700'}`}>
                        {task.title}
                      </span>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pied de liste intelligent */}
            {tasks.length > 0 && (
              <div className="px-8 py-5 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">{stats.pending}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">À faire</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{stats.completed}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Fini</span>
                  </div>
                </div>

                {stats.completed > 0 && (
                  <button 
                    onClick={clearCompleted}
                    className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-all"
                  >
                    Nettoyer
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className="mt-12 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Optimisé pour l'expérience PWA native
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
