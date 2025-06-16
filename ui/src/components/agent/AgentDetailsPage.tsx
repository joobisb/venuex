import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Edit, MoreVertical, Sparkles } from 'lucide-react';
import IntegrationBadges from '../shared/IntegrationBadges';
import AgentChat from './AgentChat';
import AgentTaskList from './AgentTaskList';
import { findAgentById } from '../../data/mockData';

const AgentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const agent = findAgentById(id || '');
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'logs'>('chat');

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Agent not found</h2>
          <p className="text-gray-500">The agent you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Agent Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{agent.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{agent.description}</p>
              <div className="mb-3">
                <IntegrationBadges integrations={agent.integrations} />
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    agent.status === 'Running'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : agent.status === 'Idle'
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {agent.status}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last active: {agent.lastActive}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Play size={16} />
              <span>Run Agent</span>
            </button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Edit size={16} />
              <span>Edit</span>
            </button>
            <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Chat Section - Takes 3/4 of the space */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
              <div className="flex">
                <button
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveTab('chat')}
                >
                  Chat
                </button>
                <button
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'tasks'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveTab('tasks')}
                >
                  Tasks
                </button>
                <button
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'logs'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveTab('logs')}
                >
                  Logs
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0">
              {activeTab === 'chat' && <AgentChat agentId={agent.id} />}
              {activeTab === 'tasks' && (
                <div className="p-6">
                  <AgentTaskList agentId={agent.id} />
                </div>
              )}
              {activeTab === 'logs' && (
                <div className="p-6 text-gray-600 dark:text-gray-300">
                  <p className="text-sm">Activity logs will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Takes 1/4 of the space */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Agent Details</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agent.created}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Modified</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agent.modified}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Runs</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{agent.runs} runs</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value="••••••••••••••••"
                    disabled
                    className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 flex-1"
                  />
                  <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    Show
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetailsPage;