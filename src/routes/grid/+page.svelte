<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene, { offset } from './Scene.svelte';
</script>

<header>
	<button on:click={() => ($offset = ($offset + 1) % 5)}>+</button>
	<button on:click={() => ($offset = ($offset - 1) % 5)}>-</button>
</header>

<div>
	<Canvas toneMapping={0}>
		<Scene />
	</Canvas>
</div>

<style>
	header {
		position: fixed;
	}

	div {
		width: 100%;
		height: 100vh;
		background: red;
	}
</style>
