
import React, { useCallback, useRef, useState } from 'react';
import type { Frame } from '../types';
import { UploadIcon, DeleteIcon, SoundOnIcon, SoundOffIcon } from './Icons';

interface FramesPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  frames: Frame[];
  setFrames: (frames: Frame[]) => void;
  includeSound: boolean;
  setIncludeSound: (include: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const FramesPanel: React.FC<FramesPanelProps> = ({
  prompt,
  setPrompt,
  frames,
  setFrames,
  includeSound,
  setIncludeSound,
  onGenerate,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
// FIX: Explicitly type `file` as `File` to resolve type inference issue.
      const newFrames: Frame[] = files.map((file: File) => ({
        id: `${file.name}-${Date.now()}`,
        dataUrl: URL.createObjectURL(file),
        file: file,
      }));
      setFrames(prev => [...prev, ...newFrames]);
    }
  };

  const handleRemoveFrame = (idToRemove: string) => {
    setFrames(frames.filter(frame => frame.id !== idToRemove));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetId) return;

    const draggedIndex = frames.findIndex(f => f.id === draggedItemId);
    const targetIndex = frames.findIndex(f => f.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newFrames = [...frames];
    const [draggedItem] = newFrames.splice(draggedIndex, 1);
    newFrames.splice(targetIndex, 0, draggedItem);
    setFrames(newFrames);
  };
  
  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow flex flex-col space-y-4">
        <h2 className="text-lg font-semibold text-gray-300">Frames</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-grow overflow-y-auto p-1">
          {frames.map((frame) => (
            <div
              key={frame.id}
              className="relative aspect-video rounded-lg group cursor-grab"
              draggable
              onDragStart={(e) => handleDragStart(e, frame.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, frame.id)}
              onDragEnd={handleDragEnd}
            >
              <img src={frame.dataUrl} alt="frame" className="w-full h-full object-cover rounded-lg" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleRemoveFrame(frame.id)}
                  className="p-2 bg-red-600/80 rounded-full hover:bg-red-500 transition-colors"
                  aria-label="Delete frame"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700/50 hover:border-gray-500 transition-colors"
          >
            <UploadIcon />
            <span className="text-sm mt-2">Upload</span>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </button>
        </div>
      </div>
      <div className="flex-shrink-0 space-y-4">
         <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write a prompt to generate video using these frames..."
            className="w-full h-24 p-4 pr-12 bg-gray-700 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between">
            <button 
                onClick={() => setIncludeSound(!includeSound)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
                {includeSound ? <SoundOnIcon/> : <SoundOffIcon />}
                <span>Sound Effects</span>
            </button>
          <button
            onClick={onGenerate}
            disabled={isLoading || frames.length === 0 || !prompt}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FramesPanel;