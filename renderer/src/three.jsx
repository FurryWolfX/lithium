import * as THREE from "three";
import React, { useCallback, useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "react-three-fiber";
import { OrbitControls } from "./OrbitControls";
import { Matrix4 } from "three";

function Item(props) {
  // This reference will give us direct access to the mesh
  const mesh = useRef();

  const item = props.item;

  const transform = item.transform;

  const matrix = new Matrix4();
  matrix.set(
    transform[0],
    transform[3],
    transform[6],
    transform[9],
    transform[1],
    transform[4],
    transform[7],
    transform[10],
    transform[2],
    transform[5],
    transform[8],
    transform[11],
    0,
    0,
    0,
    1
  );

  const select = (event) => {
    item.selected = !item.selected;
    props.itemChanged();
  };

  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(item.mesh.vertexArray, 3)
  );

  if (item.mesh.triangleArray.length > 0) {
    geometry.setIndex(
      new THREE.Uint32BufferAttribute(item.mesh.triangleArray, 1)
    );
  }

  return (
    <mesh
      {...props}
      matrix={matrix}
      ref={mesh}
      geometry={geometry}
      receiveShadow
      onClick={select}
    >
      <meshPhongMaterial
        attach="material"
        flatShading={true}
        color={item.selected ? 0x786fb3 : 0xc0c0c0}
      />
      {item.subItems.map((subItem) => (
        <Item key={subItem.uuid} item={subItem} />
      ))}
    </mesh>
  );
}

const CameraController = () => {
  const { camera, gl } = useThree();
  useEffect(() => {
    const orbitControls = new OrbitControls(camera, gl.domElement);

    orbitControls.minZoom = 1;
    orbitControls.maxZoom = 200;
    orbitControls.zoomSpeed = 2.0;
    orbitControls.target.set(0, 0, 0);
    return () => {
      orbitControls.dispose();
    };
  }, [camera, gl]);
  return null;
};

export default function ThreeScene(props) {
  const mouse = useRef([0, 0]);
  const onMouseMove = useCallback(
    ({ clientX: x, clientY: y }) =>
      (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]),
    []
  );

  const itemChanged = ()=>{
    props.onItemsChanged();
  }

  return (
    <div style={{ width: "100%", height: "100%" }} onMouseMove={onMouseMove}>
      <Canvas
        gl={{ alpha: false, antialias: true, logarithmicDepthBuffer: true }}
        orthographic
        camera={{
          position: [1000, -1000, 1500],
          far: 3000,
          zoom: 2,
          up: [0, 0, 1],
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("grey");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputEncoding = THREE.sRGBEncoding;
        }}
      >
        <CameraController />
        <ambientLight intensity={0.2} />
        <pointLight castShadow position={[1000, 1000, 1000]} intensity={0.3} />
        <pointLight castShadow position={[-1000, 1000, 1000]} intensity={0.3} />
        <pointLight castShadow position={[1000, -1000, 1000]} intensity={0.3} />
        <pointLight
          castShadow
          position={[-1000, -1000, 1000]}
          intensity={0.3}
        />

        {props.items.map((item) => (
          <Item key={item.uuid} item={item} itemChanged={itemChanged} />
        ))}
      </Canvas>
    </div>
  );
}
