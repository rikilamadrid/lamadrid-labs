// PROTOTYPE — throwaway dev harness for feature 35 (Orb component). Not
// linked from real nav. Lets you manually scrub `progress` 0-1 with a
// slider to verify all 5 stage states and the transitions between them,
// since the scroll rig that will drive this for real isn't built until
// feature 38. Delete once 38 wires the Orb into the real Process section.
import { OrbDevHarness } from "./OrbDevHarness";

export default function OrbDevPrototype() {
  return <OrbDevHarness />;
}
