<script context="module" lang="ts">
	import { T } from '@threlte/core';
	import { useGltf } from '@threlte/extras';

	import { useMatcapTexture } from '$lib/useMatcapTexture.js';
	import { useNormalTexture } from '$lib/useNormalTexture.js';
	import { getContext } from 'svelte';
	import { get } from 'svelte/store';
	import type { TexturesContext } from './Scene.svelte';
</script>

<script lang="ts">
	export let matcapId: number;
	export let normalId: number;

	const { matcapTextures, normalTextures } = getContext<TexturesContext>('textures');

	$: matcapTexture = $matcapTextures?.[matcapId];
	$: matcap = matcapTexture?.map;

	$: normalTexture = $normalTextures?.[normalId];
	$: normalMap = normalTexture?.map;
</script>

{#if matcap}
	<T.MeshMatcapMaterial {matcap} {normalMap} />
{/if}
