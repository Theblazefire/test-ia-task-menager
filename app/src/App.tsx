import { useTasks } from '@/hooks/useTasks';
import { TaskItem } from '@/components/TaskItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, CheckCircle2, Clock, ListTodo, Search, X } from 'lucide-react';
import { statusLabels, statusColors } from '@/types/task';
import type { TaskStatus } from '@/types/task';

function App() {
  const {
    tasks,
    filteredTasks,
    searchQuery,
    setSearchQuery,
    createTask,
    updateTask,
    deleteTask,
    toggleTimer,
    resetTimer,
    setTimerDuration,
    changeStatus,
    formatTime,
  } = useTasks();

  // Calculate statistics
  const getAllTasks = (tasks: any[]): any[] => {
    let all: any[] = [];
    tasks.forEach(task => {
      all.push(task);
      all = all.concat(getAllTasks(task.subtasks));
    });
    return all;
  };

  const allTasks = getAllTasks(tasks);
  const stats = {
    total: allTasks.length,
    notStarted: allTasks.filter(t => t.status === 'not-started').length,
    preparing: allTasks.filter(t => t.status === 'preparing').length,
    inProgress: allTasks.filter(t => t.status === 'in-progress').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    totalTime: allTasks.reduce((acc, t) => acc + t.timerDuration - t.timerRemaining, 0),
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <ListTodo className="h-10 w-10 md:h-12 md:w-12 text-blue-400" />
            Task Manager
          </h1>
          <p className="text-gray-400 text-lg">Organizza il tuo lavoro con task e sotto-task</p>
        </header>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-gray-800/80 backdrop-blur rounded-xl p-4 text-center border border-gray-700">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Task Totali</div>
          </div>
          <div className="bg-red-900/40 backdrop-blur rounded-xl p-4 text-center border border-red-700/50">
            <div className="text-2xl font-bold text-red-400">{stats.notStarted}</div>
            <div className="text-xs text-red-300/70">{statusLabels['not-started']}</div>
          </div>
          <div className="bg-yellow-900/40 backdrop-blur rounded-xl p-4 text-center border border-yellow-700/50">
            <div className="text-2xl font-bold text-yellow-400">{stats.preparing}</div>
            <div className="text-xs text-yellow-300/70">{statusLabels['preparing']}</div>
          </div>
          <div className="bg-blue-900/40 backdrop-blur rounded-xl p-4 text-center border border-blue-700/50">
            <div className="text-2xl font-bold text-blue-400">{stats.inProgress}</div>
            <div className="text-xs text-blue-300/70">{statusLabels['in-progress']}</div>
          </div>
          <div className="bg-green-900/40 backdrop-blur rounded-xl p-4 text-center border border-green-700/50">
            <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-xs text-green-300/70">{statusLabels['completed']}</div>
          </div>
          <div className="bg-purple-900/40 backdrop-blur rounded-xl p-4 text-center border border-purple-700/50">
            <div className="text-2xl font-bold text-purple-400 flex items-center justify-center gap-1">
              <Clock className="h-5 w-5" />
              {formatTime(stats.totalTime)}
            </div>
            <div className="text-xs text-purple-300/70">Tempo Totale</div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-800/60 backdrop-blur rounded-xl p-4 mb-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
            Legenda Status
          </h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(statusLabels) as TaskStatus[]).map((status) => (
              <div
                key={status}
                className={`${statusColors[status]} px-3 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2`}
              >
                <span>{statusLabels[status]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cerca task per nome o descrizione..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-3 h-12 bg-gray-800/80 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {isSearching && (
            <p className="text-center text-gray-400 mt-2 text-sm">
              {filteredTasks.length} task trovati per "{searchQuery}"
            </p>
          )}
        </div>

        {/* Add Main Task Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={() => createTask(null)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 h-auto text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuovo Task Principale
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 bg-gray-800/40 rounded-2xl border-2 border-dashed border-gray-700">
              <ListTodo className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {isSearching ? 'Nessun task trovato' : 'Nessun task presente'}
              </h3>
              <p className="text-gray-500 mb-4">
                {isSearching 
                  ? 'Prova a cercare con un altro termine' 
                  : 'Crea il tuo primo task per iniziare ad organizzare il lavoro'}
              </p>
              {!isSearching && (
                <Button
                  onClick={() => createTask(null)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Task
                </Button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onCreateSubtask={createTask}
                onToggleTimer={toggleTimer}
                onResetTimer={resetTimer}
                onSetTimerDuration={setTimerDuration}
                onChangeStatus={changeStatus}
                formatTime={formatTime}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Task Manager - Organizza il tuo lavoro in modo efficiente</p>
          <p className="mt-1 text-gray-600">I task vengono salvati automaticamente</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
