import { bindings, defineConfig } from "cf/config";

export default defineConfig((ctx) => {
	if (ctx.isPreview) {
		return {
			worker: {
				name: "rera-report-card",
				compatibilityDate: "2026-10-01",
				entrypoint: "src/site/entry.ts",
				observability: {
					enabled: true,
				},
				env: {
					FROM_ADDRESS: bindings.text("follow@REPLACE_WITH_DOMAIN"),
					PUBLIC_ORIGIN: bindings.text("https://REPLACE_WITH_DOMAIN"),
					DB: bindings.d1({
						name: "rera-report-card-preview",
						id: "6d0bc6a6-9001-4731-9cbf-66041bce0daa",
					}),
					EMAIL: bindings.sendEmail({}),
					SECRET: bindings.secret(),
				},
			},
		};
	}
	return {
		worker: {
			name: "rera-report-card",
			compatibilityDate: "2026-10-01",
			entrypoint: "src/site/entry.ts",
			observability: {
				enabled: true,
			},
			env: {
				FROM_ADDRESS: bindings.text("follow@REPLACE_WITH_DOMAIN"),
				PUBLIC_ORIGIN: bindings.text("https://REPLACE_WITH_DOMAIN"),
				DB: bindings.d1({
					name: "rera-report-card",
					id: "1dc0ddec-8c0a-4a96-bf7e-29672a53516a",
				}),
				EMAIL: bindings.sendEmail({}),
				SECRET: bindings.secret(),
			},
		},
	};
});
