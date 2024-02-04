import { Point, Rect, Vector, toDegrees } from "./lib/geometry";
import { assign, docAppend as docAppendActual, first, h, lerp, mapRange, nullthrows, pipe, px, withFn } from "./lib/util";

declare global {
  interface Window {
    $debug: { [key: string]: any };
  }
}

window.$debug = {};

const defaultTerminalVelocity = 1000;
const showStepCount = false;

const styleShadow = {
  // boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
};

const _gameObjectNames = new Map<string, number>();
function generateGameObjectName(baseName: string) {
  const number = _gameObjectNames.get(baseName) ?? 1;
  _gameObjectNames.set(baseName, number);
  return `${baseName}${number}`;
}

function assertUniqueGameObjectName(name: string) {
  if (_gameObjectNames.has(name)) {
    throw new Error(`GameObject name "${name}" already exists`);
  }
}

abstract class GameObject {
  rect: Rect = { x: 10, y: 10, w: 10, h: 10 };
  v: Vector = { x: 0, y: 0 };
  private _name: string;

  constructor(baseName: string, name?: string) {
    if (baseName.trim() === "") {
      throw new Error();
    }

    if (name) {
      assertUniqueGameObjectName(name);
      this._name = name;
    } else {
      this._name = generateGameObjectName(baseName);
    }
  }

  get name() {
    return this._name;
  }

  step(time: number): void {
    // do nothing
  }

  render(): void {
    // do nothing
  }
}

class World {
  objects: GameObject[] = [];

  push<T extends GameObject>(obj: T): T {
    this.objects.push(obj);
    return obj;
  }

  getRayIntersections(rayStart: Point, rayDirection: Vector, rayLength: number) {
    const intersections: Array<{ obj: GameObject; point: Point; distance: number }> = [];
    for (const obj of world.objects) {
      const point = Rect.intersectsRayAt(obj.rect, rayStart, rayDirection, rayLength);

      if (point) {
        intersections.push({ obj, point, distance: Point.distance(rayStart, point) });
      }
    }

    intersections.sort((a, b) => a.distance - b.distance);

    return intersections;
  }
}

const world = new World();

const container = nullthrows(document.getElementById("container"));

function docContainer<T extends HTMLElement>(element: T): T {
  return container.appendChild(element);
}

class Platform extends GameObject {
  div: HTMLElement;
  color: string = "white";

  constructor(args: { name?: string }) {
    super("Platform", args.name);
    this.div = docContainer(
      h.div({
        style: {
          backgroundColor: this.color,
          display: "inline-block",
          position: "absolute",
          borderRadius: px(4),
          ...styleShadow,
        },
      })
    );
  }

  render() {
    this.div.style.backgroundColor = this.color;
    this.div.style.width = px(this.rect.w);
    this.div.style.height = px(this.rect.h);
    this.div.style.top = px(this.rect.y);
    this.div.style.left = px(this.rect.x);
  }
}

class FinalPlatform extends Platform {
  finalTriggered = false;

  constructor() {
    super({ name: "FinalPlatform" });
  }

  step(time: number): void {
    const ball = world.objects.find((o) => o instanceof Ball) as Ball | null;
    const ballY = ball?.rect.y ?? 0;
    const distance = this.rect.y - ballY;
    if (distance < 500 && ball != null) {
      if (!this.finalTriggered) {
        this.finalTriggered = true;

        setTimeout(() => {
          ball.cameraFollow = false;
          const ballCount = 10;
          const halfBallCount = ballCount / 2;
          const createBall = (x: number) => {
            world.push(
              withFn(new Ball(), (o) => {
                o.rect.x = x;
                o.cameraFollow = false;
                o.rect.y = this.rect.y - 1200 - lerp(0, 2000, Math.random());
                o.bounceVelocity *= lerp(1, 1.3, Math.random());
              })
            );
          };

          for (let i = 0; i < halfBallCount; i++) {
            createBall(lerp(0, Rect.left(ball.rect) - ball.rect.w * 3, (i + 1) / halfBallCount));
          }

          for (let i = 0; i < halfBallCount; i++) {
            createBall(lerp(Rect.right(ball.rect) - 40, 900, (i + 1) / halfBallCount));
          }
        }, 1000);
      }
    }
  }
}

class InputPlatform extends GameObject {
  div: HTMLElement;
  isFirstCollision = true;
  input: HTMLInputElement;

  constructor(args: {
    inputLabel: string;
    buttonLabel: string;
    onSubmit: () => void;
    onFocusInput?: () => void;
    // onInputChange: (value: string) => void
  }) {
    super("InputPlatform", `InputPlatform: ${args.inputLabel}`);
    this.input = h.input({
      style: {
        backgroundColor: "#f3f3f3",
        border: "1px solid #ccc",
        borderRadius: px(4),
        padding: px(8),
        outline: "none",
        color: "#333",
        fontSize: "1.3rem",
      },
      value: "",
      onkeydown: (e) => {
        if (e.code === "Enter") {
          onSubmit(e);
        }
      },
      onfocus: args.onFocusInput,
      // onchange: (o) => args.onInputChange(o.target.value),
    });

    const onSubmit = (e) => {
      button.disabled = true;
      button.style.cursor = "default";
      this.input.disabled = true;
      label.style.opacity = "0.5";
      args.onSubmit();
    };

    const button = h.button({
      innerText: args.buttonLabel,
      onclick: onSubmit,
      style: {
        marginTop: px(4),
        alignSelf: "end",
        color: "white",
        backgroundColor: "#dc0045",
        fontWeight: "bold",
        padding: "12px 40px 9px 40px",
        borderRadius: px(4),
        outline: "none",
        border: "none",
        borderBottom: "3px solid #980032",
        cursor: "pointer",
        fontSize: "1rem",
        // boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
        // boxShadow: "rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset, rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
        // boxShadow: "rgba(0, 0, 0, 0.5) 0px 10px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px",
        // box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
      },
    });

    const label = h.div(
      {
        style: {
          display: "flex",
          flexDirection: "column",
          rowGap: px(8),
        },
      },
      [
        h.div({
          style: {
            color: "#444",
            fontSize: "1.3rem",
          },
          innerHTML: args.inputLabel,
        }),
        this.input,
        button,
      ]
    );

    this.div = docContainer(
      h.div(
        {
          style: {
            backgroundColor: "white",
            // border: "1px solid red",
            display: "inline-block",
            position: "absolute",
            padding: px(20),
            borderRadius: px(4),
            ...styleShadow,
            // backgroundColor: "green",
          },
        },
        [label]
      )
    );
  }

  render() {
    this.div.style.width = px(this.rect.w);
    // this.div.style.height = px(this.rect.h);
    this.div.style.top = px(this.rect.y);
    this.div.style.left = px(this.rect.x);
  }

  onCollide(gameObject: GameObject, time: number) {
    if (this.isFirstCollision) {
      this.isFirstCollision = false;
      this.input.focus();
    }
  }
}

function isPlatform(obj: GameObject): boolean {
  return obj instanceof Platform || obj instanceof InputPlatform;
}

class Ball extends GameObject {
  public gravity = 2000;
  public terminalVelocity = defaultTerminalVelocity;

  static DEFAULT_GRAVITY = 2000;

  private _boundingBoxWidth = 20;
  private _boundingBoxHeight = 20;
  private _renderHeight = 48;
  private _renderOffsetX = 0;
  private _renderOffsetY = 0;
  private _renderWidth = 48;
  private _renderActualHeight = 48;
  private _renderActualWidth = 48;

  private _ballDiv: HTMLElement;
  private _ballImageDiv: HTMLElement;
  private _ballImageContainerDiv: HTMLElement;
  private _rotation: number;

  public stretch = true;
  // public stretch = false;
  public bounce = true;
  // public bounce = false;
  public squash = true;
  public collision = true;
  public useSquashEnergy = true;

  public showBallBoundingBox = false;
  public showImageContainer = false;
  public ballRenderMode: "solid" | "outline" = "solid";
  // debug
  // public showBallBoundingBox = true;
  // public showImageContainer = true;
  // public ballRenderMode: "solid" | "outline" = "outline";

  public color = "#fad300";
  public targets = Array<Point>();
  public bounceVelocity = -900;
  public cameraFollow = true;
  private _squashEnergy = 0;

  get renderActualHeight() {
    return this._renderActualHeight;
  }

  constructor(name?: string) {
    super("Ball", name);

    assign(this.rect, { x: 50, y: 50, w: this._boundingBoxWidth, h: this._boundingBoxHeight });
    this._ballDiv = docContainer(
      h("div", {
        style: {
          border: this.showBallBoundingBox && "1px solid blue",
          display: "inline-block",
          position: "absolute",
        },
      })
    );

    const ballOuterRect = { x: 0, y: 0, w: this._renderActualWidth * 2, h: this._renderActualHeight * 2 };

    this._ballImageDiv = h("div", {
      // always centered ball graphic to squash and stretch
      style: {
        width: px(ballOuterRect.w),
        height: px(ballOuterRect.h),
        borderRadius: "50%",
        ...styleShadow,
      },
    });

    this._ballImageContainerDiv = docContainer(
      h(
        // fixed sized container
        "div",
        {
          style: {
            border: this.showImageContainer && "1px solid blue",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            width: px(ballOuterRect.w),
            height: px(ballOuterRect.h),
          },
        },
        [this._ballImageDiv]
      )
    );
  }

  render() {
    this._ballDiv.style.width = px(this.rect.w);
    this._ballDiv.style.height = px(this.rect.h);
    this._ballDiv.style.top = px(this.rect.y);
    this._ballDiv.style.left = px(this.rect.x);

    const ballOuterRect = { x: 0, y: 0, w: this._renderActualHeight * 2, h: this._renderActualWidth * 2 };

    Rect.setCenter(ballOuterRect, Rect.center(this.rect));
    this._ballImageContainerDiv.style.top = px(ballOuterRect.y + this._renderOffsetY);
    this._ballImageContainerDiv.style.left = px(ballOuterRect.x + this._renderOffsetX);

    this._ballImageDiv.style.backgroundColor = this.ballRenderMode === "solid" ? this.color : "";
    this._ballImageDiv.style.border = this.ballRenderMode === "outline" ? `1px solid ${this.color}` : "";

    this._ballImageDiv.style.height = px(this._renderActualHeight);
    this._ballImageDiv.style.height = px(this._renderActualHeight);
    this._ballImageDiv.style.width = px(this._renderActualWidth);

    this._ballImageDiv.style.transform = `rotate(${toDegrees(this._rotation)}deg) scale(${this._renderHeight / this._renderActualHeight}, ${this._renderWidth / this._renderActualWidth})`;
  }

  onCollide(gameObject: GameObject, time: number) {
    let { rect, v } = this;

    // if (this.bounce) {
    //   const intersectAmount = Rect.bottom(rect) - Rect.top(gameObject.rect);
    //   const relativeTimeOfContact = intersectAmount / v.y;
    //   // move back in time
    //   assign(rect, Point.add(rect, Point.mul(v, -relativeTimeOfContact)));
    //   v.y += this.gravity * time; // hack - gravity is goig nto be subtracted next frame this preserves the energy
    //   v.y = -v.y;
    //   assign(rect, Point.add(rect, Point.mul(v, relativeTimeOfContact)));
    // } else {
    //   v.y = 0;
    //   v.x = 0;
    //   Rect.setBottom(rect, Rect.top(gameObject.rect));
    // }

    if (this.targets.length > 0) {
      Rect.setBottom(rect, Rect.top(gameObject.rect));
      const target = nullthrows(this.targets.shift());
      this.launchAt(target);
    } else {
      if (this.bounce) {
        if (this._squashEnergy > 0) {
          // TODO: Maybe use the squash energy
          // v.y -= this._squashEnergy;
          this._squashEnergy = 0;
        }

        v.y = this.bounceVelocity; // e.g. bounceVelocity = -900
      } else {
        v.y = 0;
      }

      v.x = 0;
      Rect.setBottom(rect, Rect.top(gameObject.rect));
    }
  }

  step(time: number) {
    let { rect, v } = this;

    let platformInfos = world.getRayIntersections(Rect.center(rect), Vector.Down, this._renderActualHeight / 2).filter((o) => isPlatform(o.obj));
    let isSquashing = this.squash && platformInfos.length > 0;

    if (!isSquashing) {
      v.y += this.gravity * time; // technically it should only apply gravity if it's not on the group

      if (v.y > this.terminalVelocity) {
        v.y = this.terminalVelocity;
      }

      // if (Point.magnitude(v) > this.terminalVelocity) {
      // more accurate accurate terminal velocity but not needed
      //   const newV = Point.mul(Point.normalize(v), this.terminalVelocity);
      //   this.v = newV;
      //   v = newV;
      // }
    }

    const moveBy = Point.mul(v, time);
    assign(rect, Point.add(rect, moveBy));

    platformInfos = world.getRayIntersections(Rect.center(rect), Vector.Down, this._renderActualHeight / 2).filter((o) => isPlatform(o.obj));
    isSquashing = this.squash && platformInfos.length > 0;

    const performStretch = () => {
      const speed = Point.magnitude(v);
      const startStretchSpeed = 400;
      const percent = speed < startStretchSpeed ? 0 : mapRange(speed, startStretchSpeed, this.terminalVelocity, 0, 1);

      let renderHeight = this._renderActualHeight * lerp(1, 1.5, percent);

      const length = renderHeight;
      const platformInfos = world.getRayIntersections(Rect.center(rect), Vector.Down, length).filter((o) => o.obj !== this);

      if (platformInfos.length && v.y < 0) {
        // don't make it taller than the space between the ball and the platform
        const intersection = platformInfos[0];
        const fudge = 12;
        const maxRenderHeight = intersection.distance + this._boundingBoxHeight / 2 + fudge;
        renderHeight = Math.min(renderHeight, maxRenderHeight);
      }

      const directionVector = Point.normalize(this.v);
      const oppositeDirectionVector = Point.mul(directionVector, -1);

      const targetDistanceFromEdge = this._renderActualHeight / 2 - this.rect.y;
      const currentDistanceFromEdit = renderHeight / 2 - this.rect.y;
      const offsetAmount = currentDistanceFromEdit - targetDistanceFromEdge;

      const offsetVector = Point.mul(oppositeDirectionVector, offsetAmount);

      this._renderHeight = renderHeight;
      this._renderWidth = this._renderActualWidth * lerp(1, 0.9, percent);
      this._renderOffsetY = offsetVector.y;
      this._renderOffsetX = offsetVector.x;
    };

    if (isSquashing) {
      // squash
      const closestDistance = platformInfos[0];
      this._renderHeight = closestDistance.distance * 2;
      const shrinkPercent = 1 - this._renderHeight / this._renderActualHeight;
      this._renderWidth = this._renderActualWidth * (1 + shrinkPercent) * 0.9;
      this._renderOffsetY = 0;
      this._rotation = Point.angle(Vector.Up);
      if (this.useSquashEnergy) {
        if (Vector.isPointingDownward(v)) {
          if (this._squashEnergy === 0) {
            const percentEnergyToStore = 0.95;
            const energyToStore = v.y * percentEnergyToStore;
            this._squashEnergy = energyToStore;
            v.y -= energyToStore;
          }
        }
        if (Vector.isPointingUpward(v)) {
          // TODO: Ideally release energy when squash is over
          // if (this._squashEnergy > 0) {
          //   v.y -= Math.abs(this._squashEnergy);
          //   this._squashEnergy = 0;
          // }
        }
      }
    } else if (this.stretch) {
      this._renderHeight = this._renderActualHeight;
      this._renderWidth = this._renderActualWidth;
      performStretch();
      this._rotation = Point.angle(v);
    } else {
      this._renderHeight = this._renderActualHeight;
      this._renderWidth = this._renderActualWidth;
      this._rotation = Point.angle(v);
    }

    if (this.collision) {
      // check for collision with platform
      const platform = world.objects.find((o) => isPlatform(o) && Rect.intersectsRect(o.rect, rect));

      if (platform) {
        this.onCollide(platform, time);
        if (platform instanceof InputPlatform) {
          platform.onCollide(this, time);
        }
      }
    }

    // scroll the document

    // if (rect.y > window.innerHeight / 2) {
    //   window.scrollBy(0, moveBy.y);
    // }

    if (this.cameraFollow) {
      if (rect.y - window.scrollY > window.innerHeight / 2) {
        window.scrollTo(0, rect.y - window.innerHeight / 2);
      }
    }

    // document.body.scrollTop = this.rect.y;
  }

  launchAt(target: Point) {
    const isBelowY = (below: number, above: number) => below > above;

    if (!isBelowY(target.y, this.rect.y)) {
      throw new Error("target above ball not implemented yet");
    }

    // - calculate how long before it would reach that height
    const calcTimeToTargetY = (startY: number, gravity: number, initialForce: number, terminalVelocity: number, targetY: number) => {
      if (!isBelowY(targetY, startY)) {
        throw new Error("This only works with targets below the startY.");
      }

      let vy = initialForce;
      const time = 1 / 60;
      let y = startY;
      let totalTime = 0;
      let loopCount = 0;

      while (!isBelowY(y, targetY)) {
        // if (loopCount > 2000) {
        //   throw new Error("Infinite loop");
        // }
        loopCount++;
        vy += gravity * time;

        if (vy > terminalVelocity) {
          vy = terminalVelocity;
        }

        y += vy * time;
        totalTime += time;
      }

      const positionDiff = y - targetY;
      const timeDiff = positionDiff / vy;
      totalTime -= timeDiff;

      return totalTime;
    };

    const initialForce = -800;
    const timeToTarget = calcTimeToTargetY(this.rect.y, this.gravity, initialForce, defaultTerminalVelocity, target.y);
    this.v.y = initialForce;
    this.v.x = (target.x - this.rect.x) / timeToTarget;
  }
}

async function main() {
  let platform1: InputPlatform;
  let platform2: InputPlatform;
  let platform3: InputPlatform;
  let platform4: InputPlatform;
  let platform5: InputPlatform;

  const leftSide = 50;
  const rightSide = 550;
  const spaceBetweenInputs = 1000;

  const platformTopRight = (platform: InputPlatform) => Point.subtract(Rect.topRight(platform.rect), { x: 10, y: 0 });

  const activateBall = () => {
    ball.bounce = true;
    ball.gravity = Ball.DEFAULT_GRAVITY;
    ball.v.y = 900;
  };

  window.scrollTo(0, 0);
  setTimeout(() => window.scrollTo(0, 0));

  const hurryBall = () => {
    if (Vector.isPointingUpward(ball.v) || ball.v.y < 800) ball.v.y = 800;
  };

  platform1 = world.push(
    assign(
      new InputPlatform({
        inputLabel: "Spaces or Tabs?",
        buttonLabel: "Next",
        onSubmit: () => {
          activateBall();
          hurryBall();
          ball.targets.push(platformTopRight(platform1));
          ball.targets.push(Rect.topCenter(platform2.rect));
        },
        onFocusInput: () => {
          activateBall();
        },
      }),
      { rect: { x: leftSide, y: 450, w: 300, h: 25 } }
    )
  );

  const finalPlatform = world.push(assign(new FinalPlatform(), { rect: { x: 0, y: 8000 - 50, w: 1000, h: 50 } }));
  world.push(assign(new Platform({ name: "Padding" }), { rect: { x: 0, y: Rect.bottom(finalPlatform.rect), w: 1000, h: 40 }, color: "transparent" })); // this is just to visually add padding to the bottom

  platform2 = world.push(
    assign(
      new InputPlatform({
        inputLabel: "vim or emacs?",
        buttonLabel: "Next",
        onSubmit: () => {
          hurryBall();
          ball.targets.push(Rect.topLeft(platform2.rect));
          ball.targets.push(Rect.topCenter(platform3.rect));
        },
      }),
      { rect: { x: rightSide, y: platform1.rect.y + spaceBetweenInputs, w: 300, h: 25 } }
    )
  );

  platform3 = world.push(
    assign(
      new InputPlatform({
        inputLabel: "iPhone or Android?",
        buttonLabel: "Next",
        onSubmit: () => {
          hurryBall();
          ball.targets.push(platformTopRight(platform3));
          ball.targets.push(Rect.topCenter(platform4.rect));
        },
      }),
      { rect: { x: leftSide, y: platform2.rect.y + spaceBetweenInputs, w: 300, h: 25 } }
    )
  );

  platform4 = world.push(
    assign(
      new InputPlatform({
        inputLabel: "Xbox or Playstation?",
        buttonLabel: "Next",
        onSubmit: () => {
          hurryBall();
          ball.targets.push(Rect.topLeft(platform4.rect));
          ball.targets.push(Rect.topCenter(platform5.rect));
        },
      }),
      { rect: { x: rightSide, y: platform3.rect.y + spaceBetweenInputs, w: 300, h: 25 } }
    )
  );

  platform5 = world.push(
    assign(
      new InputPlatform({
        inputLabel: "Windows or Linux?",
        buttonLabel: "Done",
        onSubmit: () => {
          hurryBall();
          ball.targets.push(platformTopRight(platform5));
          ball.targets.push(Rect.topCenter(finalPlatform.rect));
        },
      }),
      { rect: { x: leftSide, y: platform4.rect.y + spaceBetweenInputs, w: 300, h: 25 } }
    )
  );

  const ball = world.push(
    withFn(new Ball("Main Ball"), (o) => {
      o.bounce = false; // turn on after activitate
      o.gravity = 0; // turn on on activiate
      o.rect.y = platform1.rect.y - 35;
      o.rect.x = platform1.rect.x + o.rect.w;

      const test: null | "last-question" | "final-platform" | "initial-bounce" = null;

      switch (test) {
        case "initial-bounce":
          o.rect.y = platform1.rect.y - 300;
          o.bounce = true; // turn on after activitate
          o.gravity = Ball.DEFAULT_GRAVITY; // turn on on activiate
          break;

        case "last-question":
          o.rect.y = platform5.rect.y - 300;
          o.rect.x = Rect.centerX(platform5.rect);
          o.bounce = true;
          o.gravity = Ball.DEFAULT_GRAVITY;
          break;
        case "final-platform":
          o.rect.y = finalPlatform.rect.y - 900;
          o.rect.x = Rect.centerX(finalPlatform.rect);
          o.bounce = true;
          o.gravity = Ball.DEFAULT_GRAVITY;
          break;
      }
    })
  );

  // window.$debug["ball"] = ball;

  // launch

  // ball.launchAt(targetBall.rect);

  const stepCountDiv = docContainer(h.div({ style: { display: showStepCount ? "block" : "none", position: "absolute", top: px(0), right: px(5), color: "white" } }));
  let stepCount = 0;

  const render = () => {
    world.objects.forEach((obj) => obj.render());

    stepCountDiv.innerText = stepCount.toString();
  };

  const step = (time: number) => {
    world.objects.forEach((obj) => obj.step(time));
  };

  const targetFps = 100;

  let state: "playing" | "paused" = "playing"; // initial state

  const stepFrame = (count: number = 1) => {
    for (let i = 0; i < count; i++) {
      step(1 / targetFps);
      stepCount++;
    }
  };

  window.addEventListener("keydown", (e) => {
    if (!(e.altKey && e.ctrlKey)) return;

    if (e.code === "KeyP") {
      if (state === "playing") {
        state = "paused";
      } else {
        state = "playing";
      }
    }

    if (e.code === "ArrowRight" || e.code === "PageDown") {
      if (e.shiftKey) {
        stepFrame(10);
      } else {
        stepFrame();
      }
      render();
    }
  });

  // stepFrame(50); // skip frames - before hit ground

  render();

  setInterval(() => {
    if (state !== "playing") return;
    stepFrame();
    render();
  }, 1000 / targetFps);
}

main();
