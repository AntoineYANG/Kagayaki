import Color from "./preference/Color";

/*
 * @Author: Antoine YANG 
 * @Date: 2019-11-19 09:22:10 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-11-21 00:04:42
 */

export interface CanvasProps {
    width: number;
    height: number;
}

export interface Graph {}

export interface $Line extends Graph {
    source: Position;
    target: Position;
    style: LineStyle;
}

export interface LineStyle {
    color: string;
    width: number;
}

export interface $Polygon extends Graph {
    points: Array<Position>;
    style: PolygonStyle;
}

export interface PolygonStyle {
    color: string;
    opacity: number;
    line?: LineStyle;
    extra?: "none" | {
        floating?: number;
        blink?: number;
    };
}

export interface $Polygon extends Graph {
    points: Array<Position>;
    style: PolygonStyle;
}

export interface CubeStyle {
    color: string;
    opacity: number;
    line?: LineStyle;
}

export class $Cube implements Graph {
    public readonly top: $Polygon;
    public readonly bottom: $Polygon;
    public readonly front: $Polygon;
    public readonly back: $Polygon;
    public readonly left: $Polygon;
    public readonly right: $Polygon;

    public constructor(surface: $Polygon) {
        this.top = surface;
        this.bottom = {
            style: {
                color: Color.setLightness(surface.style.color, Color.toHsl(surface.style.color).l * 0.2),
                opacity: surface.style.opacity,
                line: surface.style.line
            }, points: [
                { ...surface.points[0], z: 0 },
                { ...surface.points[1], z: 0 },
                { ...surface.points[2], z: 0 },
                { ...surface.points[3], z: 0 }
            ]
        };
        this.left = {
            style: {
                color: Color.setLightness(surface.style.color, Color.toHsl(surface.style.color).l * 0.7),
                opacity: surface.style.opacity,
                line: surface.style.line
            }, points: [
                { ...surface.points[0], z: 0 },
                { ...surface.points[0] },
                { ...surface.points[1] },
                { ...surface.points[1], z: 0 }
            ]
        };
        this.back = {
            style: {
                color: Color.setLightness(surface.style.color, Color.toHsl(surface.style.color).l * 0.4),
                opacity: surface.style.opacity,
                line: surface.style.line
            }, points: [
                { ...surface.points[1], z: 0 },
                { ...surface.points[1] },
                { ...surface.points[2] },
                { ...surface.points[2], z: 0 }
            ]
        };
        this.right = {
            style: {
                color: Color.setLightness(surface.style.color, Color.toHsl(surface.style.color).l * 0.6),
                opacity: surface.style.opacity,
                line: surface.style.line
            }, points: [
                { ...surface.points[2], z: 0 },
                { ...surface.points[2] },
                { ...surface.points[3] },
                { ...surface.points[3], z: 0 }
            ]
        };
        this.front = {
            style: {
                color: Color.setLightness(surface.style.color, Color.toHsl(surface.style.color).l * 0.5),
                opacity: surface.style.opacity,
                line: surface.style.line
            }, points: [
                { ...surface.points[3], z: 0 },
                { ...surface.points[3] },
                { ...surface.points[0] },
                { ...surface.points[0], z: 0 }
            ]
        };
    }
}

export interface Map {
    ground: Array<$Polygon>;
    cubes: Array<$Cube>;
    beginPoint: Position;
}

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface Projection {
    x: number;
    y: number;
}

