<script context="module" lang="ts">
	import { useMatcapTexture, useNormalTexture } from '$lib';
	import {
		T,
		asyncWritable,
		createRawEventDispatcher,
		useThrelte,
		type AsyncWritable
	} from '@threlte/core';
	import { Text, interactivity, useGltf, useSuspense } from '@threlte/extras';
	import { setContext } from 'svelte';
	import { expoInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { get, writable } from 'svelte/store';
	import { Vector3 } from 'three';
	import MatcapNormalMaterial from './MatcapNormalMaterial.svelte';
	import {
		DEFAULT_TRANSITION_DURATION,
		SPACING,
		SIZE,
		MATERIAL_TUPLES,
		currentMaterial,
		cursor,
		lastCursor
	} from './state';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	export type TexturesContext = {
		matcapTextures: AsyncWritable<ReturnType<typeof useMatcapTexture>[]>;
		normalTextures: AsyncWritable<ReturnType<typeof useNormalTexture>[]>;
	};

	let transitioning = false;

	const center = Math.floor(SIZE / 2);
	const CENTER = new Vector3(center, center, center);

	const matcapTransition = tweened(0, {
		duration: DEFAULT_TRANSITION_DURATION,
		easing: expoInOut
	});

	let matcapTransitionVector = new Vector3(0, 0, 0);

	export const calcIndex = (pos: Vector3, offset: Vector3, size: number) => {
		const halfSize = Math.floor(size / 2);

		const index = Math.abs(
			-halfSize * (size * size + size + 1) +
				size * size * (pos.x - offset.x) +
				size * (pos.y - offset.y) +
				(pos.z - offset.z)
		);

		// const center = Math.floor(size / 2);
		// const centerVector = new Vector3(center, center, center);

		// if (centerVector.equals(pos)) {
		// 	const current = MATERIAL_TUPLES[index % MATERIAL_TUPLES.length];
		// 	goto(`/${current[0]}/${current[1]}`);
		// }

		return index;
	};

	export const transitionMatcap = async (
		transition: Vector3,
		duration = DEFAULT_TRANSITION_DURATION
	) => {
		if (transitioning) return;
		matcapTransitionVector = transition.clone().multiplyScalar(SPACING);

		transitioning = true;

		matcapTransition.set(0, { duration: 0 });
		matcapTransition.set(-1, { duration });

		setTimeout(() => {
			matcapTransition.set(0, { duration: 0 });
			const last = get(lastCursor);

			console.log('last:', last);

			const index = calcIndex(last.clone().add(CENTER), transition, SIZE);
			console.log('index:', index);

			goto(
				`/${MATERIAL_TUPLES[index % MATERIAL_TUPLES.length][0]}/${
					MATERIAL_TUPLES[index % MATERIAL_TUPLES.length][1]
				}`
			);

			// cursor.set(last.clone().add(transition));

			// lastCursor.set(get(cursor));

			transitioning = false;
		}, duration);
	};
</script>

<script lang="ts">
	interactivity();

	const suspend = useSuspense();

	const cube = suspend(useGltf('/models/rounded_cube.glb'));

	const matcapTextures = suspend(
		asyncWritable(
			(async () => {
				return await Promise.all(
					Array(641)
						.fill({})
						.map((_, i) =>
							useMatcapTexture(i, {
								format: 128,
								root: '/textures/matcaps',
								listUrl: '/textures/matcaps/matcaps.json'
							})
						)
				);
			})()
		)
	);

	const normalTextures = suspend(
		asyncWritable(
			(async () => {
				return await Promise.all(
					Array(77)
						.fill({})
						.map((_, i) =>
							useNormalTexture(i, {
								repeat: [5, 5],
								root: '/textures/normals',
								listUrl: '/textures/normals/normals.json'
							})
						)
				);
			})()
		)
	);

	setContext('textures', { matcapTextures, normalTextures });

	$: matcapsArray = Array(SIZE);
	$: normalsArray = Array(SIZE);

	const { scene } = useThrelte();

	const handleKeyUp = (e) => {
		switch (e.key) {
			case 'ArrowLeft':
				transitionMatcap(new Vector3(-1, 0, 0));
				break;
			case 'ArrowRight':
				transitionMatcap(new Vector3(1, 0, 0));
				break;
			default:
				break;
		}
	};

	$: console.log('$cursor:', $cursor);
</script>

{#if $normalTextures && $matcapTextures}
	<T.Group
		position.x={((SIZE - 1) * SPACING) / 2 + $matcapTransition * matcapTransitionVector.x}
		position.y={((SIZE - 1) * SPACING) / 2 + $matcapTransition * matcapTransitionVector.y}
		position.z={((SIZE - 1) * SPACING) / 2 + $matcapTransition * matcapTransitionVector.z}
	>
		{#if $cube}
			{#each matcapsArray as _, x}
				{#each Array(SIZE) as _, y}
					{#each normalsArray as _, z}
						{@const index = calcIndex(new Vector3(x, y, z), $cursor, SIZE)}
						{@const tuple = MATERIAL_TUPLES[index % MATERIAL_TUPLES.length]}
						<!-- {@const normalId = x * size + x} -->
						<T.Group position.x={-x * SPACING} position.y={-y * SPACING} position.z={-z * SPACING}>
							<T.Mesh
								geometry={$cube.nodes['Cube'].geometry}
								on:click={(e) => {
									e.stopPropagation();
									transitionMatcap(CENTER.clone().add(new Vector3(-x, -y, -z)));
								}}
							>
								<!-- <T.MeshStandardMaterial emissive={color} /> -->
								<MatcapNormalMaterial matcapId={tuple[0]} normalId={tuple[1]} />
							</T.Mesh>
							<Text
								anchorY={'middle'}
								anchorX={'center'}
								fontSize={0.5}
								position.z={1.01}
								text={'' + index}
							/>
						</T.Group>
					{/each}
				{/each}
			{/each}
		{/if}
	</T.Group>
{/if}
