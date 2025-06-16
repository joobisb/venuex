import React, { useState } from 'react';
import { Check, Clock, X, Calendar, Mail, FileText } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  status: 'completed' | 'scheduled' | 'failed';
  time: string;
  integration: string;
};

type AgentTaskListProps = {
  agentId: string;
};

const AgentTaskList = ({ agentId }: AgentTaskListProps) => {
  // Mock tasks for the agent
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Check calendar for upcoming meetings',
      status: 'completed',
      time: '2 hours ago',
      integration: 'calendar',
    },
    {
      id: '2',
      title: 'Send weekly report summary to email',
      status: 'completed',
      time: '5 hours ago',
      integration: 'gmail',
    },
    {
      id: '3',
      title: 'Schedule reminder for project deadline',
      status: 'scheduled',
      time: 'Tomorrow at 9:00 AM',
      integration: 'calendar',
    },
    {
      id: '4',
      title: 'Summarize Notion meeting notes',
      status: 'failed',
      time: '1 day ago',
      integration: 'notion',
    },
  ]);

  // Get icon for integration
  const getIntegrationIcon = (integration: string) => {
    switch (integration) {
      case 'calendar':
        return <Calendar size={16} className="text-blue-600" />;
      case 'gmail':
        return <Mail size={16} className="text-red-600" />;
      case 'notion':
        return <FileText size={16} className="text-gray-800" />;
      default:
        return null;
    }
  };

  // Get status icon and color
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check size={16} className="text-green-600" />;
      case 'scheduled':
        return <Clock size={16} className="text-orange-600" />;
      case 'failed':
        return <X size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Task History</h3>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIntegrationIcon(task.integration)}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.time}</p>
                </div>
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : task.status === 'scheduled'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  <span className="mr-1">{getStatusIndicator(task.status)}</span>
                  <span className="capitalize">{task.status}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentTaskList;