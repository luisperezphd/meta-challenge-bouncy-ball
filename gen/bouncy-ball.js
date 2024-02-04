(() => {
  // src/lib/util.ts
  function h(tagName, props, children) {
    const elm = document.createElement(tagName);
    const { style } = props;
    delete props.style;
    Object.assign(elm, props);
    Object.assign(elm.style, style);
    if (children) {
      elm.append(...children);
    }
    return elm;
  }
  h.div = (props, children) => h("div", props, children);
  h.input = (props, children) => h("input", props, children);
  h.button = (props, children) => h("button", props, children);
  h.canvas = (props, children) => h("canvas", props, children);
  function mapRange(value, min1, max1, min2, max2) {
    return (value - min1) / (max1 - min1) * (max2 - min2) + min2;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function px(value) {
    return value + "px";
  }
  function assign(o, props) {
    return Object.assign(o, props);
  }
  function withFn(value, fn) {
    fn(value);
    return value;
  }
  function arraySortBy(arr, fn) {
    return arr.slice().sort((a, b) => {
      const aVal = fn(a);
      const bVal = fn(b);
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
  }
  function first(arr) {
    return arr[0];
  }
  function nullthrows(value) {
    if (value == null) {
      throw new Error("Value is null");
    }
    return value;
  }

  // src/lib/geometry.ts
  var Point = {
    Zero: Object.freeze({ x: 0, y: 0 }),
    add(point1, point2) {
      return {
        x: point1.x + point2.x,
        y: point1.y + point2.y
      };
    },
    subtract(point1, point2) {
      return {
        x: point1.x - point2.x,
        y: point1.y - point2.y
      };
    },
    mul(point, scalar) {
      return {
        x: point.x * scalar,
        y: point.y * scalar
      };
    },
    divide(point, scalar) {
      return {
        x: point.x / scalar,
        y: point.y / scalar
      };
    },
    distance(point1, point2) {
      const x = point2.x - point1.x;
      const y = point2.y - point1.y;
      return Math.sqrt(x * x + y * y);
    },
    magnitude(point) {
      const x = point.x;
      const y = point.y;
      return Math.sqrt(x * x + y * y);
    },
    clone(point) {
      return { x: point.x, y: point.y };
    },
    normalize(point) {
      const magnitude = Point.magnitude(point);
      const x = point.x;
      const y = point.y;
      if (magnitude === 0)
        return Point.clone(Point.Zero);
      return {
        x: x / magnitude,
        y: y / magnitude
      };
    },
    angle(point) {
      const newPoint = Point.normalize(point);
      const { x, y } = newPoint;
      let radians = Math.atan2(y, x);
      return radians;
    }
  };
  var Rect = {
    left(rect) {
      return rect.x;
    },
    right(rect) {
      return rect.x + rect.w;
    },
    top(rect) {
      return rect.y;
    },
    bottom(rect) {
      return rect.y + rect.h;
    },
    topLeft(rect) {
      return { x: Rect.left(rect), y: Rect.top(rect) };
    },
    topCenter(rect) {
      return { x: Rect.centerX(rect), y: Rect.top(rect) };
    },
    topRight(rect) {
      return { x: Rect.right(rect), y: Rect.top(rect) };
    },
    bottomLeft(rect) {
      return { x: Rect.left(rect), y: Rect.bottom(rect) };
    },
    bottomRight(rect) {
      return { x: Rect.right(rect), y: Rect.bottom(rect) };
    },
    points(rect) {
      return [Rect.topLeft(rect), Rect.topRight(rect), Rect.bottomRight(rect), Rect.bottomLeft(rect)];
    },
    fromPoints(points) {
      const x = Math.min(...points.map((p) => p.x));
      const y = Math.min(...points.map((p) => p.y));
      const w = Math.max(...points.map((p) => p.x)) - x;
      const h2 = Math.max(...points.map((p) => p.y)) - y;
      return { x, y, w, h: h2 };
    },
    setTopLeft(rect, value) {
      rect.x = value.x;
      rect.y = value.y;
    },
    centerX(rect) {
      return rect.x + rect.w / 2;
    },
    centerY(rect) {
      return rect.y + rect.h / 2;
    },
    center(rect) {
      return { x: Rect.centerX(rect), y: Rect.centerY(rect) };
    },
    centerRight(rect) {
      return { x: Rect.right(rect), y: Rect.centerY(rect) };
    },
    centerLeft(rect) {
      return { x: Rect.left(rect), y: Rect.centerY(rect) };
    },
    centerTop(rect) {
      return { x: Rect.centerX(rect), y: Rect.top(rect) };
    },
    centerBottom(rect) {
      return { x: Rect.centerX(rect), y: Rect.bottom(rect) };
    },
    setLeft(rect, y) {
      rect.x = y;
    },
    setRight(rect, y) {
      rect.x = y - rect.w;
    },
    setTop(rect, x) {
      rect.y = x;
    },
    setBottom(rect, x) {
      rect.y = x - rect.h;
    },
    setCenter(rect, value) {
      rect.x = value.x - rect.w / 2;
      rect.y = value.y - rect.h / 2;
    },
    intersectsPoint(rect, point) {
      const { x, y } = point;
      return x >= Rect.left(rect) && x <= Rect.right(rect) && y >= Rect.top(rect) && y <= Rect.bottom(rect);
    },
    intersectsRect(rect1, rect2) {
      return Rect.intersectsPoint(rect1, Rect.topLeft(rect2)) || Rect.intersectsPoint(rect1, Rect.topRight(rect2)) || Rect.intersectsPoint(rect1, Rect.bottomLeft(rect2)) || Rect.intersectsPoint(rect1, Rect.bottomRight(rect2));
    },
    intersectsLineAt(rect, lineStart, lineEnd) {
      const points = Rect.points(rect);
      const lines = [
        [points[0], points[1]],
        [points[1], points[2]],
        [points[2], points[3]],
        [points[3], points[0]]
      ];
      const intersections = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const intersect = Line.intersectsLineAt(lineStart, lineEnd, line[0], line[1]);
        if (intersect !== null) {
          intersections.push(intersect);
        }
      }
      if (!intersections.length) {
        return null;
      }
      return intersections;
    },
    intersectsRayAt(rect, rayStart, rayDirection, rayLength) {
      const lineStart = rayStart;
      const lineEnd = Point.add(rayStart, Point.mul(rayDirection, rayLength));
      const points = Rect.intersectsLineAt(rect, lineStart, lineEnd);
      if (points == null) {
        return null;
      }
      return first(arraySortBy(points, (p) => Point.distance(rayStart, p)));
    },
    intersectsRayDistance(rect, rayStart, rayDirection, rayLength) {
      const point = this.intersectsRayAt(rect, rayStart, rayDirection, rayLength);
      if (!point) {
        return null;
      }
      return Point.distance(rayStart, point);
    },
    shrink(rect, amount) {
      return Rect.expand(rect, -amount);
    },
    expand(rect, amount) {
      return {
        x: rect.x - amount,
        y: rect.y - amount,
        w: rect.w + amount * 2,
        h: rect.h + amount * 2
      };
    },
    fromCenter(center, w, h2) {
      return { x: center.x - w / 2, y: center.y - h2 / 2, w, h: h2 };
    }
  };
  var Vector = {
    Zero: { x: 0, y: 0 },
    Left: { x: -1, y: 0 },
    Right: { x: 1, y: 0 },
    Up: { x: 0, y: -1 },
    Down: { x: 0, y: 1 },
    isPointingUpward(vector) {
      return vector.y < 0;
    },
    isPointingRightward(vector) {
      return vector.x > 0;
    },
    isPointingLeftward(vector) {
      return vector.x > 0;
    },
    isPointingDownward(vector) {
      return vector.y > 0;
    },
    fromAngleRadians(radians) {
      return { x: Math.cos(radians), y: Math.sin(radians) };
    },
    fromAngleDegrees(radians) {
      return Vector.fromAngleRadians(toDegrees(radians));
    }
  };
  var Line = {
    intersectsLineAt(line1Start, line1End, line2Start, line2End) {
      const { x: x1, y: y1 } = line1Start;
      const { x: x2, y: y2 } = line1End;
      const { x: x3, y: y3 } = line2Start;
      const { x: x4, y: y4 } = line2End;
      if (x1 === x2 && y1 === y2 || x3 === x4 && y3 === y4) {
        return null;
      }
      const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
      if (denominator === 0) {
        return null;
      }
      let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
      let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return null;
      }
      let x = x1 + ua * (x2 - x1);
      let y = y1 + ua * (y2 - y1);
      return { x, y };
    }
  };
  function toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  // src/bouncy-ball.ts
  window.$debug = {};
  var defaultTerminalVelocity = 1e3;
  var showStepCount = false;
  var styleShadow = {
    // boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
  };
  var _gameObjectNames = /* @__PURE__ */ new Map();
  function generateGameObjectName(baseName) {
    const number = _gameObjectNames.get(baseName) ?? 1;
    _gameObjectNames.set(baseName, number);
    return `${baseName}${number}`;
  }
  function assertUniqueGameObjectName(name) {
    if (_gameObjectNames.has(name)) {
      throw new Error(`GameObject name "${name}" already exists`);
    }
  }
  var GameObject = class {
    rect = { x: 10, y: 10, w: 10, h: 10 };
    v = { x: 0, y: 0 };
    _name;
    constructor(baseName, name) {
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
    step(time) {
    }
    render() {
    }
  };
  var World = class {
    objects = [];
    push(obj) {
      this.objects.push(obj);
      return obj;
    }
    getRayIntersections(rayStart, rayDirection, rayLength) {
      const intersections = [];
      for (const obj of world.objects) {
        const point = Rect.intersectsRayAt(obj.rect, rayStart, rayDirection, rayLength);
        if (point) {
          intersections.push({ obj, point, distance: Point.distance(rayStart, point) });
        }
      }
      intersections.sort((a, b) => a.distance - b.distance);
      return intersections;
    }
  };
  var world = new World();
  var container = nullthrows(document.getElementById("container"));
  function docContainer(element) {
    return container.appendChild(element);
  }
  var Platform = class extends GameObject {
    div;
    color = "white";
    constructor(args) {
      super("Platform", args.name);
      this.div = docContainer(
        h.div({
          style: {
            backgroundColor: this.color,
            display: "inline-block",
            position: "absolute",
            borderRadius: px(4),
            ...styleShadow
          }
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
  };
  var FinalPlatform = class extends Platform {
    finalTriggered = false;
    constructor() {
      super({ name: "FinalPlatform" });
    }
    step(time) {
      const ball = world.objects.find((o) => o instanceof Ball);
      const ballY = ball?.rect.y ?? 0;
      const distance = this.rect.y - ballY;
      if (distance < 500 && ball != null) {
        if (!this.finalTriggered) {
          this.finalTriggered = true;
          setTimeout(() => {
            ball.cameraFollow = false;
            const ballCount = 10;
            const halfBallCount = ballCount / 2;
            const createBall = (x) => {
              world.push(
                withFn(new Ball(), (o) => {
                  o.rect.x = x;
                  o.cameraFollow = false;
                  o.rect.y = this.rect.y - 1200 - lerp(0, 2e3, Math.random());
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
          }, 1e3);
        }
      }
    }
  };
  var InputPlatform = class extends GameObject {
    div;
    isFirstCollision = true;
    input;
    constructor(args) {
      super("InputPlatform", `InputPlatform: ${args.inputLabel}`);
      this.input = h.input({
        style: {
          backgroundColor: "#f3f3f3",
          border: "1px solid #ccc",
          borderRadius: px(4),
          padding: px(8),
          outline: "none",
          color: "#333",
          fontSize: "1.3rem"
        },
        value: "",
        onkeydown: (e) => {
          if (e.code === "Enter") {
            onSubmit(e);
          }
        },
        onfocus: args.onFocusInput
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
          fontSize: "1rem"
          // boxShadow: "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px",
          // boxShadow: "rgba(255, 255, 255, 0.1) 0px 1px 1px 0px inset, rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
          // boxShadow: "rgba(0, 0, 0, 0.5) 0px 10px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px",
          // box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
        }
      });
      const label = h.div(
        {
          style: {
            display: "flex",
            flexDirection: "column",
            rowGap: px(8)
          }
        },
        [
          h.div({
            style: {
              color: "#444",
              fontSize: "1.3rem"
            },
            innerHTML: args.inputLabel
          }),
          this.input,
          button
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
              ...styleShadow
              // backgroundColor: "green",
            }
          },
          [label]
        )
      );
    }
    render() {
      this.div.style.width = px(this.rect.w);
      this.div.style.top = px(this.rect.y);
      this.div.style.left = px(this.rect.x);
    }
    onCollide(gameObject, time) {
      if (this.isFirstCollision) {
        this.isFirstCollision = false;
        this.input.focus();
      }
    }
  };
  function isPlatform(obj) {
    return obj instanceof Platform || obj instanceof InputPlatform;
  }
  var Ball = class extends GameObject {
    gravity = 2e3;
    terminalVelocity = defaultTerminalVelocity;
    static DEFAULT_GRAVITY = 2e3;
    _boundingBoxWidth = 20;
    _boundingBoxHeight = 20;
    _renderHeight = 48;
    _renderOffsetX = 0;
    _renderOffsetY = 0;
    _renderWidth = 48;
    _renderActualHeight = 48;
    _renderActualWidth = 48;
    _ballDiv;
    _ballImageDiv;
    _ballImageContainerDiv;
    _rotation;
    stretch = true;
    // public stretch = false;
    bounce = true;
    // public bounce = false;
    squash = true;
    collision = true;
    useSquashEnergy = true;
    showBallBoundingBox = false;
    showImageContainer = false;
    ballRenderMode = "solid";
    // debug
    // public showBallBoundingBox = true;
    // public showImageContainer = true;
    // public ballRenderMode: "solid" | "outline" = "outline";
    color = "#fad300";
    targets = Array();
    bounceVelocity = -900;
    cameraFollow = true;
    _squashEnergy = 0;
    get renderActualHeight() {
      return this._renderActualHeight;
    }
    constructor(name) {
      super("Ball", name);
      assign(this.rect, { x: 50, y: 50, w: this._boundingBoxWidth, h: this._boundingBoxHeight });
      this._ballDiv = docContainer(
        h("div", {
          style: {
            border: this.showBallBoundingBox && "1px solid blue",
            display: "inline-block",
            position: "absolute"
          }
        })
      );
      const ballOuterRect = { x: 0, y: 0, w: this._renderActualWidth * 2, h: this._renderActualHeight * 2 };
      this._ballImageDiv = h("div", {
        // always centered ball graphic to squash and stretch
        style: {
          width: px(ballOuterRect.w),
          height: px(ballOuterRect.h),
          borderRadius: "50%",
          ...styleShadow
        }
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
              height: px(ballOuterRect.h)
            }
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
    onCollide(gameObject, time) {
      let { rect, v } = this;
      if (this.targets.length > 0) {
        Rect.setBottom(rect, Rect.top(gameObject.rect));
        const target = nullthrows(this.targets.shift());
        this.launchAt(target);
      } else {
        if (this.bounce) {
          if (this._squashEnergy > 0) {
            this._squashEnergy = 0;
          }
          v.y = this.bounceVelocity;
        } else {
          v.y = 0;
        }
        v.x = 0;
        Rect.setBottom(rect, Rect.top(gameObject.rect));
      }
    }
    step(time) {
      let { rect, v } = this;
      let platformInfos = world.getRayIntersections(Rect.center(rect), Vector.Down, this._renderActualHeight / 2).filter((o) => isPlatform(o.obj));
      let isSquashing = this.squash && platformInfos.length > 0;
      if (!isSquashing) {
        v.y += this.gravity * time;
        if (v.y > this.terminalVelocity) {
          v.y = this.terminalVelocity;
        }
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
        const platformInfos2 = world.getRayIntersections(Rect.center(rect), Vector.Down, length).filter((o) => o.obj !== this);
        if (platformInfos2.length && v.y < 0) {
          const intersection = platformInfos2[0];
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
        const platform = world.objects.find((o) => isPlatform(o) && Rect.intersectsRect(o.rect, rect));
        if (platform) {
          this.onCollide(platform, time);
          if (platform instanceof InputPlatform) {
            platform.onCollide(this, time);
          }
        }
      }
      if (this.cameraFollow) {
        if (rect.y - window.scrollY > window.innerHeight / 2) {
          window.scrollTo(0, rect.y - window.innerHeight / 2);
        }
      }
    }
    launchAt(target) {
      const isBelowY = (below, above) => below > above;
      if (!isBelowY(target.y, this.rect.y)) {
        throw new Error("target above ball not implemented yet");
      }
      const calcTimeToTargetY = (startY, gravity, initialForce2, terminalVelocity, targetY) => {
        if (!isBelowY(targetY, startY)) {
          throw new Error("This only works with targets below the startY.");
        }
        let vy = initialForce2;
        const time = 1 / 60;
        let y = startY;
        let totalTime = 0;
        let loopCount = 0;
        while (!isBelowY(y, targetY)) {
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
  };
  async function main() {
    let platform1;
    let platform2;
    let platform3;
    let platform4;
    let platform5;
    const leftSide = 50;
    const rightSide = 550;
    const spaceBetweenInputs = 1e3;
    const platformTopRight = (platform) => Point.subtract(Rect.topRight(platform.rect), { x: 10, y: 0 });
    const activateBall = () => {
      ball.bounce = true;
      ball.gravity = Ball.DEFAULT_GRAVITY;
      ball.v.y = 900;
    };
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0));
    const hurryBall = () => {
      if (Vector.isPointingUpward(ball.v) || ball.v.y < 800)
        ball.v.y = 800;
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
          }
        }),
        { rect: { x: leftSide, y: 450, w: 300, h: 25 } }
      )
    );
    const finalPlatform = world.push(assign(new FinalPlatform(), { rect: { x: 0, y: 8e3 - 50, w: 1e3, h: 50 } }));
    world.push(assign(new Platform({ name: "Padding" }), { rect: { x: 0, y: Rect.bottom(finalPlatform.rect), w: 1e3, h: 40 }, color: "transparent" }));
    platform2 = world.push(
      assign(
        new InputPlatform({
          inputLabel: "vim or emacs?",
          buttonLabel: "Next",
          onSubmit: () => {
            hurryBall();
            ball.targets.push(Rect.topLeft(platform2.rect));
            ball.targets.push(Rect.topCenter(platform3.rect));
          }
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
          }
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
          }
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
          }
        }),
        { rect: { x: leftSide, y: platform4.rect.y + spaceBetweenInputs, w: 300, h: 25 } }
      )
    );
    const ball = world.push(
      withFn(new Ball("Main Ball"), (o) => {
        o.bounce = false;
        o.gravity = 0;
        o.rect.y = platform1.rect.y - 35;
        o.rect.x = platform1.rect.x + o.rect.w;
        const test = null;
        switch (test) {
          case "initial-bounce":
            o.rect.y = platform1.rect.y - 300;
            o.bounce = true;
            o.gravity = Ball.DEFAULT_GRAVITY;
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
    const stepCountDiv = docContainer(h.div({ style: { display: showStepCount ? "block" : "none", position: "absolute", top: px(0), right: px(5), color: "white" } }));
    let stepCount = 0;
    const render = () => {
      world.objects.forEach((obj) => obj.render());
      stepCountDiv.innerText = stepCount.toString();
    };
    const step = (time) => {
      world.objects.forEach((obj) => obj.step(time));
    };
    const targetFps = 100;
    let state = "playing";
    const stepFrame = (count = 1) => {
      for (let i = 0; i < count; i++) {
        step(1 / targetFps);
        stepCount++;
      }
    };
    window.addEventListener("keydown", (e) => {
      if (!(e.altKey && e.ctrlKey))
        return;
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
    render();
    setInterval(() => {
      if (state !== "playing")
        return;
      stepFrame();
      render();
    }, 1e3 / targetFps);
  }
  main();
})();
//# sourceMappingURL=bouncy-ball.js.map
