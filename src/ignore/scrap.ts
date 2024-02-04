import { Point } from "../lib/geometry";
import { docAppend, h, nullthrows } from "../lib/util";

async function main() {
  const canvas = docAppend(
    h.canvas({
      width: 800,
      height: 600,
      style: {
        border: "1px solid red",
      },
    })
  );

  const ctx = nullthrows(canvas.getContext("2d"));

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 800, 600);

  const drawPixel = (point: Point, color: string = "red") => {
    ctx.fillStyle = color;
    ctx.fillRect(point.x, point.y, 1, 1);
  };

  const g = 1000;
  let position: Point = { x: 100, y: 500 };
  let velocity: Point = { x: 100, y: -1000 };

  const targetFps = 10;
  const time = 1 / targetFps;

  const step = (time: number) => {
    velocity.y += g * time; // i = 0 # velocity.y = -1000 + 1000 * 0.1
    position.x += velocity.x * time; // i = 0 # position.x = 100 + velocity.x * time
    position.y += velocity.y * time; // i = 0
    drawPixel(position);
    drawPixel({ x: position.x, y: velocity.y * 0.25 + 300 }, "green");
  };

  const fixedStep = () => step(1 / 60);

  for (let i = 0; i < 120; i++) {
    step(time);
  }

  position = { x: 100, y: 500 };
  velocity = { x: 100, y: -1000 };

  for (let i = 1; i < 121; i++) {
    // velocity.y += g * time;
    velocity.y = -1000 + i * (g * time);
    position.x = 100 + i * (velocity.x * time);
    // position.y += velocity.y * time;
    position.y = 500 + i * (velocity.y * time);
    drawPixel({ x: position.x, y: position.y }, "blue");
    drawPixel({ x: position.x, y: velocity.y * 0.25 + 300 }, "blue");
  }
}

main();
