// Demo Phase 0 runner - end-to-end MVP skeleton

import { createInitialWorld } from "../memory/world";
import { runPhase0Task } from "../orchestrator";

async function main() {
  const world = createInitialWorld();
  const input = { id: "T0.1", action: "create_product", data: { name: "Demo Product", price: 9.99 } };
  console.log("Starting Phase 0 demo with input:", input);
  const result = await runPhase0Task(input, world);
  console.log("Phase 0 demo result:", JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error("Phase 0 demo failed:", e);
  process.exit(1);
});
