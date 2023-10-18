import { useCache, useLoader, type UseLoaderOptions } from '@threlte/core';
import { derived, get, writable, type Writable } from 'svelte/store';
import { type Texture, TextureLoader } from 'three';

function getFormatString(format: number) {
	switch (format) {
		case 64:
			return '-64px';
		case 128:
			return '-128px';
		case 256:
			return '-256px';
		case 512:
			return '-512px';
		default:
			return '';
	}
}

export function useMatcapTexture(
	id: number | string = 0,
	format: 64 | 128 | 256 | 512 | 1024 = 256,
	options?: UseLoaderOptions<TextureLoader>
) {
	const matcapRoot =
		'https://rawcdn.githack.com/emmelleppi/matcaps/9b36ccaaf0a24881a39062d05566c9e92be4aa0d';
	const listUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/matcaps.json';

	const matcapTexture: Writable<Texture | null> = writable(null);
	const url = writable('');
	const numTot = writable(0);
	const loader = useLoader(TextureLoader, options);

	const cache = useCache();

	async function load() {
		const matcapList = await cache.remember(async () => {
			const matcapListResponse = await fetch(listUrl);
			return (await matcapListResponse.json()) as Record<string, string>;
		}, ['matcaps']);

		numTot.set(Object.keys(matcapList).length);

		const defaultMatcap = matcapList[0];
		const fileHash = typeof id === 'string' ? id : matcapList[id];
		const fileName = `${fileHash || defaultMatcap}${getFormatString(format)}.png`;
		const urlString = `${matcapRoot}/${format}/${fileName}`;
		url.set(urlString);

		const texture = await loader.load(get(url));
		matcapTexture.set(texture);
	}

	load();

	const derivedTexture = derived(
		[matcapTexture, url, numTot],
		([$matcapTexture, $url, $numTot]) => {
			return { map: $matcapTexture, url: $url, numTot: $numTot };
		}
	);

	return derivedTexture;
}
