import { defineWranglerConfig } from "wrangler/experimental-config";

export default defineWranglerConfig((ctx) => {
	if (ctx.isPreview) {
		return {
			rules: [
				{
					type: "Data",
					globs: [
						"**/*.ttf",
					],
				},
			],
		};
	}
	return {
		rules: [
			{
				type: "Data",
				globs: [
					"**/*.ttf",
				],
			},
		],
	};
});
