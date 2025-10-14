
import React from 'react';
import type { GenerationState } from '../types';
import { VideoIcon } from './Icons';

interface PreviewPanelProps {
  state: GenerationState;
}

const LoadingSpinner: React.FC = () => (
  <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin"></div>
);

const PreviewPanel: React.FC<PreviewPanelProps> = ({ state }) => {
  const renderContent = () => {
    switch (state.status) {
      case 'idle':
        return (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
            <VideoIcon />
            <p className="mt-4 text-lg">Your generated video will appear here.</p>
            <p className="text-sm">Add frames and a prompt to get started.</p>
          </div>
        );
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <LoadingSpinner />
            <p className="mt-4 text-lg text-gray-300">Generating Video...</p>
            <p className="text-sm text-gray-400">{state.progress}</p>
            <div className="mt-4 bg-gray-700 rounded-full w-full h-4">
              <div className="bg-blue-600 h-4 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            <p className="mt-4 text-xs text-gray-500">
                Generation can take a few minutes. Please be patient.
            </p>
          </div>
        );
      case 'success':
        return (
          <div className="w-full h-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Generated Video</h3>
            {state.videoUrl && (
              <video
                src={state.videoUrl}
                controls
                autoPlay
                loop
                className="w-full rounded-lg aspect-video bg-black"
              >
                Your browser does not support the video tag.
              </video>
            )}
            <div className="mt-4 flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                <p className="text-sm font-mono text-gray-300">10s | 1 Count</p>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors">Download</button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-center text-red-400 h-full bg-red-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-bold">Generation Failed</h3>
            <p className="mt-2 text-sm">{state.error}</p>
          </div>
        );
    }
  };

  return <div className="flex flex-col h-full">{renderContent()}</div>;
};

export default PreviewPanel;
