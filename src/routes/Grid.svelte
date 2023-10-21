<script context="module" lang="ts">
	import { useMatcapTexture, useNormalTexture } from '$lib';
	import {
		T,
		asyncWritable,
		createRawEventDispatcher,
		useThrelte,
		type AsyncWritable
	} from '@threlte/core';
	import { interactivity, useGltf, useSuspense } from '@threlte/extras';
	import { setContext } from 'svelte';
	import { expoInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { get, writable } from 'svelte/store';
	import { Vector3 } from 'three';
	import MatcapNormalMaterial from './MatcapNormalMaterial.svelte';
	import { generateColorsInRange, generateTuples } from './utils';

	export const SIZE = 11;
	export const SPACING = 5;
	const DEBUG = false;

	const matcapCount = 642;
	const normalCount = 77;

	const palette = generateColorsInRange(SIZE * SIZE);

	const matcapTuples = generateTuples(642, 77);

	// TODO make this more robust
	export const lastCursor = writable(new Vector3(0, 0, 0));
	export const cursor = writable(new Vector3(0, 0, 0));
	export const matcapId = writable(0);

	export type TexturesContext = {
		matcapTextures: AsyncWritable<ReturnType<typeof useMatcapTexture>[]>;
		normalTextures: AsyncWritable<ReturnType<typeof useNormalTexture>[]>;
	};

	const DEFAULT_TRANSITION_DURATION = 500;

	let transitioning = false;

	const matcapTransition = tweened(0, {
		duration: DEFAULT_TRANSITION_DURATION,
		easing: expoInOut
	});

	let matcapTransitionVector = new Vector3(0, 0, 0);

	export const transitionMatcap = async (
		transition: Vector3,
		duration = DEFAULT_TRANSITION_DURATION
	) => {
		if (transitioning) return;
		matcapTransitionVector = transition.clone().multiplyScalar(SPACING);

		// currentMatcapOffset = currentMatcapOffset + Math.abs(offset);

		transitioning = true;

		matcapTransition.set(0, { duration: 0 });
		matcapTransition.set(-1, { duration });

		setTimeout(() => {
			matcapTransition.set(0, { duration: 0 });
			const last = get(lastCursor);

			cursor.set(last.clone().add(transition));

			lastCursor.set(get(cursor));

			transitioning = false;
		}, duration);
	};
</script>

<script lang="ts">
	interactivity();

	export let bgColor = '#000000';

	$: console.log('matcapId:', $matcapId);

	const cube = useGltf('/models/rounded_cube.glb');

	let matcapsTotal: number;

	const { renderer } = useThrelte();

	$: renderer.setClearColor(bgColor);

	const suspend = useSuspense();

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

	let currentMatcapOffset = 0;
	$: matcapsArray = Array(SIZE);
	$: normalsArray = Array(SIZE);

	const { scene } = useThrelte();

	const dispatch = createRawEventDispatcher<{ indexUpdate: [number, number] }>();

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

	const calcIndex = (pos: Vector3, offset: Vector3, size: number) => {
		const halfSize = Math.floor(size / 2);

		const index = Math.abs(
			-halfSize * (size * size + size + 1) +
				size * size * (pos.x - offset.x) +
				size * (pos.y - offset.y) +
				(pos.z - offset.z)
		);

		const center = Math.floor(size / 2);
		const centerVector = new Vector3(center, center, center);

		if (centerVector.equals(pos)) {
			dispatch('indexUpdate', matcapTuples[index % matcapTuples.length]);
		}

		return index;
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
						{@const color = palette[index % palette.length]}
						{@const tuple = matcapTuples[index % matcapTuples.length]}
						<!-- {@const normalId = x * size + x} -->
						<T.Group position.x={-x * SPACING} position.y={-y * SPACING} position.z={-z * SPACING}>
							<T.Mesh
								geometry={$cube.nodes['Cube'].geometry}
								on:click={(e) => {
									e.stopPropagation();
									const center = Math.floor(SIZE / 2);
									transitionMatcap(new Vector3(center - x, center - y, center - z));
									console.log('matcapTransitionVector:', matcapTransitionVector);
								}}
							>
								<!-- <T.MeshStandardMaterial emissive={color} /> -->
								<MatcapNormalMaterial matcapId={tuple[0]} normalId={tuple[1]} />
							</T.Mesh>
							<!-- <Text
								anchorY={'middle'}
								anchorX={'center'}
								fontSize={0.5}
								position.z={1.01}
								text={'' + index}
							/> -->
						</T.Group>
					{/each}
				{/each}
			{/each}
		{/if}
	</T.Group>
{/if}
