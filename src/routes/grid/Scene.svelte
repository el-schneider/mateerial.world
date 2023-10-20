<script context="module" lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { writable } from 'svelte/store';
	import { OrbitControls, interactivity, useGltf } from '@threlte/extras';
	import { generateColorsInRange } from './utils';
	import { tweened } from 'svelte/motion';
	import { expoInOut } from 'svelte/easing';
	import { tick } from 'svelte';

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
	export const offset = writable(100000);
</script>

<script lang="ts">
	interactivity();

	const cube = useGltf('/models/rounded_cube.glb');

	const duration = 500;

	const offsetMatcaps = tweened(0, {
		duration,
		easing: expoInOut
	});

	let currentMatcapOffset = 0;
	$: matcapsArray = Array(size);
	$: normalsArray = Array(size);

	const { scene } = useThrelte();

	let transitioning = false;

	const transitionMatcap = async (off: number) => {
		if (transitioning) return;
		// currentMatcapOffset = currentMatcapOffset + Math.abs(offset);

		transitioning = true;

		offsetMatcaps.set(0, { duration: 0 });
		offsetMatcaps.set(-off, { duration });

		setTimeout(() => {
			offsetMatcaps.set(0, { duration: 0 });
			$offset = $offset - off;
			transitioning = false;
		}, duration);
	};

	const handleKeyUp = (e) => {
		switch (e.key) {
			case 'ArrowLeft':
				transitionMatcap(-1);
				break;
			case 'ArrowRight':
				transitionMatcap(1);
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
	position.x={((size - 1) * spacing) / 2 + $offsetMatcaps * spacing}
	position.y={((size - 1) * spacing) / 2}
	position.z={((size - 1) * spacing) / 2}
>
	{#if $cube}
		{#each matcapsArray as _, x}
			{#each Array(size) as _, y}
				{#each normalsArray as _, z}
					{@const index = $offset * size * size + x * size * size + y * size + z}
					{@const color = palette[index % palette.length]}
					<!-- {@const normalId = x * size + x} -->
					<T.Mesh
						geometry={$cube.nodes['Cube'].geometry}
						position.x={-x * spacing}
						position.y={-y * spacing}
						position.z={-z * spacing}
						on:click={(e) => {
							e.stopPropagation();
							const offset = Math.floor(size / 2) - x;
							transitionMatcap(offset);
							console.log('offset:', offset);
						}}
					>
						<T.MeshStandardMaterial emissive={color} />
					</T.Mesh>
				{/each}
			{/each}
		{/each}
	{/if}
</T.Group>
