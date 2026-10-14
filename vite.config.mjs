import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Zoho loads /app/widget.html, so the build is written there.
export default defineConfig({
	plugins: [react()],
	base: "./",
	build: {
		outDir: "app",
		emptyOutDir: false,
		rollupOptions: {
			input: resolve("widget.html")
		}
	}
});
