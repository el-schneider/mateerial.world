<script context="module" lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { OrbitControls, Suspense } from '@threlte/extras';
	import Grid from './Grid.svelte';
	import { SIZE, SPACING } from './state';

	const DEBUG = false;
</script>

<script lang="ts">
	export let bgColor = '#000000';

	const { scene, renderer } = useThrelte();

	$: renderer.setClearColor(bgColor);
</script>

<T.PerspectiveCamera
	makeDefault
	fov={75}
	position={!DEBUG ? [0, 0, 4] : [SIZE * SPACING, SIZE * SPACING, SIZE * SPACING]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls enableDamping enablePan={DEBUG} enableZoom={DEBUG} />
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
