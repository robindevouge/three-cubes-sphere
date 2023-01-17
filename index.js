import gsap from 'gsap';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Debug

const gui = new GUI();

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const centerVect = new THREE.Vector3(0, 0, 0);
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 10;
camera.position.y = 5;
camera.position.z = 10;
camera.lookAt(centerVect);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Objects
 */
const cubeMaterial = new THREE.MeshNormalMaterial();
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

/**
 * Cube generator
 */

const sphere = {
	mesh: new THREE.Group(),
	radius: 1.5,
	lines: [
		{
			nbCubes: 7,
			elevation: 0.9,
			scale: 1,
			cubes: [],
		},
		{
			nbCubes: 14,
			elevation: 0.5,
			scale: 1,
			cubes: [],
		},
		{
			nbCubes: 14,
			elevation: 0,
			scale: 1,
			cubes: [],
		},
		{
			nbCubes: 14,
			elevation: -0.5,
			scale: 1,
			cubes: [],
		},
		{
			nbCubes: 7,
			elevation: -0.9,
			scale: 1,
			cubes: [],
		},
	],
	toggleRadius: () => {
		const radiusController = gui.children.filter((controller) => controller.property === 'radius')[0];
		if (sphere.radius === 10) {
			gsap.to(sphere, {
				radius: 1.5,
				onUpdate: () => {
					radiusController.updateDisplay();
				},
			});
		} else {
			gsap.to(sphere, {
				radius: 10,
				onUpdate: () => {
					radiusController.updateDisplay();
				},
			});
		}
	},
};

gui.add(sphere, 'radius').min(1).max(10).step(0.1);
gui.add(sphere, 'toggleRadius');

sphere.lines.forEach((line, i) => {
	const folder = gui.addFolder(`line-${i}`);
	folder.add(line, 'elevation').min(-1).max(1).step(0.01);
	folder.add(line, 'scale').min(0.1).max(5).step(0.01);
});

sphere.lines.forEach((line) => {
	for (let i = 0; i < line.nbCubes; i++) {
		const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

		line.cubes.push(cube);
		sphere.mesh.add(cube);
	}
});

scene.add(sphere.mesh);

const renderCubes = () => {
	sphere.lines.forEach((line) => {
		for (let i = 0; i < line.nbCubes; i++) {
			const cube = line.cubes[i];
			const phi = Math.acos(line.elevation); // polar angle in radians from the y (up) axis
			const theta = ((Math.PI * 2) / line.nbCubes) * i; // equator angle in radians around the y (up) axis

			cube.position.setFromSphericalCoords(sphere.radius, phi, theta);
			cube.scale.set(line.scale, line.scale, line.scale);

			cube.lookAt(sphere.mesh.position);
		}
	});
};

/**
 * Animate
 */
const speed = 0.1;

const tick = (time) => {
	try {
		// Update controls
		controls.update();

		// Update objects
		sphere.mesh.rotation.y = time * speed;

		// update cubes position
		renderCubes();

		// Render
		renderer.render(scene, camera);
	} catch (error) {
		console.error(error);
		gsap.ticker.remove(tick);
	}
};

gsap.ticker.fps(30);
gsap.ticker.add(tick);
