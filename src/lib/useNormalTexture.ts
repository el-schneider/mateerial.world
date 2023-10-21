// useNormalTexture.js
import { useLoader, asyncWritable, useCache, type UseLoaderOptions } from '@threlte/core';
import { RepeatWrapping, TextureLoader, Vector2 } from 'three';

type Settings = {
	repeat?: number[];
	anisotropy?: number;
	offset?: number[];
	normalRoot?: string;
};

const LIST_URL = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/normals/normals.json';
const DEFAULT_NORMAL_ROOT =
	'https://rawcdn.githack.com/pmndrs/drei-assets/7a3104997e1576f83472829815b00880d88b32fb/normals';

export const useNormalTexture = (
	id = 0,
	settings: Settings = {},
	options?: UseLoaderOptions<TextureLoader>
) => {
	const {
		repeat = [1, 1],
		anisotropy = 1,
		offset = [0, 0],
		normalRoot = DEFAULT_NORMAL_ROOT
	} = settings;

	const loader = useLoader(TextureLoader, options);
	const cache = useCache();

	const resultStore = asyncWritable(
		(async () => {
			const normalsList = await cache.remember(async () => {
				const res = await fetch(LIST_URL);
				return await res.json();
			}, ['normals']);

			const numTot = Object.keys(normalsList).length;
			const DEFAULT_NORMAL = normalsList[0];
			const imageName = normalsList[id] || DEFAULT_NORMAL;
			const url = `${normalRoot}/${imageName}`;

			const map = await loader.load(url);

			if (map) {
				map.wrapS = map.wrapT = RepeatWrapping;
				map.repeat = new Vector2(repeat[0], repeat[1]);
				map.offset = new Vector2(offset[0], offset[1]);
				map.anisotropy = anisotropy;
			}

			return { map, url, numTot };
		})()
	);

	return resultStore;
};
