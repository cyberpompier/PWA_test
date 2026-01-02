
import React, { useState, useEffect, useCallback } from 'react';
import { Task, NetworkStatus } from './types';

// Icons as functional components to keep everything self-contained
const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<NetworkStatus>(navigator.onLine ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initialize data from local storage (Offline persistence)
  useEffect(() => {
    const savedTasks = localStorage.getItem('lumina_tasks');
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

  // Sync tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lumina_tasks', JSON.stringify(tasks));
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
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8">
      {/* Network Status Header */}
      <div className={`fixed top-0 left-0 right-0 h-1 transition-all duration-300 ${status === NetworkStatus.ONLINE ? 'bg-indigo-500' : 'bg-amber-500'}`} />
      
      <div className="w-full max-w-2xl mt-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Lumina</h1>
            <p className="text-slate-500 mt-1">Gestionnaire de tâches intelligent & hors-ligne.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all text-sm"
              >
                Installer l'app
              </button>
            )}
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${status === NetworkStatus.ONLINE ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {status}
            </div>
          </div>
        </header>

        <main className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          {/* Input Section */}
          <form onSubmit={addTask} className="p-6 border-b border-slate-50">
            <div className="relative group">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Quelle est votre prochaine étape ?"
                className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-90 transition-all shadow-md"
              >
                <PlusIcon />
              </button>
            </div>
          </form>

          {/* List Section */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {tasks.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusIcon />
                </div>
                <h3 className="text-slate-900 font-semibold">Aucune tâche pour le moment</h3>
                <p className="text-slate-500 text-sm mt-1">Commencez par en ajouter une ci-dessus.</p>
              </div>
            ) : (
              <ul className="space-y-2 p-4">
                {tasks.map((task) => (
                  <li 
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent ${task.completed ? 'bg-slate-50 opacity-60' : 'bg-white hover:border-slate-200 hover:shadow-sm'}`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 text-white' : 'border-2 border-slate-200 text-transparent hover:border-indigo-300'}`}
                    >
                      <CheckIcon />
                    </button>
                    
                    <span className={`flex-1 text-slate-700 transition-all ${task.completed ? 'line-through decoration-slate-400' : ''}`}>
                      {task.title}
                    </span>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer Status */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
             <span>{tasks.length} tâche{tasks.length > 1 ? 's' : ''} au total</span>
             <span className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${status === NetworkStatus.ONLINE ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
               {status === NetworkStatus.ONLINE ? 'Connecté' : 'Mode Hors-ligne'}
             </span>
          </div>
        </main>

        <footer className="mt-8 text-center text-slate-400 text-xs">
          <p>© 2024 Lumina PWA • Prêt pour l'installation native</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
