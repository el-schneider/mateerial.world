<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import '../app.postcss';
	import App from './App.svelte';

	import { MATERIAL_TUPLES } from './state';

	const firstTuple = MATERIAL_TUPLES[0];

	onMount(() => {
		if (location.pathname === '/') goto(`/${firstTuple[0]}/${firstTuple[1]}`);
	});
</script>

<App />
<div
	class="fixed top-0 left-1/2 -translate-x-1/2 text-white font-display text-4xl flex-[] text-center p-1"
>
	mateerial.world
</div>

<slot />
