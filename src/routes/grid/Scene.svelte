<script context="module" lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls, Text, interactivity, useGltf } from '@threlte/extras';
	import { expoInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { writable } from 'svelte/store';
	import { Vector3 } from 'three';
	import { generateColorsInRange } from './utils';

	const size = 11;
	const spacing = 5;
	const DEBUG = false;

	for (let r = 0; r < size; r++) {
		for (let g = 0; g < size; g++) {
			for (let b = 0; b < size; b++) {
				const index = r * size * size + g * size + b;
				console.log('index:', index);
			}
		}
	}

	const palette = generateColorsInRange(size * size * size);

	// TODO make this more robust
	export const offset = writable(new Vector3(100000, 100000, 100000));
</script>

<script lang="ts">
	interactivity();

	const cube = useGltf('/models/rounded_cube.glb');

	const duration = 500;

	const matcapTransition = tweened(0, {
		duration,
		easing: expoInOut
	});

	let currentMatcapOffset = 0;
	$: matcapsArray = Array(size);
	$: normalsArray = Array(size);

	const { scene } = useThrelte();

	let transitioning = false;

	let matcapTransitionVector = new Vector3(0, 0, 0);

	const transitionMatcap = async (transition: Vector3) => {
		if (transitioning) return;
		matcapTransitionVector = transition.clone().multiplyScalar(spacing);

		// currentMatcapOffset = currentMatcapOffset + Math.abs(offset);

		transitioning = true;

		matcapTransition.set(0, { duration: 0 });
		matcapTransition.set(-1, { duration });

		setTimeout(() => {
			matcapTransition.set(0, { duration: 0 });
			$offset = $offset.add(transition);
			transitioning = false;
		}, duration);
	};

	const handleKeyUp = (e) => {
		switch (e.key) {
			case 'ArrowLeft':
				transitionMatcap(new Vector3(-1, 0, 0));
				break;
			case 'ArrowRight':
				transitionMatcap(new Vector3(1, 0, 0));
				break;
			default:
				break;
		}
	};

	$: console.log('$offset:', $offset);
</script>

<svelte:window on:keyup={handleKeyUp} />

<T.PerspectiveCamera
	makeDefault
	fov={75}
	position={!DEBUG ? [0, 0, 4] : [size * spacing, size * spacing, size * spacing]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

{#if !DEBUG}
	<T.Fog
		color={'red'}
		near={(size / 2 - spacing) * spacing}
		far={(size / 2) * spacing}
		on:create={({ ref }) => {
			scene.fog = ref;
		}}
	/>
{/if}

<T.DirectionalLight
	position={[0, 0, 4]}
	color={'white'}
	intensity={0.1}
	on:create={({ ref }) => {
		scene.add(ref);
	}}
/>

<T.Group
	position.x={((size - 1) * spacing) / 2 + $matcapTransition * matcapTransitionVector.x}
	position.y={((size - 1) * spacing) / 2 + $matcapTransition * matcapTransitionVector.y}
	position.z={((size - 1) * spacing) / 2 + $matcapTransition * matcapTransitionVector.z}
>
	{#if $cube}
		{#each matcapsArray as _, x}
			{#each Array(size) as _, y}
				{#each normalsArray as _, z}
					{@const index = Math.abs(
						(-$offset.x * size * size +
							x * size * size +
							-$offset.y * size +
							y * size +
							-$offset.z +
							z) %
							(size * size * size)
					)}
					{@const color = palette[index % palette.length]}
					<!-- {@const normalId = x * size + x} -->
					<T.Group position.x={-x * spacing} position.y={-y * spacing} position.z={-z * spacing}>
						<T.Mesh
							geometry={$cube.nodes['Cube'].geometry}
							on:click={(e) => {
								e.stopPropagation();
								const center = Math.floor(size / 2);
								transitionMatcap(new Vector3(center - x, center - y, center - z));
								console.log('matcapTransitionVector:', matcapTransitionVector);
							}}
						>
							<T.MeshStandardMaterial emissive={color} />
						</T.Mesh>
						<Text
							anchorY={'middle'}
							anchorX={'center'}
							fontSize={0.5}
							position.z={1.1}
							text={'' + index}
						/>
					</T.Group>
				{/each}
			{/each}
		{/each}
	{/if}
</T.Group>
