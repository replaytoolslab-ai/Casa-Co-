import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomScanData } from '../../types';
import { RotateCcw, Eye, Compass, Maximize2, Layers } from 'lucide-react';

interface Room3DCanvasProps {
  scanData: RoomScanData;
  activeWallIndex?: number;
  onSelectWall?: (index: number) => void;
}

export const Room3DCanvas: React.FC<Room3DCanvasProps> = ({
  scanData,
  activeWallIndex,
  onSelectWall,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const roomGroupRef = useRef<THREE.Group | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'top'>('3d');
  const [wireframeOnly, setWireframeOnly] = useState(false);

  // Mouse / Touch orbit interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.5, y: -0.6 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f1e9); // Warm ivory match
    sceneRef.current = scene;

    // 2. Setup Camera
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 320;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(6, 6, 8);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff6ea, 1.2);
    dirLight.position.set(8, 12, 6);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const softFillLight = new THREE.DirectionalLight(0xb79b76, 0.4);
    softFillLight.position.set(-6, 4, -6);
    scene.add(softFillLight);

    // 5. Build Room Mesh Group
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    roomGroupRef.current = roomGroup;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (roomGroupRef.current) {
        if (viewMode === '3d') {
          roomGroupRef.current.rotation.x = rotationRef.current.x;
          roomGroupRef.current.rotation.y = rotationRef.current.y;
        } else {
          roomGroupRef.current.rotation.x = Math.PI / 2;
          roomGroupRef.current.rotation.y = 0;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Interaction Handlers (Pointer rotate)
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || viewMode === 'top') return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      rotationRef.current.y += deltaX * 0.008;
      rotationRef.current.x = Math.max(0.1, Math.min(Math.PI / 2.2, rotationRef.current.x + deltaY * 0.008));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, [viewMode]);

  // Rebuild 3D Geometry whenever scanData or activeWallIndex changes
  useEffect(() => {
    const roomGroup = roomGroupRef.current;
    if (!roomGroup) return;

    // Clear previous children
    while (roomGroup.children.length > 0) {
      const obj = roomGroup.children[0];
      roomGroup.remove(obj);
    }

    // Convert cm to 3D world units (1 unit = 1 meter = 100 cm)
    const w = scanData.width / 100;
    const l = scanData.length / 100;
    const h = scanData.height / 100;
    const wallThick = 0.15;

    // Materials
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xeadfcf,
      roughness: 0.5,
      metalness: 0.1,
      wireframe: wireframeOnly,
    });

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf8f5,
      roughness: 0.8,
      metalness: 0.05,
      side: THREE.DoubleSide,
      wireframe: wireframeOnly,
    });

    const accentWallMaterial = new THREE.MeshStandardMaterial({
      color: 0xb79b76,
      roughness: 0.6,
      wireframe: wireframeOnly,
    });

    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x26343b,
      roughness: 0.4,
      wireframe: wireframeOnly,
    });

    // 1. Floor Mesh
    const floorGeo = new THREE.BoxGeometry(w, 0.05, l);
    const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
    floorMesh.position.y = -0.025;
    floorMesh.receiveShadow = true;
    roomGroup.add(floorMesh);

    // Floor Grid Helper on floor
    const gridHelper = new THREE.GridHelper(Math.max(w, l) * 1.3, 10, 0xb79b76, 0xd9c9b4);
    gridHelper.position.y = 0.001;
    roomGroup.add(gridHelper);

    // 2. Build 4 Walls
    // Wall 0: North (-Z)
    const northGeo = new THREE.BoxGeometry(w, h, wallThick);
    const northMat = activeWallIndex === 0 ? highlightMaterial : accentWallMaterial;
    const northMesh = new THREE.Mesh(northGeo, northMat);
    northMesh.position.set(0, h / 2, -l / 2 - wallThick / 2);
    northMesh.castShadow = true;
    roomGroup.add(northMesh);

    // Wall 1: East (+X)
    const eastGeo = new THREE.BoxGeometry(wallThick, h, l);
    const eastMat = activeWallIndex === 1 ? highlightMaterial : wallMaterial;
    const eastMesh = new THREE.Mesh(eastGeo, eastMat);
    eastMesh.position.set(w / 2 + wallThick / 2, h / 2, 0);
    eastMesh.castShadow = true;
    roomGroup.add(eastMesh);

    // Wall 2: South (+Z) - lower cut for easy camera viewing
    const southGeo = new THREE.BoxGeometry(w, h * 0.4, wallThick);
    const southMat = activeWallIndex === 2 ? highlightMaterial : wallMaterial;
    const southMesh = new THREE.Mesh(southGeo, southMat);
    southMesh.position.set(0, (h * 0.4) / 2, l / 2 + wallThick / 2);
    southMesh.castShadow = true;
    roomGroup.add(southMesh);

    // Wall 3: West (-X) - with window cutout visual
    const westGeo = new THREE.BoxGeometry(wallThick, h, l);
    const westMat = activeWallIndex === 3 ? highlightMaterial : wallMaterial;
    const westMesh = new THREE.Mesh(westGeo, westMat);
    westMesh.position.set(-w / 2 - wallThick / 2, h / 2, 0);
    westMesh.castShadow = true;
    roomGroup.add(westMesh);

    // 3. Render Door / Window openings representation
    scanData.openings.forEach((op) => {
      const opGeo = new THREE.BoxGeometry(op.width / 100, op.height / 100, 0.2);
      const opMat = new THREE.MeshStandardMaterial({
        color: op.type === 'door' ? 0x8f7451 : 0x769ab7,
        roughness: 0.3,
        transparent: true,
        opacity: 0.7,
      });
      const opMesh = new THREE.Mesh(opGeo, opMat);

      if (op.wallIndex === 2) {
        // South
        opMesh.position.set(
          -w / 2 + op.offset / 100 + (op.width / 100) / 2,
          (op.height / 100) / 2,
          l / 2 + wallThick / 2
        );
      } else if (op.wallIndex === 3) {
        // West
        opMesh.rotation.y = Math.PI / 2;
        opMesh.position.set(
          -w / 2 - wallThick / 2,
          (op.height / 100) / 2,
          -l / 2 + op.offset / 100 + (op.width / 100) / 2
        );
      }
      roomGroup.add(opMesh);
    });

    // 4. Dimension lines indicator
    const lineMat = new THREE.LineBasicMaterial({ color: 0x26343b, linewidth: 2 });
    
    // Width dimension line (Front)
    const pointsW = [
      new THREE.Vector3(-w / 2, 0.05, l / 2 + 0.3),
      new THREE.Vector3(w / 2, 0.05, l / 2 + 0.3),
    ];
    const geomW = new THREE.BufferGeometry().setFromPoints(pointsW);
    roomGroup.add(new THREE.Line(geomW, lineMat));

    // Length dimension line (Right)
    const pointsL = [
      new THREE.Vector3(w / 2 + 0.3, 0.05, -l / 2),
      new THREE.Vector3(w / 2 + 0.3, 0.05, l / 2),
    ];
    const geomL = new THREE.BufferGeometry().setFromPoints(pointsL);
    roomGroup.add(new THREE.Line(geomL, lineMat));

  }, [scanData, activeWallIndex, wireframeOnly]);

  const resetCamera = () => {
    rotationRef.current = { x: 0.5, y: -0.6 };
    setViewMode('3d');
  };

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#E5DFD5] bg-[#F5F1E9] select-none">
      
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Floating 3D HUD Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-xl border border-[#E5DFD5] shadow-xs">
        <button
          onClick={() => setViewMode(viewMode === '3d' ? 'top' : '3d')}
          title={viewMode === '3d' ? 'Passa a Pianta 2D' : 'Passa a Vista 3D'}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
            viewMode === 'top' ? 'bg-[#26343B] text-white' : 'text-[#26343B]/80 hover:bg-[#FAF8F5]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{viewMode === '3d' ? 'Vista 3D' : 'Pianta 2D'}</span>
        </button>

        <button
          onClick={() => setWireframeOnly(!wireframeOnly)}
          title="Mostra wireframe mesh"
          className={`p-1.5 rounded-lg transition-colors ${
            wireframeOnly ? 'bg-[#B79B76] text-white' : 'text-[#26343B]/70 hover:bg-[#FAF8F5]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={resetCamera}
          title="Centra vista"
          className="p-1.5 text-[#26343B]/70 hover:text-[#26343B] hover:bg-[#FAF8F5] rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dimension Readout Badge on Canvas */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-[calc(100%-1.5rem)] bg-[#26343B]/95 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs font-mono flex items-start gap-2 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#B79B76] animate-pulse" />
        <span className="min-w-0 flex-1 whitespace-normal break-words leading-snug tabular-nums">
          {(scanData.width / 100).toFixed(2)}m × {(scanData.length / 100).toFixed(2)}m · H {(scanData.height / 100).toFixed(2)}m · {Number(scanData.squareMeters).toFixed(2)} m²
        </span>
      </div>

      {/* Interaction tip overlay */}
      <div className="absolute top-3 left-3 text-[10px] text-[#26343B]/65 font-medium hidden lg:block">
        Trascina per ruotare 360° · Zoom fluido
      </div>

    </div>
  );
};
