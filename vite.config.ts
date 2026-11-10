import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

// cf build and cf dev delegate the bundling to the Cloudflare Vite plugin
// (Cloudflare docs, "Deploy your first Worker"). The state path holds local dev
// data, the same file cf d1 raw --persist-to reads (see
// .claude/skills/verify-rera-report-card/SKILL.md).
export default defineConfig({
	plugins: [cloudflare({ persistState: { path: ".cloudflare/state" } })],
});
