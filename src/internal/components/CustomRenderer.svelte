<script lang="ts">
	import { useRender, useThrelte } from '@threlte/core';
	import {
		BlendFunction,
		EffectComposer,
		EffectPass,
		RenderPass,
		SSAOEffect,
		SMAAEffect,
		DepthOfFieldEffect
	} from 'postprocessing';
	import { Color } from 'three';

	const { scene, renderer, camera, size } = useThrelte();

	const composer = new EffectComposer(renderer);

	const setupEffectComposer = (camera: THREE.Camera) => {
		composer.removeAllPasses();
		composer.addPass(new RenderPass(scene, camera));

		const capabilities = renderer.capabilities;

		const depthOfFieldEffect = new DepthOfFieldEffect(camera, {
			focusDistance: 3.0,
			focalLength: 0.048,
			bokehScale: 6.0,
			height: 1080
		});

		const normalDepthBuffer = null;

		composer.addPass(new EffectPass(camera, depthOfFieldEffect));
	};

	$: setupEffectComposer($camera);
	$: composer.setSize($size.width, $size.height);

	useRender((_, delta) => {
		composer.render(delta);
	});
</script>
