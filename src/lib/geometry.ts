import { arraySortBy, first } from "./util";

export type Rect = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };
export type Vector = Point;

export const Point = {
  Zero: Object.freeze({ x: 0, y: 0 }),
  add(point1: Point, point2: Point) {
    return {
      x: point1.x + point2.x,
      y: point1.y + point2.y,
    };
  },
  subtract(point1: Point, point2: Point) {
    return {
      x: point1.x - point2.x,
      y: point1.y - point2.y,
    };
  },
  mul(point: Point, scalar: number) {
    return {
      x: point.x * scalar,
      y: point.y * scalar,
    };
  },
  divide(point: Point, scalar: number) {
    return {
      x: point.x / scalar,
      y: point.y / scalar,
    };
  },
  distance(point1: Point, point2: Point) {
    const x = point2.x - point1.x;
    const y = point2.y - point1.y;
    return Math.sqrt(x * x + y * y);
  },
  magnitude(point: Point) {
    const x = point.x;
    const y = point.y;
    return Math.sqrt(x * x + y * y);
  },
  clone(point: Point) {
    return { x: point.x, y: point.y };
  },
  normalize(point: Point) {
    const magnitude = Point.magnitude(point);
    const x = point.x;
    const y = point.y;

    if (magnitude === 0) return Point.clone(Point.Zero);

    return {
      x: x / magnitude,
      y: y / magnitude,
    };
  },
  angle(point: Point) {
    const newPoint = Point.normalize(point);
    const { x, y } = newPoint;
    let radians = Math.atan2(y, x);
    return radians;
  },
};

export const Rect = {
  left(rect: Rect) {
    return rect.x;
  },
  right(rect: Rect) {
    return rect.x + rect.w;
  },
  top(rect: Rect) {
    return rect.y;
  },
  bottom(rect: Rect) {
    return rect.y + rect.h;
  },
  topLeft(rect: Rect) {
    return { x: Rect.left(rect), y: Rect.top(rect) };
  },
  topCenter(rect: Rect) {
    return { x: Rect.centerX(rect), y: Rect.top(rect) };
  },
  topRight(rect: Rect) {
    return { x: Rect.right(rect), y: Rect.top(rect) };
  },
  bottomLeft(rect: Rect) {
    return { x: Rect.left(rect), y: Rect.bottom(rect) };
  },
  bottomRight(rect: Rect) {
    return { x: Rect.right(rect), y: Rect.bottom(rect) };
  },
  points(rect: Rect) {
    return [Rect.topLeft(rect), Rect.topRight(rect), Rect.bottomRight(rect), Rect.bottomLeft(rect)];
  },
  fromPoints(points: Point[]) {
    const x = Math.min(...points.map((p) => p.x));
    const y = Math.min(...points.map((p) => p.y));
    const w = Math.max(...points.map((p) => p.x)) - x;
    const h = Math.max(...points.map((p) => p.y)) - y;
    return { x, y, w, h };
  },
  setTopLeft(rect: Rect, value: Point) {
    rect.x = value.x;
    rect.y = value.y;
  },
  centerX(rect: Rect) {
    return rect.x + rect.w / 2;
  },
  centerY(rect: Rect) {
    return rect.y + rect.h / 2;
  },
  center(rect: Rect) {
    return { x: Rect.centerX(rect), y: Rect.centerY(rect) };
  },
  centerRight(rect: Rect) {
    return { x: Rect.right(rect), y: Rect.centerY(rect) };
  },
  centerLeft(rect: Rect) {
    return { x: Rect.left(rect), y: Rect.centerY(rect) };
  },
  centerTop(rect: Rect) {
    return { x: Rect.centerX(rect), y: Rect.top(rect) };
  },
  centerBottom(rect: Rect) {
    return { x: Rect.centerX(rect), y: Rect.bottom(rect) };
  },
  setLeft(rect: Rect, y: number) {
    rect.x = y;
  },
  setRight(rect: Rect, y: number) {
    rect.x = y - rect.w;
  },
  setTop(rect: Rect, x: number) {
    rect.y = x;
  },
  setBottom(rect: Rect, x: number) {
    rect.y = x - rect.h;
  },
  setCenter(rect: Rect, value: { x: number; y: number }) {
    rect.x = value.x - rect.w / 2;
    rect.y = value.y - rect.h / 2;
  },
  intersectsPoint(rect: Rect, point: Point) {
    const { x, y } = point;
    return x >= Rect.left(rect) && x <= Rect.right(rect) && y >= Rect.top(rect) && y <= Rect.bottom(rect);
  },
  intersectsRect(rect1: Rect, rect2: Rect) {
    return Rect.intersectsPoint(rect1, Rect.topLeft(rect2)) || Rect.intersectsPoint(rect1, Rect.topRight(rect2)) || Rect.intersectsPoint(rect1, Rect.bottomLeft(rect2)) || Rect.intersectsPoint(rect1, Rect.bottomRight(rect2));
  },
  intersectsLineAt(rect: Rect, lineStart: Point, lineEnd: Point) {
    const points = Rect.points(rect);
    const lines = [
      [points[0], points[1]],
      [points[1], points[2]],
      [points[2], points[3]],
      [points[3], points[0]],
    ];

    const intersections: Array<Point> = [];

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
  intersectsRayAt(rect: Rect, rayStart: Point, rayDirection: Vector, rayLength: number) {
    const lineStart = rayStart;
    const lineEnd = Point.add(rayStart, Point.mul(rayDirection, rayLength));
    const points = Rect.intersectsLineAt(rect, lineStart, lineEnd);
    if (points == null) {
      return null;
    }
    // sort points by distance
    return first(arraySortBy(points, (p) => Point.distance(rayStart, p)));
  },
  intersectsRayDistance(rect: Rect, rayStart: Point, rayDirection: Vector, rayLength: number): number | null {
    const point = this.intersectsRayAt(rect, rayStart, rayDirection, rayLength);

    if (!point) {
      return null;
    }

    return Point.distance(rayStart, point);
  },
  shrink(rect: Rect, amount: number) {
    return Rect.expand(rect, -amount);
  },
  expand(rect: Rect, amount: number) {
    return {
      x: rect.x - amount,
      y: rect.y - amount,
      w: rect.w + amount * 2,
      h: rect.h + amount * 2,
    };
  },
  fromCenter(center: Point, w: number, h: number) {
    return { x: center.x - w / 2, y: center.y - h / 2, w, h };
  },
};

export const Vector = {
  Zero: { x: 0, y: 0 },
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
  Up: { x: 0, y: -1 },
  Down: { x: 0, y: 1 },
  isPointingUpward(vector: Vector) {
    return vector.y < 0;
  },
  isPointingRightward(vector: Vector) {
    return vector.x > 0;
  },
  isPointingLeftward(vector: Vector) {
    return vector.x > 0;
  },
  isPointingDownward(vector: Vector) {
    return vector.y > 0;
  },
  fromAngleRadians(radians: number) {
    return { x: Math.cos(radians), y: Math.sin(radians) };
  },
  fromAngleDegrees(radians: number) {
    return Vector.fromAngleRadians(toDegrees(radians));
  },
};

export const Line = {
  intersectsLineAt(line1Start: Point, line1End: Point, line2Start: Point, line2End: Point): Point | null {
    // return intersection;
    const { x: x1, y: y1 } = line1Start;
    const { x: x2, y: y2 } = line1End;
    const { x: x3, y: y3 } = line2Start;
    const { x: x4, y: y4 } = line2End;

    // Check if none of the lines are of length 0
    if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
      return null;
    }

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    // Lines are parallel
    if (denominator === 0) {
      return null;
    }

    let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // is the intersection along the segments
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
      return null;
    }

    // Return a object with the x and y coordinates of the intersection
    let x = x1 + ua * (x2 - x1);
    let y = y1 + ua * (y2 - y1);

    return { x, y };
  },
};

export function toDegrees(radians: number) {
  return radians * (180 / Math.PI);
}
