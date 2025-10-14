
export enum Tab {
  TextToVideo = 'TextToVideo',
  Frames = 'Frames',
  Elements = 'Elements',
}

export interface Frame {
  id: string;
  dataUrl: string;
  file: File;
}

export interface GenerationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  progress: string;
  videoUrl: string | null;
  error: string | null;
}
