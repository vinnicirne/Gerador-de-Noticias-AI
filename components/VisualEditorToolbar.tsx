
import React from 'react';

interface VisualEditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
}

const VisualEditorToolbar: React.FC<VisualEditorToolbarProps> = ({ onFormat }) => {
  const tools = [
    { label: 'Negrito', command: 'bold', icon: 'B', style: 'font-bold' },
    { label: 'Itálico', command: 'italic', icon: 'I', style: 'italic' },
    { label: 'Sublinhado', command: 'underline', icon: 'U', style: 'underline' },
    { label: 'H2', command: 'formatBlock', value: 'h2', icon: 'H2', style: 'font-bold text-sm' },
    { label: 'H3', command: 'formatBlock', value: 'h3', icon: 'H3', style: 'font-bold text-xs' },
    { label: 'Lista', command: 'insertUnorderedList', icon: '•', style: '' },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg border border-gray-700 mb-2 shadow-sm sticky top-0 z-10">
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={() => onFormat(tool.command, tool.value)}
          className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-sm ${tool.style}`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};

export default VisualEditorToolbar;
