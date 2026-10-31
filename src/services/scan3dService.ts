import { RoomScanData, RoomOpening, RoomWall } from '../types';

export interface ScanGuideStep {
  stepIndex: number;
  title: string;
  instruction: string;
  targetArea: string;
}

export const SCAN_GUIDE_STEPS: ScanGuideStep[] = [
  {
    stepIndex: 1,
    title: 'Rilevamento Pavimento & Piano Base',
    instruction: 'Punta la fotocamera verso il centro del pavimento muovendola lentamente a cerchio per agganciare il piano zero.',
    targetArea: 'Pavimento'
  },
  {
    stepIndex: 2,
    title: 'Scansione Spigoli e Perimetro Pareti',
    instruction: 'Muoviti in senso orario inquadrando l’intersezione tra pavimento e zoccolino di ciascuna parete.',
    targetArea: 'Perimetro 360°'
  },
  {
    stepIndex: 3,
    title: 'Rilevamento Porte, Finestre & Vani',
    instruction: 'Centra le aperture per 2 secondi: il sistema rileverà automaticamente stipiti, davanzali e altezza del soffitto.',
    targetArea: 'Aperture'
  },
  {
    stepIndex: 4,
    title: 'Generazione Rete Poligonale & Quote',
    instruction: 'Elaborazione modello vettoriale parametrico e calcolo della superficie calpestabile e dei volumi.',
    targetArea: 'Chiusura Rilievo'
  }
];

export class Scan3dService {
  checkArAvailability(): {
    isAvailable: boolean;
    framework: 'ARKit' | 'ARCore' | 'WebXR Demo';
    notice: string;
  } {
    // In web environment, hardware LiDAR/ToF is not accessible directly without native app bridge
    return {
      isAvailable: false,
      framework: 'ARKit',
      notice: 'DEMO RILIEVO GUIDATO — Sensore hardware LiDAR non attivo nel browser web. Predisposizione completa per ARKit (iOS) e ARCore (Android). Le misure visualizzate sono parametriche e modificabili manualmente senza simulare sensori non presenti.'
    };
  }

  getGuideSteps(): ScanGuideStep[] {
    return SCAN_GUIDE_STEPS;
  }

  calculateGeometry(widthCm: number, lengthCm: number, heightCm: number) {
    const areaSqM = Number(((widthCm * lengthCm) / 10000).toFixed(2));
    const perimeterM = Number((((widthCm + lengthCm) * 2) / 100).toFixed(2));
    const volumeCuM = Number(((widthCm * lengthCm * heightCm) / 1000000).toFixed(2));
    const wallAreaSqM = Number(((perimeterM * heightCm) / 100).toFixed(2));

    return {
      areaSqM,
      perimeterM,
      volumeCuM,
      wallAreaSqM
    };
  }
}

export const scan3dService = new Scan3dService();
