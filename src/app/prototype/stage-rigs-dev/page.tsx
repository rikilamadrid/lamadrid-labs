// PROTOTYPE — throwaway dev harness for features 36-37 (stage device rigs
// 1-5 + table path). Not linked from real nav. Lets you manually scrub
// progress across all 5 stages to check gate alignment and rig coherence
// before the real scroll rig (feature 38) wires everything together. Delete
// once 38 lands.
import { StageRigsDevHarness } from "./StageRigsDevHarness";

export default function StageRigsDevPrototype() {
  return <StageRigsDevHarness />;
}
