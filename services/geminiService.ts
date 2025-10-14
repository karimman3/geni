
import { GoogleGenAI } from '@google/genai';
import type { Frame } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const base64Encode = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:image/jpeg;base64,
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateVideoFromFrames = async (
  prompt: string,
  frame: Frame,
  onProgress: (message: string) => void
): Promise<string> => {
  onProgress('Encoding image...');
  const base64Image = await base64Encode(frame.file);
  
  onProgress('Starting video generation...');
  let operation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: prompt,
    image: {
      imageBytes: base64Image,
      mimeType: frame.file.type,
    },
    config: {
      numberOfVideos: 1
    }
  });

  let pollCount = 0;
  while (!operation.done) {
    pollCount++;
    const secondsElapsed = pollCount * 10;
    onProgress(`Processing... (${secondsElapsed}s)`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
    } catch (e) {
        console.error("Polling failed, retrying...", e);
    }
  }
  
  onProgress('Finalizing video...');
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

  if (!downloadLink) {
    throw new Error('Video generation completed but no download link was found.');
  }

  onProgress('Fetching video...');
  
  // The API key must be appended to the download URI
  const videoUrlWithKey = `${downloadLink}&key=${process.env.API_KEY}`;

  try {
    const response = await fetch(videoUrlWithKey);
    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Error fetching video blob:", e);
    throw new Error('Could not download the generated video.');
  }
};
