"use client";

import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  CanvasTexture,
  Color,
  DirectionalLight,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  PointLight,
  RepeatWrapping,
  SRGBColorSpace,
  ShaderMaterial,
  TextureLoader,
} from "three";

type HeroPlanetSceneProps = {
  progressRef: MutableRefObject<number>;
};

type PointerCaptureTarget = EventTarget & {
  setPointerCapture: (pointerId: number) => void;
  releasePointerCapture: (pointerId: number) => void;
};

function isPointerCaptureTarget(target: EventTarget | null): target is PointerCaptureTarget {
  return (
    !!target &&
    typeof (target as PointerCaptureTarget).setPointerCapture === "function" &&
    typeof (target as PointerCaptureTarget).releasePointerCapture === "function"
  );
}

const rimVertexShader = `
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vNormal = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - worldPosition.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const rimFragmentShader = `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.25);
  float pulse = 0.95 + 0.05 * sin(uTime * 1.2);
  float glow = fresnel * uIntensity * pulse;
  gl_FragColor = vec4(uColor, glow);
}
`;

function createReliefTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = "#7f7f7f";
  ctx.fillRect(0, 0, w, h);

  let seed = 19;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 2300; i += 1) {
    const x = random() * w;
    const y = random() * h;
    const r = 2 + random() * 24;
    const tone = Math.floor(86 + random() * 96);
    const alpha = 0.025 + random() * 0.08;
    ctx.fillStyle = `rgba(${tone}, ${tone}, ${tone}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 72; i += 1) {
    const y = (i / 72) * h;
    const thickness = 2 + (i % 5);
    const alpha = 0.04 + (i % 3) * 0.018;
    const gradient = ctx.createLinearGradient(0, y, w, y + thickness);
    gradient.addColorStop(0, `rgba(170,170,170,${alpha})`);
    gradient.addColorStop(0.5, `rgba(115,115,115,${alpha * 0.55})`);
    gradient.addColorStop(1, `rgba(170,170,170,${alpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, w, thickness);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function createCloudAlphaTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, w, h);

  let seed = 47;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  for (let i = 0; i < 96; i += 1) {
    const y = (i / 96) * h;
    const thickness = 3 + random() * 14;
    const alpha = 0.08 + random() * 0.2;
    const gradient = ctx.createLinearGradient(0, y, w, y + thickness);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha * 0.7})`);
    gradient.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(1, `rgba(255,255,255,${alpha * 0.7})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, w, thickness);
  }

  for (let i = 0; i < 180; i += 1) {
    const x = random() * w;
    const y = random() * h;
    const rx = 12 + random() * 70;
    const ry = 4 + random() * 22;
    const alpha = 0.03 + random() * 0.1;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function ProceduralPlanet({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const coreRef = useRef<Mesh>(null);
  const cloudRef = useRef<Mesh>(null);
  const rimRef = useRef<Mesh>(null);
  const coreMaterialRef = useRef<MeshPhysicalMaterial>(null);
  const cloudMaterialRef = useRef<MeshPhysicalMaterial>(null);
  const rimMaterialRef = useRef<ShaderMaterial>(null);
  const spinRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const dragVelocityRef = useRef(0);

  const jupiterMap = useMemo(() => {
    const texture = new TextureLoader().load("/jupiter.jpg", (loaded) => {
      loaded.anisotropy = 8;
      loaded.needsUpdate = true;
    });
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }, []);

  const reliefMap = useMemo(() => createReliefTexture(), []);
  const cloudAlphaMap = useMemo(() => createCloudAlphaTexture(), []);
  const rimUniforms = useMemo(
    () => ({
      uColor: { value: new Color("#cfb28e") },
      uIntensity: { value: 0.05 },
      uTime: { value: 0 },
    }),
    []
  );

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    isDraggingRef.current = true;
    lastPointerXRef.current = event.clientX;
    dragVelocityRef.current = 0;
    const target = event.target;
    if (isPointerCaptureTarget(target)) {
      target.setPointerCapture(event.pointerId);
    }
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return;
    event.stopPropagation();
    const deltaX = event.clientX - lastPointerXRef.current;
    lastPointerXRef.current = event.clientX;
    const rotationDelta = deltaX * 0.0065;
    dragOffsetRef.current += rotationDelta;
    dragVelocityRef.current = rotationDelta;
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    if (!isDraggingRef.current) return;
    event.stopPropagation();
    isDraggingRef.current = false;
    const target = event.target;
    if (isPointerCaptureTarget(target)) {
      target.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(
    () => () => {
      jupiterMap.dispose();
      reliefMap?.dispose();
      cloudAlphaMap?.dispose();
    },
    [cloudAlphaMap, jupiterMap, reliefMap]
  );

  useFrame((_, delta) => {
    const core = coreRef.current;
    const cloud = cloudRef.current;
    const rim = rimRef.current;
    const coreMaterial = coreMaterialRef.current;
    const cloudMaterial = cloudMaterialRef.current;
    const rimMaterial = rimMaterialRef.current;
    if (!core || !cloud || !rim || !coreMaterial || !cloudMaterial || !rimMaterial) return;

    const progress = progressRef.current;
    const fade = 1 - MathUtils.clamp((progress - 0.68) / 0.32, 0, 1);
    spinRef.current += delta * 0.25;

    if (!isDraggingRef.current) {
      dragOffsetRef.current += dragVelocityRef.current;
      dragVelocityRef.current *= 0.92;
    }

    const scrollRotation = progress * 3.1;
    const targetRotationY = spinRef.current + scrollRotation + dragOffsetRef.current;
    core.rotation.y = MathUtils.lerp(core.rotation.y, targetRotationY, 0.09);
    core.rotation.x = MathUtils.lerp(core.rotation.x, -0.34 + progress * 0.28, 0.08);
    core.position.y = MathUtils.lerp(core.position.y, 0.08 - progress * 0.24, 0.08);
    core.position.x = MathUtils.lerp(core.position.x, 0.01 - progress * 0.12, 0.08);

    cloud.rotation.y = core.rotation.y * 1.22 + 0.1;
    cloud.rotation.x = core.rotation.x * 0.86;
    cloud.position.copy(core.position);
    rim.rotation.copy(core.rotation);
    rim.position.copy(core.position);

    cloudMaterial.opacity = 0.2 * fade;
    coreMaterial.emissiveIntensity = 0.09 + fade * 0.08;
    coreMaterial.clearcoat = 0.95 + Math.sin(spinRef.current * 0.5) * 0.05;
    rimMaterial.uniforms.uIntensity.value = 0.05 * fade;
    rimMaterial.uniforms.uTime.value += delta;
  });

  return (
    <group>
      <mesh
        ref={coreRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerUp}
      >
        <sphereGeometry args={[1, 128, 128]} />
        <meshPhysicalMaterial
          ref={coreMaterialRef}
          color="#ffffff"
          metalness={0.03}
          roughness={0.58}
          clearcoat={0.95}
          clearcoatRoughness={0.16}
          reflectivity={1}
          sheen={0.68}
          sheenColor="#ffd4a8"
          sheenRoughness={0.38}
          emissive="#2a170c"
          emissiveIntensity={0.09}
          map={jupiterMap}
          bumpMap={reliefMap ?? jupiterMap}
          bumpScale={0.046}
        />
      </mesh>

      <mesh ref={cloudRef} scale={1.018}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshPhysicalMaterial
          ref={cloudMaterialRef}
          color="#ffdcb3"
          transparent
          opacity={0.2}
          alphaMap={cloudAlphaMap ?? undefined}
          roughness={0.22}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.18}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={rimRef} scale={1.012}>
        <sphereGeometry args={[1, 72, 72]} />
        <shaderMaterial
          ref={rimMaterialRef}
          uniforms={rimUniforms}
          vertexShader={rimVertexShader}
          fragmentShader={rimFragmentShader}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function PlanetLights() {
  const keyRef = useRef<DirectionalLight>(null);
  const sparkleRef = useRef<PointLight>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta * 0.55;
    if (keyRef.current) {
      keyRef.current.position.x = 2.7 + Math.cos(timeRef.current) * 0.38;
      keyRef.current.position.y = 1.8 + Math.sin(timeRef.current * 0.8) * 0.24;
      keyRef.current.intensity = 1.28 + Math.sin(timeRef.current * 0.9) * 0.08;
    }
    if (sparkleRef.current) {
      sparkleRef.current.position.x = 1.2 + Math.sin(timeRef.current * 1.35) * 0.42;
      sparkleRef.current.position.y = 0.9 + Math.cos(timeRef.current * 1.15) * 0.34;
      sparkleRef.current.intensity = 0.8 + Math.sin(timeRef.current * 1.6) * 0.14;
    }
  });

  return (
    <>
      <ambientLight intensity={0.56} color="#fff3e3" />
      <hemisphereLight intensity={0.42} color="#ffe7cb" groundColor="#4a2d1c" />
      <directionalLight ref={keyRef} position={[2.8, 1.9, 2.6]} intensity={1.3} color="#ffe4c5" />
      <pointLight ref={sparkleRef} position={[1.2, 0.8, 2.2]} intensity={0.82} color="#fff7e9" />
      <directionalLight position={[-2.5, -1.2, -2]} intensity={0.44} color="#c58a5f" />
    </>
  );
}

export default function HeroPlanetScene({ progressRef }: HeroPlanetSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.1], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.22;
      }}
      frameloop="always"
    >
      <PlanetLights />
      <ProceduralPlanet progressRef={progressRef} />
    </Canvas>
  );
}
