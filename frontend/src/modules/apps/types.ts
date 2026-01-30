export type AppStatus = 'online' | 'offline' | 'unknown';

export type HomelabApp = {
  id: string;
  name: string;
  category: string;
  url: string;
  status: AppStatus;
  description: string;
};
