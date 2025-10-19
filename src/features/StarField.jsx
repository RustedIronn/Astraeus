import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree, useLoader } from "@react-three/fiber";

const colorCache = new Map();
function spectralToColor(spectral) {
  const type = spectral?.trim()?.[0]?.toUpperCase() ?? "G";
  if (!colorCache.has(type)) {
    const map = {
      O: "#6faaff",
      B: "#8fc1ff",
      A: "#c8e4ff",
      F: "#fff4d6",
      G: "#ffd7a0",
      K: "#ff9a5e",
      M: "#ff6a5c",
      L: "#e85a7b",
      T: "#b372ff",
      Y: "#7a3fcf",
    };
    colorCache.set(type, new THREE.Color(map[type] || "#ffffff"));
  }
  return colorCache.get(type).clone();
}

function StarField({ stars, pointsRef, selectedStar, onStarClick }) {
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());

  const texturePaths = {
    O: "/textures/star_textures/star_O.jpg",
    B: "/textures/star_textures/star_B.jpg",
    A: "/textures/star_textures/star_A.jpg",
    F: "/textures/star_textures/star_F.jpg",
    G: "/textures/star_textures/star_G.jpg",
    K: "/textures/star_textures/star_K.jpg",
    M: "/textures/star_textures/star_M.jpg",
    L: "/textures/star_textures/star_L.jpg",
    T: "/textures/star_textures/star_T.jpg",
    Y: "/textures/star_textures/star_Y.jpg",
  };

  const loadedTextures = useLoader(THREE.TextureLoader, Object.values(texturePaths));
  const textureKeys = Object.keys(texturePaths);
  const textures = useMemo(
    () => Object.fromEntries(textureKeys.map((key, i) => [key, loadedTextures[i]])),
    [loadedTextures]
  );

  const getStarTexture = (spectral) => {
    const type = spectral?.trim()?.[0]?.toUpperCase();
    return textures[type] || textures.G;
  };

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(stars.length * 3);
    const col = new Float32Array(stars.length * 3);
    const siz = new Float32Array(stars.length);

    stars.forEach((s, i) => {
      pos[i * 3] = s.x;
      pos[i * 3 + 1] = s.y;
      pos[i * 3 + 2] = s.z;

      const brightness = THREE.MathUtils.clamp(2.0 - s.mag * 0.25, 0.4, 2.8);
      const c = spectralToColor(s.spect).multiplyScalar(brightness);

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      siz[i] = THREE.MathUtils.clamp(14 - s.mag * 1.2, 3, 12);
    });

    return { positions: pos, colors: col, sizes: siz };
  }, [stars]);

  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    uniform float uTime;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      float twinkle = 0.85 + 0.35 * sin(uTime * 3.0 + position.x * 0.27 + position.y * 0.41 + position.z * 0.33);
      gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float core = smoothstep(0.35, 0.0, d);
      float glow = smoothstep(0.5, 0.2, d);
      vec3 color = vColor * (core * 1.4 + glow * 0.6);
      gl_FragColor = vec4(color, 1.0 - d * 0.4);
    }
  `;

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geom;
  }, [positions, colors, sizes]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
      }),
    []
  );

  const pulseRef = useRef(null);
  const rippleRef = useRef(null);
  const selectedGroupRef = useRef();

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    const t = state.clock.elapsedTime;

    if (pulseRef.current) {
      const s = 1.1 + Math.sin(t * 2.0) * 0.08;
      pulseRef.current.scale.set(s, s, s);
    }

    if (rippleRef.current) {
      const rippleScale = 1.5 + Math.sin(t * 1.3) * 0.25;
      rippleRef.current.scale.set(rippleScale, rippleScale, rippleScale);
      rippleRef.current.material.opacity = 0.25 + Math.sin(t * 1.3) * 0.15;
    }

    if (selectedGroupRef.current) {
      const ring = selectedGroupRef.current.children[3];
      const shimmer = selectedGroupRef.current.getObjectByName("shimmer");
      if (ring) ring.rotation.z = t * 0.3;
      if (shimmer) shimmer.rotation.y = t * 0.2;
    }
  });

  useEffect(() => {
    if (!pointsRef.current) return;
    pointsRef.current.raycast = THREE.Points.prototype.raycast;

    const handleClick = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.params.Points.threshold = 3;
      raycasterRef.current.setFromCamera({ x, y }, camera);
      const intersects = raycasterRef.current.intersectObject(pointsRef.current);

      if (intersects.length > 0) {
        const index = intersects[0].index;
        if (index !== undefined && stars[index]) onStarClick?.(stars[index]);
      }
    };

    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [stars, camera, gl, pointsRef, onStarClick]);

  useEffect(() => {
    const g = selectedGroupRef.current;
    if (!g) return;
    if (!selectedStar) {
      g.visible = false;
      return;
    }

    const color = spectralToColor(selectedStar.spect);
    g.position.set(selectedStar.x, selectedStar.y, selectedStar.z);
    g.visible = true;

    const coreMat = g.children[0].material;
    coreMat.color = color.clone().multiplyScalar(1.5);
    coreMat.emissive = color;
    coreMat.emissiveIntensity = 1.2;

    g.children[1].material.color = color.clone().multiplyScalar(1.05);
    g.children[2].material.color = color.clone().multiplyScalar(0.8);
    g.children[3].material.color = color.clone().multiplyScalar(1.3);
  }, [selectedStar]);

  return (
    <>
      <points ref={pointsRef} geometry={geometry} material={material} />
      <ambientLight intensity={0.4} color="#b2d8ff" />
      <pointLight position={[0, 0, 0]} intensity={1} color="#ffffff" />

      {/* 🌟 Refined Highlight — Cinematic Pop */}
      <group ref={selectedGroupRef} visible={false}>
        {/* Subtle core */}
        <mesh>
          <sphereGeometry args={[2.2, 64, 64]} />
          <meshStandardMaterial
            emissiveIntensity={1.2}
            metalness={0.3}
            roughness={0.25}
            toneMapped={false}
          />
        </mesh>

        {/* Soft inner glow */}
        <mesh ref={pulseRef}>
          <sphereGeometry args={[3.5, 64, 64]} />
          <meshBasicMaterial
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Gradient halo */}
        <mesh ref={rippleRef}>
          <sphereGeometry args={[5.5, 64, 64]} />
          <meshBasicMaterial
            transparent
            opacity={0.2}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Orbiting lines */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[6, 7, 120]} />
          <meshBasicMaterial
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Parallax shimmer */}
        <group name="shimmer">
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 16) * Math.PI * 2) * (7.5 + (i % 2) * 0.5),
                Math.sin((i / 16) * Math.PI * 2) * (7.5 + ((i + 1) % 3) * 0.3),
                Math.sin((i / 16) * Math.PI * 2) * 0.6,
              ]}
            >
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}

export default React.memo(StarField);
