// PROTOTYPE — throwaway dev harness for feature 36 (stage device rigs 1-3).
// Not linked from real nav. Lets you manually scrub progress across the
// first 3 stages to check gate alignment and rig coherence before the real
// scroll rig (feature 38) wires everything together. Delete once 38 lands.
import { StageRigsDevHarness } from "./StageRigsDevHarness";

export default function StageRigsDevPrototype() {
  return <StageRigsDevHarness />;
}
