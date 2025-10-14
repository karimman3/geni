
import React, { useState, useCallback } from 'react';
import { Tab, Frame, GenerationState } from './types';
import { generateVideoFromFrames } from './services/geminiService';
import FramesPanel from './components/FramesPanel';
import PreviewPanel from './components/PreviewPanel';
import { TextIcon, FramesIcon, ElementsIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Frames);
  const [prompt, setPrompt] = useState<string>('');
  const [frames, setFrames] = useState<Frame[]>([]);
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'idle',
    progress: '',
    videoUrl: null,
    error: null,
  });
  const [includeSound, setIncludeSound] = useState<boolean>(true);

  const handleGenerate = useCallback(async () => {
    if (!prompt || frames.length === 0) {
      setGenerationState({
        status: 'error',
        progress: '',
        videoUrl: null,
        error: 'Please provide a prompt and at least one frame.',
      });
      return;
    }

    setGenerationState({ status: 'loading', progress: 'Initializing...', videoUrl: null, error: null });

    try {
      // The VEO API uses the first image as an initial reference.
      const firstFrame = frames[0];
      const videoUrl = await generateVideoFromFrames(prompt, firstFrame, (progressMessage) => {
        setGenerationState(prevState => ({ ...prevState, progress: progressMessage }));
      });
      setGenerationState({ status: 'success', progress: 'Video generated!', videoUrl, error: null });
    } catch (error) {
      console.error('Video generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setGenerationState({ status: 'error', progress: '', videoUrl: null, error: `Generation failed: ${errorMessage}` });
    }
  }, [prompt, frames]);

  const renderActivePanel = () => {
    switch (activeTab) {
      case Tab.TextToVideo:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <h2 className="text-2xl font-bold mb-4">Text to Video</h2>
            <p>This feature is coming soon.</p>
          </div>
        );
      case Tab.Frames:
        return (
          <FramesPanel
            prompt={prompt}
            setPrompt={setPrompt}
            frames={frames}
            setFrames={setFrames}
            includeSound={includeSound}
            setIncludeSound={setIncludeSound}
            onGenerate={handleGenerate}
            isLoading={generationState.status === 'loading'}
          />
        );
      case Tab.Elements:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <h2 className="text-2xl font-bold mb-4">Elements</h2>
            <p>This feature is coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
      <header className="px-6 py-4 border-b border-gray-700">
        <h1 className="text-xl font-bold tracking-wider">AI Video Generator</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-20 bg-gray-900/50 border-r border-gray-700 p-2 flex flex-col items-center space-y-4">
          <TabButton
            icon={<TextIcon />}
            label="Text to Video"
            isActive={activeTab === Tab.TextToVideo}
            onClick={() => setActiveTab(Tab.TextToVideo)}
          />
          <TabButton
            icon={<FramesIcon />}
            label="Frames"
            isActive={activeTab === Tab.Frames}
            onClick={() => setActiveTab(Tab.Frames)}
          />
          <TabButton
            icon={<ElementsIcon />}
            label="Elements"
            isActive={activeTab === Tab.Elements}
            onClick={() => setActiveTab(Tab.Elements)}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-800/20">
          {renderActivePanel()}
        </main>

        {/* Right Sidebar */}
        <aside className="w-1/3 min-w-[400px] bg-gray-900/50 border-l border-gray-700 p-6 flex flex-col">
          <PreviewPanel state={generationState} />
        </aside>
      </div>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-blue-600 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
    }`}
    aria-label={label}
  >
    {icon}
    <span className="text-xs mt-1">{label.split(' ')[0]}</span>
  </button>
);


export default App;