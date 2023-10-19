// useNormalTexture.js
import {
	useLoader,
	type UseLoaderLoadInput,
	type UseLoaderLoadResult,
	type UseLoaderOptions
} from '@threlte/core';
import { writable, derived, get, type Writable } from 'svelte/store';
import { RepeatWrapping, Texture, TextureLoader, Vector2 } from 'three';

type Settings = {
	repeat?: number[];
	anisotropy?: number;
	offset?: number[];
};

export function useNormalTexture(
	id = 0,
	settings: Settings = {},
	options?: UseLoaderOptions<TextureLoader>
) {
	const { repeat = [1, 1], anisotropy = 1, offset = [0, 0] } = settings;

	const normalRoot =
		'https://rawcdn.githack.com/pmndrs/drei-assets/7a3104997e1576f83472829815b00880d88b32fb';
	const listUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/normals/normals.json';

	const normalTexture: Writable<Texture | null> = writable(null);
	const url = writable('');
	const numTot = writable(0);
	const loader = useLoader(TextureLoader, options);

	async function fetchNormalsList() {
		const res = await fetch(listUrl);
		const normalsList = await res.json();
		numTot.set(Object.keys(normalsList).length);
		const DEFAULT_NORMAL = normalsList[0];
		const imageName = normalsList[id] || DEFAULT_NORMAL;

		url.set(`${normalRoot}/normals/${imageName}`);
		const texture = await loader.load(get(url));
		normalTexture.set(texture);
	}

	fetchNormalsList();

	const derivedTexture = derived(
		[normalTexture, url, numTot],
		([$normalTexture, $url, $numTot]) => {
			if ($normalTexture) {
				$normalTexture.wrapS = $normalTexture.wrapT = RepeatWrapping;
				$normalTexture.repeat = new Vector2(repeat[0], repeat[1]);
				$normalTexture.offset = new Vector2(offset[0], offset[1]);
				$normalTexture.anisotropy = anisotropy;
			}
			return { texture: $normalTexture, url: $url, numTot: $numTot };
		}
	);

	return derivedTexture;
}
