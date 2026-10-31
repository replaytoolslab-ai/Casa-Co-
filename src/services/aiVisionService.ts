import { VisionStylePreset, VisionProposal } from '../types';

export const VISION_STYLES: VisionStylePreset[] = [
  {
    id: 'japandi',
    name: {
      it: 'Japandi Warm & Ebanisteria',
      en: 'Japandi Warm & Craft Wood'
    },
    description: {
      it: 'Minimalismo caldo, rovere fiammato, parete cannettata in noce canaletto e microcemento setoso.',
      en: 'Warm minimalism, flame-grained oak, fluted walnut accent walls, and silky microcement.'
    },
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    palette: ['#26343B', '#B79B76', '#EAE4D8', '#F5F1E9'],
    keyMaterials: ['Rovere Massello', 'Noce Canaletto', 'Microcemento Neutro', 'Luce 2700K']
  },
  {
    id: 'minimal-mineral',
    name: {
      it: 'Minimalismo Minerale & Calce',
      en: 'Mineral Minimalism & Lime'
    },
    description: {
      it: 'Superfici scultoree traspiranti, intonaco di calce a frattazzo e inserti metallici sottili.',
      en: 'Sculptural breathable surfaces, hand-troweled lime plaster, and slim blackened iron.'
    },
    thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    palette: ['#1A242A', '#D9C9B4', '#F4F1EA', '#8F7451'],
    keyMaterials: ['Grassello di Calce', 'Ferro Brunito', 'Pietra Naturale', 'Gole a Scomparsa']
  },
  {
    id: 'mediterranean',
    name: {
      it: 'Moderno Mediterraneo',
      en: 'Modern Mediterranean'
    },
    description: {
      it: 'Luminosità organica, accenti in cotto naturale, legno chiaro di frassino e archi morbidi.',
      en: 'Organic brightness, natural terracotta accents, light ash lumber, and gentle arches.'
    },
    thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    palette: ['#C97A58', '#EBDCC9', '#2E3A42', '#FAF8F5'],
    keyMaterials: ['Cotto Fatto a Mano', 'Frassino Sbiancato', 'Intonaco Rustico', 'Ottone Brunito']
  },
  {
    id: 'industrial-soft',
    name: {
      it: 'Loft Architettonico & Ferro Caldo',
      en: 'Architectural Warm Loft'
    },
    description: {
      it: 'Acciaio cerato a mano, legno massello di recupero e ampie campiture vetrate luminose.',
      en: 'Hand-waxed raw steel, reclaimed architectural timber, and luminous expansive glazing.'
    },
    thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    palette: ['#1C262C', '#9E805B', '#D2C3B0', '#ECE6DC'],
    keyMaterials: ['Ferro Cerato a Cera d’Api', 'Castagno Antico', 'Microresina', 'Lame di Luce']
  }
];

export const DEMO_ROOM_IMAGES = [
  {
    id: 'room-1',
    label: 'Living grezzo in ristrutturazione',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    roomType: 'Soggiorno con Angolo Cottura'
  },
  {
    id: 'room-2',
    label: 'Cucina da rinnovare con pareti neutre',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    roomType: 'Cucina Open Space'
  },
  {
    id: 'room-3',
    label: 'Bagno pre-ristrutturazione',
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    roomType: 'Bagno Padronale'
  }
];

export class AiVisionService {
  getStyles(): VisionStylePreset[] {
    return VISION_STYLES;
  }

  generateProposalsForStyle(styleId: string, roomType: string): VisionProposal[] {
    const style = VISION_STYLES.find((s) => s.id === styleId) || VISION_STYLES[0];
    
    return [
      {
        id: `prop-${styleId}-1`,
        title: `Proposta 1 — ${style.name.it} (Equilibrato)`,
        styleId,
        image: style.thumbnail,
        description: `Progetto completo calibrato per ${roomType}. Enfasi su ${style.keyMaterials.slice(0, 2).join(' e ')} con illuminazione architettonica integrata.`,
        estimatedCost: '€3.900 - €5.200',
        highlights: ['Pareti materiche', 'Mobili su misura sospesi', 'Tagli di luce indiretta'],
        materialsList: style.keyMaterials
      },
      {
        id: `prop-${styleId}-2`,
        title: `Proposta 2 — ${style.name.it} (Enfasi Materica Legno)`,
        styleId,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
        description: `Variante con maggiore presenza di essenze lignee massicce a vista, bancone centrale e schermature a lamelle verticali.`,
        estimatedCost: '€4.400 - €5.900',
        highlights: ['Bancone in legno massello', 'Controsoffitto con gole LED', 'Pavimento continuo'],
        materialsList: ['Rovere Massello', 'Microcemento', 'Feltro Acustico']
      },
      {
        id: `prop-${styleId}-3`,
        title: `Proposta 3 — ${style.name.it} (Luminosità Massima)`,
        styleId,
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85',
        description: `Soluzione ad alto coefficiente di riflessione luminosa con tinteggiatura minerale a calce e finiture chiare seriche.`,
        estimatedCost: '€3.600 - €4.700',
        highlights: ['Tinte minerali chiare', 'Arredi a scomparsa filomuro', 'Riflessi diffusi'],
        materialsList: ['Grassello di Calce', 'Frassino Naturale', 'Top Graniglia']
      }
    ];
  }
}

export const aiVisionService = new AiVisionService();
