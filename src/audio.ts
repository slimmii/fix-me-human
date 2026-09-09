let context: AudioContext | undefined;
export function sound(mute: boolean, type: "key" | "talk" | "win" = "key") {
  if (mute) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const ctx = context;
    const notes =
      type === "win"
        ? [440, 554, 659, 880]
        : type === "talk"
          ? [180, 260, 150]
          : [1800];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(),
        g = ctx.createGain();
      o.type = type === "key" ? "triangle" : "square";
      o.frequency.value = f;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.025, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
      o.start(t);
      o.stop(t + 0.08);
    });
  } catch {
    /* Audio is optional. */
  }
}

// A local dot-matrix motor: alternating carriage buzzes and feed clicks.
export function printerSound(mute: boolean): () => void {
  if (mute) return () => {};
  try {
    context ??= new AudioContext();
    void context.resume();
    const ctx = context;
    const output = ctx.createGain();
    output.gain.value = 0.035;
    output.connect(ctx.destination);
    for (let i = 0; i < 30; i++) {
      const oscillator = ctx.createOscillator(),
        envelope = ctx.createGain();
      const t = ctx.currentTime + i * 0.1;
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(
        i % 6 === 0 ? 95 : 230 + (i % 2) * 100,
        t,
      );
      oscillator.frequency.linearRampToValueAtTime(65, t + 0.075);
      envelope.gain.setValueAtTime(0, t);
      envelope.gain.linearRampToValueAtTime(0.6, t + 0.005);
      envelope.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
      oscillator.connect(envelope);
      envelope.connect(output);
      oscillator.start(t);
      oscillator.stop(t + 0.09);
      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
      };
    }
    return () => {
      output.disconnect();
    };
  } catch {
    return () => {};
  }
}
