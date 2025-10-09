import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree, useLoader } from "@react-three/fiber";

// 🌈 Cached spectral color function
const colorCache = new Map();
function spectralToColor(spectral) {
  const type = spectral?.trim()?.[0]?.toUpperCase() ?? "G";
  if (!colorCache.has(type)) {
    const map = {
      O: "#6f9eff", B: "#8cb4ff", A: "#b5e0ff", F: "#f8f7ff",
      G: "#ffe6c7", K: "#ffb06b", M: "#ff6f61", L: "#d64b4b",
      T: "#a855f7", Y: "#6b21a8"
    };
    colorCache.set(type, new THREE.Color(map[type] || "#ffffff"));
  }
  return colorCache.get(type).clone();
}

function StarField({ stars, pointsRef, selectedStar, onStarClick }) {
  const { camera, gl } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());

  // 🌌 Load star textures once
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

  const loadedTextures = useMemo(() => {
    const textures = {};
    Object.entries(texturePaths).forEach(([spec, path]) => {
      textures[spec] = useLoader(THREE.TextureLoader, path);
    });
    return textures;
  }, []);

  const getStarTexture = (spectral) => {
    const type = spectral?.trim()?.[0]?.toUpperCase();
    return loadedTextures[type] || loadedTextures.G;
  };

  // 🌠 Generate geometry attributes
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

      siz[i] = THREE.MathUtils.clamp(14 - s.mag * 1.5, 2, 12);
    });

    return { positions: pos, colors: col, sizes: siz };
  }, [stars]);

  // 🌟 Twinkle shaders
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
      float core = smoothstep(0.4, 0.0, d);
      float glow = smoothstep(0.5, 0.2, d);
      vec3 color = vColor * (core * 1.2 + glow * 0.8);
      gl_FragColor = vec4(color, 1.0 - d * 0.6);
    }
  `;

  // ⚙️ Stable geometry & material
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return geom;
  }, [positions, colors, sizes]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: { uTime: { value: 0 } },
  }), []);

  const pulseRef = useRef({ mesh: null });
  const selectedGroupRef = useRef();

  // 🌌 Animation loop
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    if (pulseRef.current.mesh) {
      const pulse = 1.15 + Math.sin(state.clock.elapsedTime * 2.0) * 0.25;
      pulseRef.current.mesh.scale.set(pulse, pulse, pulse);
    }
  });

  // ✨ Handle clicks
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

  // 🚀 Update selected star instantly (no lag)
  useEffect(() => {
    const g = selectedGroupRef.current;
    if (!selectedStar || !g) return;

    const color = spectralToColor(selectedStar.spect);
    const texture = getStarTexture(selectedStar.spect);

    g.position.set(selectedStar.x, selectedStar.y, selectedStar.z);
    g.visible = true;

    // update sphere
    const starMat = g.children[0].material;
    starMat.map = texture;
    starMat.emissive = color;
    starMat.emissiveIntensity = 0.5;
    starMat.roughness = 0.4;
    starMat.metalness = 0.3;
    starMat.clearcoat = 1;
    starMat.clearcoatRoughness = 0.2;

    // aura + ring
    g.children[1].material.color = color;
    g.children[2].material.color = color;
  }, [selectedStar]);

  return (
    <>
      {/* ✨ GPU Starfield */}
      <points ref={pointsRef} geometry={geometry} material={material} />

      {/* 🌠 Lighting */}
      <ambientLight intensity={0.4} color="#b2d8ff" />
      <pointLight position={[0, 0, 0]} intensity={1.3} color="#ffffff" />

      {/* 🌟 Persistent Selected Star */}
      <group ref={selectedGroupRef} visible={false}>
        <mesh>
          <sphereGeometry args={[3, 64, 64]} />
          <meshPhysicalMaterial />
        </mesh>
        <mesh ref={(el) => (pulseRef.current.mesh = el)}>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[7, 8, 64]} />
          <meshBasicMaterial side={THREE.DoubleSide} transparent opacity={0.75} />
        </mesh>
      </group>
    </>
  );
}

export default React.memo(StarField);
