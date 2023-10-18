<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';

	import { useMatcapTexture } from '$lib/useMatcapTexture.js';
	import { PerspectiveCamera } from 'three';
	const text = useMatcapTexture(34, 256);

	$: ({ map, numTot, url } = $text);
</script>

<T.PerspectiveCamera
	makeDefault
	position={[2, 2, 2]}
	on:create={({ ref }) => {
		ref.lookAt(0, 0, 0);
	}}
>
	<OrbitControls enableDamping />
</T.PerspectiveCamera>

{#if map}
	<T.Mesh>
		<T.BoxGeometry args={[1, 1, 1]} />
		<T.MeshMatcapMaterial matcap={map} />
	</T.Mesh>
{/if}
