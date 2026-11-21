// Whisper Gallery — keyboard and mouse input.
// One job: track held keys, edge presses, clicks and the click-to-move target.

export function createInput(canvas) {
  const input = {
    keys: new Set(),
    pressed: new Set(),
    mouseX: 0,
    mouseY: 0,
    clicked: null,
    isDown(code) {
      return this.keys.has(code);
    },
    wasPressed(code) {
      return this.pressed.has(code);
    },
    clearPressed() {
      this.pressed.clear();
    },
  };
  window.addEventListener("keydown", (event) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }
    if (!event.repeat) {
      input.pressed.add(event.code);
    }
    input.keys.add(event.code);
  });
  window.addEventListener("keyup", (event) => {
    input.keys.delete(event.code);
  });
  window.addEventListener("blur", () => {
    input.keys.clear();
  });
  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = event.clientX - rect.left;
    input.mouseY = event.clientY - rect.top;
  });
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    input.clicked = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  });
  return input;
}

export function consumeClick(input) {
  const click = input.clicked;
  input.clicked = null;
  return click;
}
