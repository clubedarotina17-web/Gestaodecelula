
export type CellType = 'Adulto' | 'Jovem' | 'Juvenil' | 'Kids';

export interface Visitor {
  name: string;
  phone: string;
  address: string;
  isBaptized: boolean;
  hasAttendedEncounter: boolean;
}

export interface Cell {
  id: string;
  name: string;
  leader: string;
  host: string;
  trainee: string;
  secretary: string;
  team: string[];
  address: string;
  type: CellType;
  day: string; // 'Segunda-Feira', 'Terça-Feira', etc.
  time: string;
  region: string;
  phone: string;
  leaderPhoto?: string; // Base64 da imagem do líder
  dismissedLateDate?: string; // Data do alerta de atraso ignorador
}

export interface Report {
  id: string;
  cellId: string;
  cellName: string;
  date: string;
  attendance: number;
  visitors: number;
  conversions: number;
  weeklyVisits: number;
  firstTimeVisitorsCount: number;
  firstTimeVisitorsList?: Visitor[];
  childrenCount: number;
  offering: number;
  kidsOffering: number;
  summary: string;
  isLate?: boolean;
}

export interface Baptism {
  id: string;
  name: string;
  whatsapp: string;
  date: string;
  cellName: string;
}

export interface Share {
  id: string;
  title: string;
  description: string;
  date: string;
  fileUrl: string;
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  cellType: CellType | 'Todas';
}

export interface Goal {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  objective: string;
  cellType: CellType | 'Todas';
  cellId?: string;
  report: string;
  isCompleted: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'visitor' | 'late' | 'event' | 'info' | 'notice';
  visitorPhone?: string;
  cellId?: string; // ID da célula associada para filtragem de acesso
}

export type UserRole = 'leader' | 'admin' | null;

export interface AppState {
  role: UserRole;
  selectedCell: Cell | null;
  isAuthenticated: boolean;
}
