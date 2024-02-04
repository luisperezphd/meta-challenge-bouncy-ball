export function h<T extends HTMLElement>(tagName: string, props: { [key: string]: any }, children?: Array<HTMLElement>): T {
  const elm = document.createElement(tagName);
  const { style } = props;
  delete props.style;
  Object.assign(elm, props);
  Object.assign(elm.style, style);
  if (children) {
    elm.append(...children);
  }
  return elm as T;
}

h.div = (props: { [key: string]: any }, children?: Array<HTMLElement>) => h<HTMLDivElement>("div", props, children);
h.input = (props: { [key: string]: any }, children?: Array<HTMLElement>) => h<HTMLInputElement>("input", props, children);
h.button = (props: { [key: string]: any }, children?: Array<HTMLElement>) => h<HTMLButtonElement>("button", props, children);
h.canvas = (props: { [key: string]: any }, children?: Array<HTMLElement>) => h<HTMLCanvasElement>("canvas", props, children);

export function docAppend<T extends HTMLElement>(elm: T): T {
  document.body.appendChild(elm);
  return elm;
}

export function mapRange(value, min1, max1, min2, max2) {
  return ((value - min1) / (max1 - min1)) * (max2 - min2) + min2;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function px(value) {
  return value + "px";
}

export function assign<T>(o: T, props: Partial<T>): T {
  // @ts-ignore
  return Object.assign(o, props);
}

export function calculateMagnitudeFromVector(vector) {
  const x = vector[0];
  const y = vector[1];
  return Math.sqrt(x * x + y * y);
}

export function calcualteNormalizedVector(vector) {
  const magnitude = calculateMagnitudeFromVector(vector);
  const x = vector[0];
  const y = vector[1];
  return [x / magnitude, y / magnitude];
}

export function calculateAngleFromVector(vector) {
  const newVector = calcualteNormalizedVector(vector);
  const x = newVector[0];
  const y = newVector[1];

  // Calculate the angle in radians
  let angleRadians = Math.atan2(y, x);

  // Optionally, convert to degrees
  let angleDegrees = angleRadians * (180 / Math.PI);

  return {
    radians: angleRadians,
    degrees: angleDegrees,
  };
}

// export function with<T>(value:T, fn: (value:T) => void) : void{
//   fn(value);
// }

export function withFn<T>(value: T, fn: (value: T) => void): T {
  fn(value);
  return value;
}

export function arraySortBy<T>(arr: Array<T>, fn: (value: T) => any): Array<T> {
  return arr.slice().sort((a, b) => {
    const aVal = fn(a);
    const bVal = fn(b);
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
  });
}

export function first<T>(arr: Array<T>): T {
  return arr[0];
}

export function pipe<A, B>(o: A, fn: (o: A) => B): B;
export function pipe<A, B, C>(o: A, fn: (o: A) => B, fn2: (o: B) => C): C;
export function pipe<A, B, C, D>(o: A, fn: (o: A) => B, fn2: (o: B) => C, fn3: (o: C) => D): D;
export function pipe<A, B, C, D, E>(o: A, fn: (o: A) => B, fn2: (o: B) => C, fn3: (o: C) => D, fn4: (o: D) => E): E;
export function pipe(value: any, ...fns: Array<(value: any) => any>): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

export function nullthrows<T>(value: T | null | undefined): T {
  if (value == null) {
    throw new Error("Value is null");
  }

  return value;
}
