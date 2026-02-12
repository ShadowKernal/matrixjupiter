"use client";

import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  Color,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  ShaderMaterial,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";

type HeroPlanetSceneProps = {
  progressRef: MutableRefObject<number>;
  isActive: boolean;
  prefersReducedMotion: boolean;
  dprRange: [number, number];
  onReady: () => void;
};

type PlanetDetail = "high" | "balanced" | "low";
const PLANET_RADIUS = 1.16;

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

const atmosphereVertexShader = `
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const atmosphereFragmentShader = `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 normalDir = normalize(vWorldNormal);
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float fresnel = pow(1.0 - max(dot(normalDir, viewDir), 0.0), 3.4);
  float wave = 0.93 + 0.07 * sin(vWorldNormal.y * 20.0 + uTime * 0.28);
  float glow = fresnel * wave * uIntensity;
  gl_FragColor = vec4(uColor, glow);
}
`;

const terminatorVertexShader = `
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const terminatorFragmentShader = `
uniform vec3 uLightDir;
uniform float uStrength;
uniform float uSoftness;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 normalDir = normalize(vWorldNormal);
  vec3 lightDir = normalize(uLightDir);
  float lit = dot(normalDir, lightDir);
  float dayMask = smoothstep(-uSoftness, uSoftness * 1.8, lit);
  float night = 1.0 - dayMask;

  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  float rimLift = pow(1.0 - max(dot(normalDir, viewDir), 0.0), 1.4) * 0.14;
  float alpha = max((night - rimLift) * uStrength, 0.0);
  gl_FragColor = vec4(vec3(0.0), alpha);
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

function ProceduralPlanet({
  progressRef,
  prefersReducedMotion,
  detail,
  onReady,
}: {
  progressRef: MutableRefObject<number>;
  prefersReducedMotion: boolean;
  detail: PlanetDetail;
  onReady: () => void;
}) {
  const coreRef = useRef<Mesh>(null);
  const cloudRef = useRef<Mesh>(null);
  const terminatorRef = useRef<Mesh>(null);
  const rimRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);
  const coreMaterialRef = useRef<MeshPhysicalMaterial>(null);
  const cloudMaterialRef = useRef<MeshPhysicalMaterial>(null);
  const terminatorMaterialRef = useRef<ShaderMaterial>(null);
  const rimMaterialRef = useRef<ShaderMaterial>(null);
  const atmosphereMaterialRef = useRef<ShaderMaterial>(null);
  const spinRef = useRef(0);
  const cloudSpinRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const dragVelocityRef = useRef(0);
  const [textureReady, setTextureReady] = useState(false);
  const didNotifyReadyRef = useRef(false);

  const jupiterMap = useMemo(() => {
    const texture = new TextureLoader().load(
      "/jupiter.jpg",
      (loaded) => {
        loaded.anisotropy = 8;
        loaded.needsUpdate = true;
        setTextureReady(true);
      },
      undefined,
      () => {
        setTextureReady(true);
      }
    );
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
  const atmosphereUniforms = useMemo(
    () => ({
      uColor: { value: new Color("#d5b48d") },
      uIntensity: { value: 0.065 },
      uTime: { value: 0 },
    }),
    []
  );
  const terminatorUniforms = useMemo(
    () => ({
      uLightDir: { value: new Vector3(0.73, 0.43, 0.53).normalize() },
      uStrength: { value: 0.62 },
      uSoftness: { value: 0.24 },
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

  useFrame((state, delta) => {
    const core = coreRef.current;
    const cloud = cloudRef.current;
    const terminator = terminatorRef.current;
    const rim = rimRef.current;
    const atmosphere = atmosphereRef.current;
    const coreMaterial = coreMaterialRef.current;
    const cloudMaterial = cloudMaterialRef.current;
    const terminatorMaterial = terminatorMaterialRef.current;
    const rimMaterial = rimMaterialRef.current;
    const atmosphereMaterial = atmosphereMaterialRef.current;
    if (
      !core ||
      !cloud ||
      !terminator ||
      !rim ||
      !atmosphere ||
      !coreMaterial ||
      !cloudMaterial ||
      !terminatorMaterial ||
      !rimMaterial ||
      !atmosphereMaterial
    ) {
      return;
    }
    if (!textureReady) return;

    const progress = progressRef.current;
    const fade = 1 - MathUtils.clamp((progress - 0.68) / 0.32, 0, 1);
    const pointerX = state.pointer.x;
    const pointerY = state.pointer.y;
    const parallaxX = pointerX * (prefersReducedMotion ? 0.02 : 0.056);
    const parallaxY = pointerY * (prefersReducedMotion ? 0.012 : 0.03);
    const tiltLift = pointerY * (prefersReducedMotion ? 0.014 : 0.045);
    spinRef.current += delta * (prefersReducedMotion ? 0.09 : 0.25);
    cloudSpinRef.current += delta * (prefersReducedMotion ? 0.035 : 0.08);

    if (!isDraggingRef.current) {
      dragOffsetRef.current += dragVelocityRef.current;
      dragVelocityRef.current *= prefersReducedMotion ? 0.86 : 0.92;
    }

    const scrollRotation = progress * 3.1;
    const targetRotationY = spinRef.current + scrollRotation + dragOffsetRef.current;
    const rotationLerp = prefersReducedMotion ? 0.055 : 0.09;
    const transformLerp = prefersReducedMotion ? 0.05 : 0.08;
    core.rotation.y = MathUtils.lerp(core.rotation.y, targetRotationY, rotationLerp);
    core.rotation.x = MathUtils.lerp(core.rotation.x, -0.34 + progress * 0.28 + tiltLift, transformLerp);
    core.position.y = MathUtils.lerp(core.position.y, -0.02 - progress * 0.24 + parallaxY, transformLerp);
    core.position.x = MathUtils.lerp(core.position.x, 0.01 - progress * 0.12 + parallaxX, transformLerp);

    cloud.rotation.y = core.rotation.y * 1.18 + 0.1 + cloudSpinRef.current;
    cloud.rotation.x = core.rotation.x * 0.86;
    cloud.position.copy(core.position);
    terminator.rotation.copy(core.rotation);
    terminator.position.copy(core.position);
    rim.rotation.copy(core.rotation);
    rim.position.copy(core.position);
    atmosphere.rotation.copy(core.rotation);
    atmosphere.position.copy(core.position);

    cloudMaterial.opacity = 0.19 * fade;
    coreMaterial.emissiveIntensity = 0.01 + fade * 0.015;
    coreMaterial.clearcoat = 0.26 + Math.sin(spinRef.current * 0.5) * 0.02;
    terminatorMaterial.uniforms.uStrength.value = (prefersReducedMotion ? 0.5 : 0.62) * fade;
    rimMaterial.uniforms.uIntensity.value = 0.044 * fade;
    rimMaterial.uniforms.uTime.value += delta;
    atmosphereMaterial.uniforms.uIntensity.value = (prefersReducedMotion ? 0.04 : 0.056) * fade;
    atmosphereMaterial.uniforms.uTime.value += delta;

    // Expose the canvas only after at least one real rendered frame with ready textures.
    if (!didNotifyReadyRef.current) {
      didNotifyReadyRef.current = true;
      window.requestAnimationFrame(() => onReady());
    }
  });

  const coreSegments = detail === "high" ? 128 : detail === "balanced" ? 104 : 84;
  const cloudSegments = detail === "high" ? 96 : detail === "balanced" ? 76 : 60;
  const rimSegments = detail === "high" ? 72 : detail === "balanced" ? 56 : 44;

  return (
    <group visible={textureReady}>
      <mesh
        ref={coreRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerUp}
      >
        <sphereGeometry args={[PLANET_RADIUS, coreSegments, coreSegments]} />
        <meshPhysicalMaterial
          ref={coreMaterialRef}
          color="#ffffff"
          metalness={0}
          roughness={0.78}
          clearcoat={0.26}
          clearcoatRoughness={0.42}
          reflectivity={0.44}
          sheen={0.12}
          sheenColor="#ffd9b0"
          sheenRoughness={0.58}
          emissive="#1f130b"
          emissiveIntensity={0.01}
          map={jupiterMap}
          bumpMap={reliefMap ?? jupiterMap}
          bumpScale={0.072}
        />
      </mesh>

      <mesh ref={cloudRef} scale={1.012}>
        <sphereGeometry args={[PLANET_RADIUS, cloudSegments, cloudSegments]} />
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

      <mesh ref={terminatorRef} scale={1.004}>
        <sphereGeometry args={[PLANET_RADIUS, rimSegments, rimSegments]} />
        <shaderMaterial
          ref={terminatorMaterialRef}
          uniforms={terminatorUniforms}
          vertexShader={terminatorVertexShader}
          fragmentShader={terminatorFragmentShader}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh ref={atmosphereRef} scale={1.028}>
        <sphereGeometry args={[PLANET_RADIUS, rimSegments, rimSegments]} />
        <shaderMaterial
          ref={atmosphereMaterialRef}
          uniforms={atmosphereUniforms}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          side={BackSide}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={rimRef} scale={1.006}>
        <sphereGeometry args={[PLANET_RADIUS, rimSegments, rimSegments]} />
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
  return (
    <>
      <ambientLight intensity={0.17} color="#ffeedd" />
      <hemisphereLight intensity={0.14} color="#ffe2bf" groundColor="#21120a" />
      <directionalLight position={[2.9, 1.7, 2.1]} intensity={1.72} color="#ffe2bf" />
      <pointLight position={[1.4, 0.95, 2.25]} intensity={0.26} color="#fff8eb" />
      <directionalLight position={[-2.1, 0.42, -1.8]} intensity={0.21} color="#a16f4f" />
    </>
  );
}

export default function HeroPlanetScene({
  progressRef,
  isActive,
  prefersReducedMotion,
  dprRange,
  onReady,
}: HeroPlanetSceneProps) {
  const detail: PlanetDetail =
    dprRange[1] > 1.55 ? "high" : dprRange[1] > 1.28 ? "balanced" : "low";

  return (
    <Canvas
      dpr={dprRange}
      camera={{ position: [0, 0, 4.1], fov: 38 }}
      style={{ background: "transparent", display: "block" }}
      gl={(defaults) =>
        new WebGLRenderer({
          canvas: defaults.canvas as HTMLCanvasElement,
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        })
      }
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.14;
        gl.setClearColor(0x000000, 0);
      }}
      frameloop={isActive ? "always" : "demand"}
    >
      <PlanetLights />
      <ProceduralPlanet
        progressRef={progressRef}
        prefersReducedMotion={prefersReducedMotion}
        detail={detail}
        onReady={onReady}
      />
    </Canvas>
  );
}
