import {
	asyncWritable,
	useCache,
	useLoader,
	useThrelte,
	type UseLoaderOptions
} from '@threlte/core';
import { TextureLoader, type Texture } from 'three';

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

type Settings = {
	format?: 64 | 128 | 256 | 512 | 1024;
	root?: string;
	listUrl?: string;
};

const LIST_URL = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/matcaps.json';
const DEFAULT_MATCAP_ROOT =
	'https://rawcdn.githack.com/emmelleppi/matcaps/9b36ccaaf0a24881a39062d05566c9e92be4aa0d';

export const useMatcapTexture = (
	id: number | string = 0,
	settings: Settings = {},
	options?: UseLoaderOptions<TextureLoader> &
		Parameters<ReturnType<typeof useLoader<typeof TextureLoader>>['load']>[1]
) => {
	const { format = 256, root = DEFAULT_MATCAP_ROOT, listUrl = LIST_URL } = settings;

	const { renderer } = useThrelte();
	const loader = useLoader(TextureLoader, {
		...options,
		transform: (res: Texture) => {
			if ('colorSpace' in res) {
				// >= r152
				res.colorSpace = renderer.outputColorSpace;
			} else {
				// < r152
				(res as any).encoding = (renderer as any).outputEncoding;
			}
			res.needsUpdate = true;
			return options?.transform?.(res) ?? res;
		}
	});

	const cache = useCache();

	const resultStore = asyncWritable(
		(async () => {
			const matcapList = await cache.remember(async () => {
				const matcapListResponse = await fetch(listUrl);
				return (await matcapListResponse.json()) as Record<string, string>;
			}, ['matcaps']);

			const numTot = Object.keys(matcapList).length;
			const defaultMatcap = matcapList[0];
			const fileHash = typeof id === 'string' ? id : matcapList[id];
			const fileName = `${fileHash || defaultMatcap}${getFormatString(format)}.png`;
			const url = `${root}/${format}/${fileName}`;

			const map = await loader.load(url);

			return { map, url, numTot };
		})()
	);

	return resultStore;
};
