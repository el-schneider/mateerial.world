<script lang="ts">
	import { Canvas } from '@threlte/core';
	import Scene, { rollDice } from './Scene.svelte';
</script>

<!-- <header>
	<button on:click={rollDice}>Roll Dice</button>
</header> -->

<div>
	<Canvas>
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
