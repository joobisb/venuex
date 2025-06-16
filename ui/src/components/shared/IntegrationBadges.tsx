import React from 'react';
import { Calendar, Mail, FileText, MessageSquare, BellRing } from 'lucide-react';

type IntegrationBadgesProps = {
  integrations: string[];
};

const IntegrationBadges = ({ integrations }: IntegrationBadgesProps) => {
  const getIntegrationDetails = (name: string) => {
    switch (name.toLowerCase()) {
      case 'google calendar':
        return {
          icon: <Calendar size={14} />,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'gmail':
        return {
          icon: <Mail size={14} />,
          color: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'notion':
        return {
          icon: <FileText size={14} />,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
      case 'slack':
        return {
          icon: <MessageSquare size={14} />,
          color: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'notifications':
        return {
          icon: <BellRing size={14} />,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      default:
        return {
          icon: null,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {integrations.map((integration) => {
        const { icon, color } = getIntegrationDetails(integration);
        return (
          <span
            key={integration}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${color}`}
          >
            {icon}
            {integration}
          </span>
        );
      })}
    </div>
  );
};

export default IntegrationBadges;