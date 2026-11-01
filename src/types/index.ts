export type CategoryId =
  | 'mobili'
  | 'cucina'
  | 'bagno'
  | 'intonaci'
  | 'pavimenti'
  | 'giardino'
  | 'pergole'
  | 'falegnameria'
  | 'muratura'
  | 'idraulica'
  | 'elettricita'
  | 'verniciatura'
  | 'cartongesso'
  | 'isolamento'
  | 'serramenti'
  | 'illuminazione'
  | 'restauro'
  | 'impermeabilizzazione'
  | 'terrazzi'
  | 'attrezzi';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ProjectMaterial {
  name: string;
  quantity: string;
  approxCost: string;
}

export interface ProjectStep {
  stepNumber: number;
  title: string;
  duration: string;
  description: string;
  tip?: string;
}

export interface ProjectCostComparison {
  proEstimate: number;
  proLaborHours: number;
  proLaborRatePerHour: number;
  diyMaterialsCost: number;
  equipmentOrRentalCost: number;
  netSavings: number;
  savingsPercentage: number;
  lastUpdated: string;
  itemsBreakdown: {
    item: string;
    proCost: number;
    diyCost: number;
    note: string;
  }[];
  hypotheses: string[];
  disclaimer: {
    it: string;
    en: string;
  };
}

export interface Project {
  id: string;
  title: {
    it: string;
    en: string;
  };
  category: CategoryId;
  description: {
    it: string;
    en: string;
  };
  difficulty: DifficultyLevel;
  timeEstimate: {
    it: string;
    en: string;
  };
  costEstimate: {
    min: number;
    max: number;
    currency: string;
  };
  coverImage: string;
  gallery: string[];
  dimensions: string;
  room: string;
  materials: ProjectMaterial[];
  tools: string[];
  steps: ProjectStep[];
  expertTip: {
    it: string;
    en: string;
  };
  costComparison?: ProjectCostComparison;
  author: {
    name: string;
    title: string;
    avatar: string;
  };
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface CategoryInfo {
  id: CategoryId;
  iconName: string;
  coverImage: string;
  tagline: {
    it: string;
    en: string;
  };
  subcategories: {
    it: string[];
    en: string[];
  };
}

export interface AIProjectDraft {
  id: string;
  description: string;
  width: number;
  depth: number;
  height: number;
  roomType: string;
  budget: number;
  experienceLevel: DifficultyLevel;
  woodSpecies: string;
  generatedAt: string;
  blueprint: {
    title: string;
    summary: string;
    estimatedCost: string;
    retailPriceEquivalent: string;
    savingsAmount: string;
    estimatedHours: string;
    cutList: {
      part: string;
      dimensions: string;
      quantity: number;
      material: string;
    }[];
    phases: {
      number: number;
      name: string;
      duration: string;
      instruction: string;
    }[];
    recommendedTools: string[];
  };
}

export interface UserProject {
  id: string;
  projectId?: string;
  title: string;
  category: CategoryId;
  coverImage: string;
  progress: number;
  status: 'in_progress' | 'saved' | 'completed';
  lastUpdated: string;
  notes: string;
  completedSteps: number[];
  totalSteps: number;
  difficulty: DifficultyLevel;
  timeEstimate: string;
  costEstimate: string;
  isAiGenerated?: boolean;
}

export interface EditorialArticle {
  id: string;
  title: {
    it: string;
    en: string;
  };
  category: {
    it: string;
    en: string;
  };
  readTime: string;
  image: string;
  summary: {
    it: string;
    en: string;
  };
}

// ==========================================
// CASA&CO. VISION STUDIO TYPES
// ==========================================

export type VisionStudioMode = 'dashboard' | 'vision-ai' | 'scan-3d' | 'assistant-ai';

export interface VisionStylePreset {
  id: string;
  name: {
    it: string;
    en: string;
  };
  description: {
    it: string;
    en: string;
  };
  thumbnail: string;
  palette: string[];
  keyMaterials: string[];
}

export interface VisionProposal {
  id: string;
  title: string;
  styleId: string;
  image: string;
  description: string;
  estimatedCost: string;
  highlights: string[];
  materialsList: string[];
}

export interface RoomOpening {
  id: string;
  type: 'door' | 'window';
  wallIndex: number; // 0: Nord, 1: Est, 2: Sud, 3: Ovest
  width: number; // cm
  height: number; // cm
  offset: number; // cm from corner
}

export interface RoomWall {
  id: string;
  orientation: 'Nord' | 'Est' | 'Sud' | 'Ovest';
  length: number; // cm
  height: number; // cm
  finish: string;
  hasAccentFeature?: boolean;
}

export interface RoomScanData {
  width: number; // cm
  length: number; // cm
  height: number; // cm
  squareMeters: number;
  volumeCubicMeters: number;
  walls: RoomWall[];
  openings: RoomOpening[];
  scanStatus: 'demo_mode' | 'calibrated' | 'scanning';
  isLiDARAvailable: boolean;
  arFramework: 'ARKit' | 'ARCore' | 'WebXR Demo';
  lastScanTimestamp: string;
  calibrationConfidence: number; // percentage
}

export interface SafetyWarning {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  requiredPPE: string[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  phase: string;
  completed: boolean;
  safetyNote?: string;
}

export interface PhotoDiaryEntry {
  id: string;
  title: string;
  timestamp: string;
  photoUrl: string;
  notes: string;
  phase: string;
}

export interface AssistantChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachedImageUrl?: string;
  illustratedStep?: {
    stepNumber: number;
    title: string;
    diagramUrl?: string;
    instructions: string[];
  };
  safetyAlert?: SafetyWarning;
}

export interface VisionStudioProject {
  id: string;
  name: string;
  roomType: string;
  status: 'concept' | 'scanned' | 'in_progress' | 'completed';
  progress: number;
  mainImage: string;
  beforeImage: string;
  activeProposalId: string;
  proposals: VisionProposal[];
  customizations: {
    accentWall: boolean;
    woodSlats: boolean;
    ledChannel: boolean;
    microcementFloor: boolean;
    suspendedFixtures: boolean;
  };
  scanData: RoomScanData;
  budget: {
    target: number;
    spent: number;
    estimatedTotal: number;
    currency: string;
  };
  materials: {
    id: string;
    name: string;
    quantity: string;
    status: 'to_order' | 'ordered' | 'received';
    cost: number;
  }[];
  checklist: ChecklistItem[];
  photoDiary: PhotoDiaryEntry[];
  chatHistory: AssistantChatMessage[];
  createdAt: string;
  lastModified: string;
}

