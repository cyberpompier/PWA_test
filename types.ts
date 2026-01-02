
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline'
}
