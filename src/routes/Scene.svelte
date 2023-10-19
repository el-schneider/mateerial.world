<script context="module" lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { GLTF, OrbitControls, useGltf } from '@threlte/extras';

	import { useMatcapTexture } from '$lib/useMatcapTexture.js';
	import { useNormalTexture } from '$lib/useNormalTexture.js';
	import { MathUtils, PerspectiveCamera } from 'three';
	import { writable } from 'svelte/store';

	let matcapId = writable(0);
	let normalId = writable(0);

	const matcapCount = 642;
	const normalCount = 77;

	export const rollDice = () => {
		matcapId.set(MathUtils.randInt(0, matcapCount));
		normalId.set(MathUtils.randInt(0, normalCount));
	};

	rollDice();

	const depth = 15;
	const cols = 5;
	const rows = 5;
	const distance = 5;
	const offset = 0;
</script>

<script lang="ts">
	import CustomRenderer from '$components/CustomRenderer.svelte';
	import MatcapMaterial from './MatcapMaterial.svelte';

	$: matcapTexture = useMatcapTexture(Math.floor($matcapId), 64);
	$: normalTexture = useNormalTexture(Math.floor($normalId), { repeat: [5, 5] });
	const cube = useGltf('/models/rounded_cube.glb');

	$: ({ map, numTot, url } = $matcapTexture);
	$: ({ texture: normalMap, numTot: normalNumTot } = $normalTexture);

	$: console.log('normalMap:', normalMap);
	$: console.log('numTot:', numTot);

	const { scene } = useThrelte();
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 0, 4]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

<T.Fog
	color={'red'}
	near={(depth / 2 - distance) * distance}
	far={(depth / 2) * distance}
	on:create={({ ref }) => {
		scene.fog = ref;
	}}
/>

<T.Group
	position.x={((cols - 1) * distance) / 2}
	position.y={((rows - 1) * distance) / 2}
	position.z={((depth - 1) * distance) / 2}
>
	{#if $cube}
		{#each Array(cols) as _, col}
			{#each Array(rows) as _, row}
				{#each Array(depth) as _, depth}
					{@const matcapId = offset + row + depth * cols + (col % matcapCount)}
					{@const normalId = (offset + (col * rows + col)) % normalCount}
					<T.Mesh
						geometry={$cube.nodes['Cube'].geometry}
						position.x={-col * distance}
						position.y={-row * distance}
						position.z={-depth * distance}
					>
						<MatcapMaterial {matcapId} {normalId} />
					</T.Mesh>
				{/each}
			{/each}
		{/each}
	{/if}
</T.Group>
