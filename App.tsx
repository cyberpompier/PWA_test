
import React, { useState, useEffect } from 'react';
import { Task, NetworkStatus } from './types';

// Icons as functional components
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<NetworkStatus>(navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('lumina_tasks_v2');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    const handleOnline = () => setStatus(NetworkStatus.ONLINE);
    const handleOffline = () => setStatus(NetworkStatus.OFFLINE);
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_tasks_v2', JSON.stringify(tasks));
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

    setTasks(prev => [newTask, ...prev]);
    setInputValue('');
    
    // Provide a small haptic feedback via JS if supported
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    if (window.navigator.vibrate) window.navigator.vibrate(5);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    if (window.navigator.vibrate) window.navigator.vibrate(15);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setIsInstalling(true);
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center safe-top safe-bottom p-4 sm:p-8">
      {/* Dynamic Status Bar */}
      <div className={`fixed top-0 left-0 right-0 h-1 transition-all duration-700 z-50 ${status === NetworkStatus.ONLINE ? 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`} />
      
      <div className="w-full max-w-xl mt-4 sm:mt-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Lumina
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </h1>
            <p className="text-slate-400 text-sm font-medium">Productivité sans limite</p>
          </div>
          
          <div className="flex items-center gap-2">
             {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="px-4 py-2 bg-slate-900 text-white rounded-2xl font-semibold text-xs shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {isInstalling ? 'Installation...' : 'Installer'}
              </button>
            )}
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${status === NetworkStatus.ONLINE ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              {status}
            </div>
          </div>
        </header>

        <main className="space-y-6">
          {/* Enhanced Input Form */}
          <form onSubmit={addTask} className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/40 p-1.5 flex items-center border border-white">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nouvelle tâche..."
                className="flex-1 bg-transparent px-5 py-3.5 outline-none text-slate-700 font-medium placeholder:text-slate-300"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-700 active:scale-90 transition-all shadow-lg shadow-indigo-100"
              >
                <PlusIcon />
              </button>
            </div>
          </form>

          {/* Task List Container */}
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/30 border border-slate-100 overflow-hidden">
            <div className="max-h-[55vh] overflow-y-auto scrollbar-hide">
              {tasks.length === 0 ? (
                <div className="py-24 text-center px-6 animate-in fade-in zoom-in duration-500">
                  <div className="flex justify-center mb-6">
                    <MoonIcon />
                  </div>
                  <h3 className="text-slate-800 font-bold text-lg">C'est le calme plat</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-[200px] mx-auto leading-relaxed">
                    Votre liste est vide. Ajoutez une tâche pour commencer votre journée.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {tasks.map((task) => (
                    <div 
                      key={task.id}
                      className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border ${task.completed ? 'bg-slate-50 border-slate-50' : 'bg-white border-slate-100 hover:border-indigo-100 hover:shadow-sm'}`}
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-100' : 'border-2 border-slate-200 text-transparent hover:border-indigo-300'}`}
                      >
                        <CheckIcon />
                      </button>
                      
                      <span className={`flex-1 text-sm font-semibold transition-all duration-500 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
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

            {/* Subtle Footer Stats */}
            {tasks.length > 0 && (
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {tasks.filter(t => t.completed).length} / {tasks.length} complétées
                </p>
                <div className="flex gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${status === NetworkStatus.ONLINE ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="mt-12 text-center space-y-2">
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-tighter">
            Conçu pour l'excellence • Hors-ligne par défaut
          </p>
          <div className="flex justify-center gap-4 text-slate-300">
             <div className="w-1 h-1 rounded-full bg-slate-200" />
             <div className="w-1 h-1 rounded-full bg-slate-200" />
             <div className="w-1 h-1 rounded-full bg-slate-200" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
