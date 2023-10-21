import { derived, writable } from 'svelte/store';
import { generateTuples } from './utils';
import { shuffle } from 'lodash-es';
import { Vector3 } from 'three';
import { page } from '$app/stores';

export const SIZE = 11;
export const SPACING = 5;
export const DEBUG = false;
export const DEFAULT_TRANSITION_DURATION = 500;

export const NORMAL_COUNT = 77;
export const MATCAP_COUNT = 642;

export const MATERIAL_TUPLES = shuffle(generateTuples(642, 77));

export const currentMaterial = derived(page, ($page) => $page.params.catchall.split('/') || [0, 0]);

// TODO make this more robust
export const lastCursor = writable(new Vector3(0, 0, 0));
export const cursor = writable(new Vector3(0, 0, 0));
