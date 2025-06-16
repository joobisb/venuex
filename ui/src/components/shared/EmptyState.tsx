import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type EmptyStateProps = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon: ReactNode;
};

const EmptyState = ({ title, description, buttonText, buttonLink, icon }: EmptyStateProps) => {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <Link
        to={buttonLink}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-primary-700 transition shadow-sm"
      >
        {buttonText}
      </Link>
    </div>
  );
};

export default EmptyState;