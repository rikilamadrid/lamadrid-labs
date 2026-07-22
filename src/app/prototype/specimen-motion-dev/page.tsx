// PROTOTYPE — throwaway dev harness for the specimen motion system rebuild.
// Not linked from real nav. Lets you manually scrub heroT and progress with
// sliders against simple placeholder stage anchors (no equipment) to judge
// the tiny particle's motion/character in isolation. Delete once the
// equipment rebuild pass supersedes it.
import { SpecimenMotionDevHarness } from "./SpecimenMotionDevHarness";

export default function SpecimenMotionDevPrototype() {
  return <SpecimenMotionDevHarness />;
}
