<script lang="ts">
	import LoadingScreen from './LoadingScreen.svelte';

	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	import { Suspense } from '@threlte/extras';
	import { writable, type Writable } from 'svelte/store';
	import { currentMaterial, transitionMatcap } from './Grid.svelte';
	import { Vector3 } from 'three';
	export const suspense: Writable<'loading' | 'error' | 'done'> = writable('loading');

	let index = 0;

	const bgColors = ['#000000', '#ff0000', '#ffff00', '#0000ff'] as const;

	type Color = (typeof bgColors)[number];

	let bgColor: Color = '#000000';
</script>

<header class="fixed inset-0 bottom-auto flex flex-row">
	<button on:click={() => transitionMatcap(new Vector3(0, 0, -100))}>+</button>
	<button on:click={() => transitionMatcap(new Vector3(0, 0, 100))}>-</button>
	<div class="text-white font-display text-4xl">
		<div>Matcap: {$currentMaterial[0]}</div>
		<div>Normal: {$currentMaterial[1]}</div>
	</div>
	<div class="ml-auto">
		{#each bgColors as color, i}
			<button
				on:click={() => (bgColor = bgColors[i])}
				style="background: {color};"
				class="w-6 h-6 inline-block"
			/>
		{/each}
	</div>
</header>

<div class="h-screen">
	{#if $suspense === 'loading'}
		<LoadingScreen />
	{/if}

	<Canvas toneMapping={0}>
		<Suspense
			final
			on:load={() => ($suspense = 'done')}
			on:error={() => ($suspense = 'error')}
			on:suspend={() => ($suspense = 'loading')}
		>
			<Scene {bgColor} />
		</Suspense>
	</Canvas>
</div>
