<script lang="ts">
	import LoadingScreen from './LoadingScreen.svelte';

	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	import { Suspense } from '@threlte/extras';
	import { writable, type Writable } from 'svelte/store';

	import { Vector3 } from 'three';
	import { transitionMatcap } from './Grid.svelte';
	import { currentMaterial } from './state';

	export const suspense: Writable<'loading' | 'error' | 'done'> = writable('loading');

	let index = 0;

	const bgColors = ['#000000', '#ff0000', '#ffff00', '#0000ff'] as const;

	type Color = (typeof bgColors)[number];

	let bgColor: Color = '#000000';
</script>

<header
	class="fixed inset-0 top-auto md:top-0 md:bottom-auto flex flex-row items-end md:items-start pointer-events-none p-1"
>
	<!-- <button on:click={() => transitionMatcap(new Vector3(0, 0, -100))}>+</button>
	<button on:click={() => transitionMatcap(new Vector3(0, 0, 100))}>-</button> -->
	<div class="text-white font-display text-4xl">
		<div>Matcap: {$currentMaterial[0]}</div>
		<div>Normal: {$currentMaterial[1]}</div>
	</div>

	<div class="ml-auto">
		{#each bgColors as color, i}
			<button
				on:click={() => (bgColor = bgColors[i])}
				style="background: {color};"
				class="w-6 h-6 inline-block pointer-events-auto"
			/>
		{/each}
	</div>
</header>

<footer
	class="fixed top-0 md:top-auto md:bottom-0 text-white p-1 text-right w-full -rotate-90 origin-top-right -ml-8 md:rotate-0 md:ml-0"
>
	code by <a href="https://github.com/el-schneider/mateerial.world" target="_blank" rel="noopener"
		>el-schneider</a
	>
	made with <a href="https://threlte.xyz" target="_blank">threlte</a>
</footer>

<div class="h-screen select-none touch-pan-x touch-pan-y">
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
