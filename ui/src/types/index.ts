export type Agent = {
  id: string;
  name: string;
  description: string;
  status: 'Running' | 'Idle' | 'Error';
  integrations: string[];
  created: string;
  modified: string;
  lastActive: string;
  runs: number;
};

export type Message = {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'scheduled' | 'failed';
  time: string;
  integration: string;
};