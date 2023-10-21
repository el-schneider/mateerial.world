<script lang="ts">
	import LoadingScreen from './LoadingScreen.svelte';

	import { Canvas } from '@threlte/core';
	import Scene from './Scene.svelte';

	import { Suspense } from '@threlte/extras';
	import { writable, type Writable } from 'svelte/store';
	import { transitionMatcap } from './Grid.svelte';
	import { Vector3 } from 'three';
	export const suspense: Writable<'loading' | 'error' | 'done'> = writable('loading');

	let index = 0;

	const bgColors = ['#000000', '#ff0000', '#ffff00', '#0000ff'] as const;

	type Color = (typeof bgColors)[number];

	let bgColor: Color = '#000000';
</script>

<header>
	<button on:click={() => transitionMatcap(new Vector3(0, 0, -100))}>+</button>
	<button on:click={() => transitionMatcap(new Vector3(0, 0, 100))}>-</button>
	<div id="matNumber">
		{index}
	</div>
	{#each bgColors as color, i}
		<button
			on:click={() => (bgColor = bgColors[i])}
			style="background: {color}; width: 12px; height: 12px; display: inline-block; border: 0;"
		/>
	{/each}
</header>

<div>
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
			<Scene />
		</Suspense>
	</Canvas>
</div>

<style>
	header {
		position: fixed;
	}

	#matNumber {
		display: inline-block;
		width: 40px;
	}

	div {
		width: 100%;
		height: 100vh;
	}
</style>
