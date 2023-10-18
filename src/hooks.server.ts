/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error, event }) {
	return {
		message: import.meta.env.DEV ? error.message : 'Whoops!',
		code: error?.code ?? 'UNKNOWN'
	};
}
