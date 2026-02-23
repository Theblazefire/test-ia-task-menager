export type TaskStatus = 'not-started' | 'preparing' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  timerDuration: number; // tempo impostato in secondi
  timerRemaining: number; // tempo rimanente in secondi
  isTimerRunning: boolean;
  subtasks: Task[];
  createdAt: number;
}

export const statusColors: Record<TaskStatus, string> = {
  'not-started': 'bg-red-500 border-red-600',
  'preparing': 'bg-yellow-500 border-yellow-600',
  'in-progress': 'bg-blue-500 border-blue-600',
  'completed': 'bg-green-500 border-green-600',
};

export const statusLabels: Record<TaskStatus, string> = {
  'not-started': 'Da iniziare',
  'preparing': 'In preparazione',
  'in-progress': 'In svolgimento',
  'completed': 'Completato',
};

export const statusIcons: Record<TaskStatus, string> = {
  'not-started': '⭕',
  'preparing': '⏳',
  'in-progress': '🔄',
  'completed': '✅',
};

// Funzione per riprodurre un suono di allarme
export function playAlarmSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Crea un oscillatore per il suono
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configura il suono (beep-beep-beep)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // La4
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Suona per 0.5 secondi
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Secondo beep
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, audioContext.currentTime);
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 600);
    
    // Terzo beep
    setTimeout(() => {
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(880, audioContext.currentTime);
      gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      osc3.start(audioContext.currentTime);
      osc3.stop(audioContext.currentTime + 0.8);
    }, 1200);
    
  } catch (error) {
    console.error('Errore nella riproduzione del suono:', error);
  }
}
