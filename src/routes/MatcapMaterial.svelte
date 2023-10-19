<script context="module" lang="ts">
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';

	import { useMatcapTexture } from '$lib/useMatcapTexture.js';
	import { useNormalTexture } from '$lib/useNormalTexture.js';
</script>

<script lang="ts">
	export let matcapId: number;
	export let normalId: number;

	$: matcapTexture = useMatcapTexture(Math.floor(matcapId), 64);
	$: normalTexture = useNormalTexture(Math.floor(normalId), { repeat: [5, 5] });

	$: ({ map, numTot, url } = $matcapTexture);
	$: ({ texture: normalMap, numTot: normalNumTot } = $normalTexture);

	// $: console.log('normalMap:', normalMap);
	// $: console.log('numTot:', numTot);
</script>

{#if map && normalMap}
	<T.MeshMatcapMaterial matcap={map} {normalMap} />
{/if}
