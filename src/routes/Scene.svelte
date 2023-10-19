<script context="module" lang="ts">
	import { T } from '@threlte/core';
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

	const depth = 5;
	const cols = 5;
	const rows = 5;
	const distance = 5;
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
</script>

<CustomRenderer />

<T.PerspectiveCamera
	makeDefault
	position={[0, 0, 4]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

<T.Group position.x={((cols - 1) * distance) / 2} position.y={((rows - 1) * distance) / 2}>
	{#if $cube}
		{#each Array(cols) as _, col}
			{#each Array(rows) as _, row}
				{#each Array(depth) as _, depth}
					{@const index = depth * cols + col}
					<T.Mesh
						geometry={$cube.nodes['Cube'].geometry}
						position.x={-col * distance}
						position.y={-row * distance}
						position.z={-depth * distance}
					>
						<MatcapMaterial matcapId={index % matcapCount} normalId={index % normalCount} />
					</T.Mesh>
				{/each}
			{/each}
		{/each}
	{/if}
</T.Group>
