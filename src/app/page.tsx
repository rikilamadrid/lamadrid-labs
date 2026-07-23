import { ShellStage } from "@/components/shell/ShellStage";

// The homepage is the no-scroll shell. `main` and the state machine live in the
// layout / ShellProvider; this route just mounts the stage that renders the
// active full-screen state. The parked Work / About / Contact sections return
// as their own states in later features.
export default function Home() {
  return <ShellStage />;
}
