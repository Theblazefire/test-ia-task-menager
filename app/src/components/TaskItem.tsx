import { useState } from 'react';
import type { Task, TaskStatus } from '@/types/task';
import { statusColors, statusLabels, statusIcons } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, Pause, RotateCcw, Plus, Trash2, Calendar, Clock, AlignLeft, Timer, Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface TaskItemProps {
  task: Task;
  level?: number;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onCreateSubtask: (parentId: string) => void;
  onToggleTimer: (taskId: string) => void;
  onResetTimer: (taskId: string) => void;
  onSetTimerDuration: (taskId: string, duration: number) => void;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
  formatTime: (seconds: number) => string;
}

const statusOptions: TaskStatus[] = ['not-started', 'preparing', 'in-progress', 'completed'];

// Preset timer durations
const timerPresets = [
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
  { label: '25 min', value: 1500 },
  { label: '30 min', value: 1800 },
  { label: '45 min', value: 2700 },
  { label: '1 ora', value: 3600 },
  { label: '2 ore', value: 7200 },
];

export function TaskItem({
  task,
  level = 0,
  onUpdate,
  onDelete,
  onCreateSubtask,
  onToggleTimer,
  onResetTimer,
  onSetTimerDuration,
  onChangeStatus,
  formatTime,
}: TaskItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [timerDialogOpen, setTimerDialogOpen] = useState(false);
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customSeconds, setCustomSeconds] = useState(0);

  const hasSubtasks = task.subtasks.length > 0;
  const indentColor = ['bg-gray-200', 'bg-blue-200', 'bg-green-200', 'bg-purple-200', 'bg-pink-200'][level % 5];
  
  // Calcola la percentuale di tempo rimanente
  const timePercentage = task.timerDuration > 0 
    ? (task.timerRemaining / task.timerDuration) * 100 
    : 0;

  const handleCustomTimerSet = () => {
    const totalSeconds = (customHours * 3600) + (customMinutes * 60) + customSeconds;
    if (totalSeconds > 0) {
      onSetTimerDuration(task.id, totalSeconds);
      setTimerDialogOpen(false);
    }
  };

  return (
    <div className="w-full">
      <Card className={`${statusColors[task.status]} text-white shadow-lg transition-all duration-300 hover:shadow-xl border-2`}>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Expand/Collapse for subtasks */}
            {hasSubtasks && (
              <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 text-white hover:bg-white/20">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            )}

            {/* Status Icon */}
            <span className="text-lg" title={statusLabels[task.status]}>
              {statusIcons[task.status]}
            </span>

            {/* Title Input */}
            <Input
              value={task.title}
              onChange={(e) => onUpdate(task.id, { title: e.target.value })}
              className="flex-1 min-w-[150px] bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30"
              placeholder="Titolo task..."
            />

            {/* Date Picker */}
            <div className="flex items-center gap-1 bg-white/20 rounded-md px-2 py-1">
              <Calendar className="h-4 w-4" />
              <Input
                type="date"
                value={task.dueDate}
                onChange={(e) => onUpdate(task.id, { dueDate: e.target.value })}
                className="w-auto p-0 h-6 border-none bg-transparent text-white focus:ring-0 [color-scheme:dark]"
              />
            </div>

            {/* Timer Display with Progress */}
            <div className="flex items-center gap-2 bg-white/20 rounded-md px-2 py-1">
              <Clock className="h-4 w-4" />
              <div className="flex flex-col">
                <span className={`font-mono text-sm min-w-[70px] ${task.timerRemaining === 0 ? 'text-red-200 font-bold' : ''}`}>
                  {formatTime(task.timerRemaining)}
                </span>
                {/* Progress bar */}
                <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      timePercentage < 20 ? 'bg-red-300' : 'bg-white'
                    }`}
                    style={{ width: `${timePercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Timer Settings Dialog */}
            <Dialog open={timerDialogOpen} onOpenChange={setTimerDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-1 h-8 w-8"
                  title="Imposta timer"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Imposta Timer
                  </DialogTitle>
                </DialogHeader>
                
                {/* Preset buttons */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {timerPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onSetTimerDuration(task.id, preset.value);
                        setTimerDialogOpen(false);
                      }}
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                
                {/* Custom time input */}
                <div className="space-y-4">
                  <Label className="text-gray-300">Tempo personalizzato:</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <Input
                        type="number"
                        min={0}
                        max={23}
                        value={customHours}
                        onChange={(e) => setCustomHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                        className="w-16 bg-gray-700 border-gray-600 text-white text-center"
                      />
                      <span className="text-xs text-gray-400 mt-1">Ore</span>
                    </div>
                    <span className="text-xl">:</span>
                    <div className="flex flex-col items-center">
                      <Input
                        type="number"
                        min={0}
                        max={59}
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-16 bg-gray-700 border-gray-600 text-white text-center"
                      />
                      <span className="text-xs text-gray-400 mt-1">Min</span>
                    </div>
                    <span className="text-xl">:</span>
                    <div className="flex flex-col items-center">
                      <Input
                        type="number"
                        min={0}
                        max={59}
                        value={customSeconds}
                        onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-16 bg-gray-700 border-gray-600 text-white text-center"
                      />
                      <span className="text-xs text-gray-400 mt-1">Sec</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleCustomTimerSet}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    Imposta Timer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Timer Controls */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleTimer(task.id)}
              className={`p-1 h-8 w-8 ${
                task.isTimerRunning 
                  ? 'bg-white/30 text-white animate-pulse' 
                  : 'text-white hover:bg-white/20'
              }`}
              title={task.isTimerRunning ? 'Pausa' : 'Avvia'}
            >
              {task.isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResetTimer(task.id)}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
              title="Reset timer"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Description Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDescription(!showDescription)}
              className={`text-white hover:bg-white/20 p-1 h-8 w-8 ${task.description ? 'bg-white/20' : ''}`}
              title="Descrizione"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>

            {/* Add Subtask */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCreateSubtask(task.id)}
              className="text-white hover:bg-white/20 p-1 h-8 w-8"
              title="Aggiungi sotto-task"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Delete */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-white hover:bg-red-600/80 p-1 h-8 w-8"
              title="Elimina"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          {/* Status Buttons */}
          <div className="flex flex-wrap gap-1 mb-2">
            {statusOptions.map((status) => (
              <Button
                key={status}
                size="sm"
                onClick={() => onChangeStatus(task.id, status)}
                className={`text-xs px-2 py-1 h-7 transition-all ${
                  task.status === status
                    ? 'bg-white text-gray-900 font-bold shadow-md'
                    : 'bg-black/20 text-white hover:bg-black/30'
                }`}
              >
                {statusIcons[status]} {statusLabels[status]}
              </Button>
            ))}
          </div>

          {/* Timer expired message */}
          {task.timerRemaining === 0 && task.timerDuration > 0 && (
            <div className="mt-2 p-2 bg-red-600/80 rounded-lg text-center animate-pulse">
              <span className="font-bold">⏰ TEMPO SCADUTO!</span>
            </div>
          )}

          {/* Description Section */}
          {showDescription && (
            <div className="mt-2 animate-in slide-in-from-top-2 duration-200">
              <Textarea
                value={task.description}
                onChange={(e) => onUpdate(task.id, { description: e.target.value })}
                placeholder="Aggiungi una descrizione..."
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 min-h-[80px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subtasks */}
      {hasSubtasks && isOpen && (
        <div className="mt-2 ml-4 pl-4 border-l-4 space-y-2" style={{ borderColor: `var(--${indentColor})` }}>
          {task.subtasks.map((subtask) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              level={level + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onCreateSubtask={onCreateSubtask}
              onToggleTimer={onToggleTimer}
              onResetTimer={onResetTimer}
              onSetTimerDuration={onSetTimerDuration}
              onChangeStatus={onChangeStatus}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}
    </div>
  );
}
