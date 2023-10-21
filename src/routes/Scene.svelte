<script context="module" lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls, Suspense } from '@threlte/extras';
	import Grid, { SIZE, SPACING } from './Grid.svelte';

	const DEBUG = false;
</script>

<script lang="ts">
	export let bgColor = '#000000';

	const { scene } = useThrelte();
</script>

<T.PerspectiveCamera
	makeDefault
	fov={75}
	position={!DEBUG ? [0, 0, 4] : [SIZE * SPACING, SIZE * SPACING, SIZE * SPACING]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

{#if !DEBUG}
	<T.Fog
		color={bgColor}
		near={(SIZE / 2 - SPACING) * SPACING}
		far={(SIZE / 2) * SPACING}
		on:create={({ ref }) => {
			scene.fog = ref;
		}}
	/>
{/if}

<Grid />
