/*
 * @Author: Antoine YANG 
 * @Date: 2019-11-19 09:05:27 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-11-21 13:12:24
 */

import React, { Component } from 'react';
import { Position, $Line, Graph, CanvasProps, Projection, $Polygon, Map, $Cube } from './TypeLib';
import $ from 'jquery';
import Color from './preference/Color';
import Base from './map/Base';
// import TestMap from './map/TestMap';


class Canvas extends Component<CanvasProps, {}, {}> {
    private Camera: Position;
    private readonly cameraAngleHorizontal: number = Math.PI * 2 / 3;
    private readonly cameraAngleVertical: number = Math.PI / 2;
    private Header: {
        horizontal: number;
        vertical: number;
    };
    private positionChanged: boolean = true;
    private moving = {
        front: false,
        left: false,
        right: false,
        back: false,
        jumping: false
    };
    private turning = {
        left: false,
        right: false,
        up: false,
        down: false
    };
    private myHeight: number = 2;
    private mySpeed: number = 14;
    private fall: number = 0;
    private sheets: number = 60;
    private Background: HTMLCanvasElement | null;
    private ctx_Background: CanvasRenderingContext2D | null;
    private graphs_Background: Array<Graph>;
    private floors: Array<$Polygon>;
    private timer: NodeJS.Timeout;

    public constructor(props: CanvasProps) {
        super(props);
        this.Camera = {
            x: 5 + 1e-3, y: 2 + 1e-3, z: 0
        };
        this.Header = {
            horizontal: 0,
            vertical: 0
        };
        this.Background = null;
        this.ctx_Background = null;
        this.graphs_Background = [];
        this.floors = [];

        this.timer = setInterval(() => {
            this.tick();
        }, 1000 / this.sheets);
    }

    public render(): JSX.Element {
        return (
            <>
                <div key="info"
                style={{
                    position: "absolute",
                    left: 6,
                    top: 6,
                    border: "1px solid white",
                    color: 'white'
                }} >
                    <p key="x">x: <span id="_x">-</span></p>
                    <p key="y">y: <span id="_y">-</span></p>
                    <p key="height">height: <span id="_z">-</span></p>
                </div>
                <canvas key="Canvas_Background" id="BackgroundLayer" ref="BackgroundLayer"
                width={ `${ this.props.width }px` } height={ `${ this.props.height }px` }
                style={{
                    background: Color.Nippon.Kati
                }} />
            </>
        );
    }

    public componentDidMount(): void {
        this.Background = document.getElementById("BackgroundLayer") as HTMLCanvasElement;
        this.ctx_Background = this.Background!.getContext('2d');
        this.draw();
        this.loadMap(Base);
        this.onGameStart();
    }

    public componentDidUpdate(): void {}

    public componentWillUnmount(): void {
        clearInterval(this.timer);
    }

    private onGameStart(): void {
        $('*').keydown((e: JQuery.KeyDownEvent<HTMLElement, null, HTMLElement, HTMLElement>) => {
            if (this.moving.jumping) {
                if (this.fall >= 3) {
                    return;
                }
            }
            if (e.which === 87) {
                // W
                this.moving.front = true;
            }
            if (e.which === 83) {
                // S
                this.moving.back = true;
            }
            if (e.which === 65) {
                // A
                this.moving.left = true;
            }
            if (e.which === 68) {
                // D
                this.moving.right = true;
            }
            // if (e.which === 38) {
            //     // up
            //     this.turning.up = true;
            // }
            if (e.which === 37) {
                // left
                this.turning.left = true;
            }
            // if (e.which === 40) {
            //     // down
            //     this.turning.down = true;
            // }
            if (e.which === 39) {
                // right
                this.turning.right = true;
            }
        })
        .keyup((e: JQuery.KeyUpEvent<HTMLElement, null, HTMLElement, HTMLElement>) => {
            if (e.which === 87) {
                // W
                this.moving.front = false;
            }
            if (e.which === 83) {
                // S
                this.moving.back = false;
            }
            if (e.which === 65) {
                // A
                this.moving.left = false;
            }
            if (e.which === 68) {
                // D
                this.moving.right = false;
            }
            // if (e.which === 38) {
            //     // up
            //     this.turning.up = false;
            // }
            if (e.which === 37) {
                // left
                this.turning.left = false;
            }
            // if (e.which === 40) {
            //     // down
            //     this.turning.down = false;
            // }
            if (e.which === 39) {
                // right
                this.turning.right = false;
            }
        })
        .keypress((e: JQuery.KeyPressEvent<HTMLElement, null, HTMLElement, HTMLElement>) => {
            if (this.moving.jumping) {
                if (this.fall < 2.4 || this.fall > 3.6) {
                    return;
                }
            }
            if (e.which === 32) {
                // space
                this.moving.jumping = true;
                for (let i: number = 0; i < 30; i ++) {
                    setTimeout(() => {
                        if (this.moving.jumping) {
                            this.Camera.z += 0.1;
                            this.positionChanged = true;
                        }
                    }, i * 10);
                }
            }
        });
    }

    private loadMap(map: Map): void {
        let floor: Array<$Polygon> = [];
        this.graphs_Background = [ ...map.cubes, ...map.ground ];
        map.cubes.forEach((cube: $Cube) => {
            floor.push(cube.top);
        });
        this.floors = [ ...floor ];
        this.Camera = { ...map.beginPoint };
    }

    private tick(): void {
        if (this.turning.up) {
            this.Header.vertical += 0.02;
            this.positionChanged = true;
        }
        if (this.turning.down) {
            this.Header.vertical -= 0.02;
            this.positionChanged = true;
        }
        if (this.Header.vertical > Math.PI * 4 / 5) {
            this.Header.vertical = Math.PI * 4 / 5;
            this.positionChanged = true;
        }
        else if (this.Header.vertical < Math.PI * 2 / 3) {
            this.Header.vertical = Math.PI * 2 / 3;
            this.positionChanged = true;
        }
        if (this.turning.left) {
            this.Header.horizontal -= 0.02;
            this.positionChanged = true;
        }
        if (this.turning.right) {
            this.Header.horizontal += 0.02;
            this.positionChanged = true;
        }
        const up: number = this.checkFloating(this.Camera);
        if (up > 0) {
            this.fall += 19.6 / this.sheets;
            this.Camera.z -= this.fall / this.sheets;
            this.moving.jumping = true;
            this.positionChanged = true;
        }
        else if (up < 0) {
            this.Camera.z -= up * (up >= -0.1 ? 1 : 0.5);
            this.fall = 0;
            this.moving.jumping = false;
            this.positionChanged = true;
        }
        let step: number = this.mySpeed / this.sheets;
        let pos: Position = { ...this.Camera };
        if (((this.moving.front && !this.moving.back) || (!this.moving.front && this.moving.back))
        && ((this.moving.left && !this.moving.right) || (!this.moving.left && this.moving.right))) {
            step /= 2;
        }
        if (this.moving.jumping) {
            step /= 2;
        }
        if (this.moving.front) {
            pos.y += step * Math.cos(this.Header.horizontal);
            pos.x += step * Math.sin(this.Header.horizontal);
            this.positionChanged = true;
        }
        if (this.moving.left) {
            pos.x -= step * Math.cos(this.Header.horizontal);
            pos.y += step * Math.sin(this.Header.horizontal);
            this.positionChanged = true;
        }
        if (this.moving.back) {
            pos.y -= step / Math.sqrt(2) * Math.cos(this.Header.horizontal);
            pos.x -= step / Math.sqrt(2) * Math.sin(this.Header.horizontal);
            this.positionChanged = true;
        }
        if (this.moving.right) {
            pos.x += step * Math.cos(this.Header.horizontal);
            pos.y -= step * Math.sin(this.Header.horizontal);
            this.positionChanged = true;
        }
        if (this.checkGround(pos)) {
            this.Camera = { ...pos };
        }
        this.draw();
    }

    private checkGround(pos: Position): boolean {
        const height: number = this.checkFloating(pos);

        return height >= -1 && height !== Infinity;
    }

    private checkFloating(pos: Position): number {
        for (let i: number = 0; i < this.floors.length; i++) {
            const piece: $Polygon = this.floors[i];
            if (piece.points && piece.points.length === 4) {
                if (piece.points[0].x > pos.x && piece.points[2].x > pos.x) {
                    continue;
                }
                if (piece.points[0].x < pos.x && piece.points[2].x < pos.x) {
                    continue;
                }
                if (piece.points[0].y > pos.y && piece.points[2].y > pos.y) {
                    continue;
                }
                if (piece.points[0].y < pos.y && piece.points[2].y < pos.y) {
                    continue;
                }
                return pos.z - piece.points[0].z;
            }
        }

        return Infinity;
    }

    private draw(): void {
        this.updateBackground();
    }

    private paint(graph: Graph): void {
        if ((graph as $Line).source) {
            const line: $Line = graph as $Line;
            const p1: Projection = this.project(line.source);
            const p2: Projection = this.project(line.target);
            if (this.isLineOut(p1, p2)) {
                return;
            }
            this.ctx_Background!.strokeStyle = line.style.color;
            this.ctx_Background!.beginPath();
            this.ctx_Background!.moveTo(p1.x * this.props.width, p1.y * this.props.height);
            this.ctx_Background!.lineTo(p2.x * this.props.width, p2.y * this.props.height);
            this.ctx_Background!.lineWidth = (graph as $Line).style.width;
            this.ctx_Background!.stroke();
        }
        else if ((graph as $Polygon).points) {
            const polygon: $Polygon = graph as $Polygon;
            if (polygon.points.length <= 2) {
                return;
            }
            let points: Array<Projection> = [];
            let float: number = 0;
            if (polygon.style.extra && polygon.style.extra !== "none" && polygon.style.extra.floating) {
                float = polygon.style.extra.floating * Math.sin((new Date()).getMilliseconds() + 1000 * Math.random());
            }
            polygon.points.forEach((value: Position) => {
                points.push(this.project({
                    ...value,
                    z: value.z + float
                }));
            });
            if (this.isRectOut(polygon, points)) {
                return;
            }
            this.ctx_Background!.globalAlpha = polygon.style.opacity;
            this.ctx_Background!.fillStyle = polygon.style.color;
            if (polygon.style.extra && polygon.style.extra !== "none" && polygon.style.extra.blink) {
                let l: number = Color.toHsl(polygon.style.color).l;
                let dis: number = polygon.style.extra.blink * Math.sin((new Date()).getMilliseconds() + 1000 * Math.random());
                l = dis === 0 ? l
                    : dis < 0 ? l * (1 - dis)
                        : l + (1 - l) * dis
                this.ctx_Background!.fillStyle = Color.setLightness(polygon.style.color, l);
            }
            else {
                this.ctx_Background!.fillStyle = polygon.style.color;
            }
            if (polygon.style.line) {
                this.ctx_Background!.strokeStyle = polygon.style.line.color;
                this.ctx_Background!.lineWidth = polygon.style.line.width;
            }
            this.ctx_Background!.beginPath();
            this.ctx_Background!.moveTo(points[0].x * this.props.width, points[0].y * this.props.height);
            for (let i: number = 1; i < points.length; i++) {
                this.ctx_Background!.lineTo(points[i].x * this.props.width, points[i].y * this.props.height);
            }
            this.ctx_Background!.closePath();
            this.ctx_Background!.fill();
            if (polygon.style.line) {
                this.ctx_Background!.stroke();
            }
        }
        else if ((graph as $Cube).top) {
            const cube: $Cube = graph as $Cube;
            let polygons: Array<$Polygon> = [];
            if (this.Camera.z + this.myHeight > cube.top.points[0].z) {
                polygons.push(cube.top);
            }
            else if (this.Camera.z + this.myHeight < cube.bottom.points[0].z) {
                polygons.push(cube.bottom);
            }
            if (this.Camera.x > cube.right.points[0].x) {
                polygons.push(cube.right);
            }
            else if (this.Camera.x < cube.left.points[0].x) {
                polygons.push(cube.left);
            }
            if (this.Camera.y > cube.back.points[0].y) {
                polygons.push(cube.back);
            }
            else if (this.Camera.y < cube.front.points[0].y) {
                polygons.push(cube.front);
            }
            polygons.forEach((polygon: $Polygon) => {
                this.paint(polygon);
            });
        }
    }

    private updateBackground(): void {
        if (!this.ctx_Background || !this.positionChanged) {
            return;
        }

        $('#_x').text(Math.round(this.Camera.x * 10) / 10);
        $('#_y').text(Math.round(this.Camera.y * 10) / 10);
        $('#_z').text(Math.round(this.Camera.z * 10) / 10);

        this.ctx_Background!.clearRect(0, 0, this.props.width, this.props.height);
        let box: Array<Graph> = this.graphs_Background.sort((a: Graph, b: Graph) => {
            let za: number = 0;
            let zb: number = 0;
            if ((a as $Cube).top && (b as $Cube).top) {
                za = Math.sqrt(
                        Math.pow(this.Camera.x - ((a as $Cube).top.points[0].x + (a as $Cube).top.points[2].x) / 2, 2)
                        + Math.pow(this.Camera.y - ((a as $Cube).top.points[0].y + (a as $Cube).top.points[2].y) / 2, 2)
                    );
                zb = Math.sqrt(
                        Math.pow(this.Camera.x - ((b as $Cube).top.points[0].x + (b as $Cube).top.points[2].x) / 2, 2)
                        + Math.pow(this.Camera.y - ((b as $Cube).top.points[0].y + (b as $Cube).top.points[2].y) / 2, 2)
                    );
            }
            if ((a as $Polygon).points && (b as $Polygon).points) {
                za = Math.min(...(a as $Polygon).points.map((pos: Position) => {
                    return Math.sqrt(
                        Math.pow(this.Camera.x - pos.x, 2)
                        + Math.pow(this.Camera.y - pos.y, 2)
                        + Math.pow(this.Camera.z + this.myHeight - pos.z, 2)
                    );
                }));
                zb = Math.min(...(b as $Polygon).points.map((pos: Position) => {
                    return Math.sqrt(
                        Math.pow(this.Camera.x - pos.x, 2)
                        + Math.pow(this.Camera.y - pos.y, 2)
                        + Math.pow(this.Camera.z + this.myHeight - pos.z, 2)
                    );
                }));
                if (Math.abs(za - zb) < 1e-2) {
                    if ((a as $Polygon).points) {
                        za = Math.max(...(a as $Polygon).points.map((pos: Position) => {
                            return Math.abs(this.Camera.z - pos.z);
                        }));
                    }
                    if ((b as $Polygon).points) {
                        zb = Math.max(...(b as $Polygon).points.map((pos: Position) => {
                            return Math.abs(this.Camera.z - pos.z);
                        }));
                    }
                }
            }
            return zb - za;
        });
        let newBox: Array<Graph> = [];
        box.forEach((graph: Graph) => {
            if ((graph as $Line).source) {
                this.paint(graph);
            }
            else {
                newBox.push(graph);
            }
        });
        box = [];
        newBox.forEach((graph: Graph) => {
            if ((graph as $Polygon).points) {
                this.paint(graph);
            }
            else {
                box.push(graph);
            }
        });
        box.forEach((graph: Graph) => {
            if ((graph as $Cube).top) {
                this.paint(graph);
            }
        });
        this.positionChanged = false;
    }

    private project(point: Position): Projection {
        const dis: number = Math.sqrt(Math.pow(point.x - this.Camera.x, 2) + Math.pow(point.y - this.Camera.y, 2));
        const sin: number = (point.y - this.Camera.y) / dis;
        const cos: number = (point.x - this.Camera.x) / dis;
        // const angle: number = sin >= 0
        //     ? - Math.acos(cos) + this.Header.horizontal
        //     : Math.acos(cos) + this.Header.horizontal;
        const angle: number = sin >= 0 && cos >= 0
            ? Math.PI / 2 - Math.acos(cos)// + this.Header.horizontal
            : sin < 0 && cos >= 0
                ? Math.acos(cos) + Math.PI / 2
                : sin <= 0 && cos < 0
                    ? Math.acos(cos) + Math.PI / 2
                    : Math.PI * 5 / 2 - Math.acos(cos);
        // let r: number = angle + this.Header.horizontal;
        let r: number = Math.PI / 2 - angle + this.Header.horizontal;
        while (r >= Math.PI * 2) {
            r -= Math.PI * 2;
        }
        while (r < 0) {
            r += Math.PI * 2;
        }
        const source: Position = {
            x: dis * Math.cos(r),
            y: dis * Math.sin(r),
            z: point.z - this.Camera.z - this.myHeight
        };
        let p1: number = this.cameraAngleHorizontal / 2;
        let p2: number = Math.PI * 2 - this.cameraAngleHorizontal / 2;
        while (p1 >= Math.PI * 2) {
            p1 -= Math.PI * 2;
        }
        while (p1 < 0) {
            p1 += Math.PI * 2;
        }
        while (p2 >= Math.PI * 2) {
            p2 -= Math.PI * 2;
        }
        while (p2 < 0) {
            p2 += Math.PI * 2;
        }

        return {
            x: source.y >= 0//r >= Math.PI * 3 / 2 || r <= Math.PI / 2
                ? 0.5 + source.x / Math.tan(this.cameraAngleHorizontal / 2) / source.y / 2
                : 0.5 - source.x * Math.tan(this.cameraAngleHorizontal / 2 - Math.PI / 2) * (1 - source.y) / 2,
            y: source.y >= 0//r >= Math.PI * 3 / 2 || r <= Math.PI / 2
                ? 0.5 - source.z / Math.tan(this.cameraAngleVertical / 2) / source.y / 2
                : 0.5 + source.z * Math.tan(this.cameraAngleVertical / 2 - Math.PI / 2) * (1 - source.y) / 2
        };
        // return {
        //     x: source.y >= 0
        //         ? 0.5 + source.x / Math.tan(this.cameraAngleHorizontal / 2) / source.y / 2
        //         : 0.5 - (source.x * Math.tan(this.cameraAngleHorizontal / 2 - Math.PI / 2) * (1 - source.y) / 2),
        //     y: source.y >= 0
        //         ? 0.5 - source.z / Math.tan(this.cameraAngleVertical / 2) / source.y / 2
        //         : 0.5 + source.z * Math.tan(this.cameraAngleVertical / 2 - Math.PI / 2) * (1 - source.y) / 2
        // };
    }

    private isRectOut(rect: $Polygon, points: Array<Projection>): boolean {
        let count: number = 0;
        let distance: number = Infinity;
        for (let i: number = 0; i < rect.points.length; i++) {
            const point: Projection = rect.points[i];
            const dis: number = Math.sqrt(Math.pow(point.x - this.Camera.x, 2) + Math.pow(point.y - this.Camera.y, 2));
            if (dis < distance) {
                distance = dis;
            }
            const sin: number = (point.y - this.Camera.y) / dis;
            const cos: number = (point.x - this.Camera.x) / dis;
            const angle: number = sin >= 0 && cos >= 0
                ? Math.PI / 2 - Math.acos(cos)
                : sin < 0 && cos >= 0
                    ? Math.acos(cos) + Math.PI / 2
                    : sin <= 0 && cos < 0
                        ? Math.acos(cos) + Math.PI / 2
                        : Math.PI * 5 / 2 - Math.acos(cos);
            let r: number = this.Header.horizontal - angle;
            while (r >= Math.PI * 2) {
                r -= Math.PI * 2;
            }
            while (r < 0) {
                r += Math.PI * 2;
            }
            if (r < Math.PI * 3 / 2 - Math.PI / 4 && r > Math.PI / 2 + Math.PI / 4) {
                count++;
            }
        }
        if (count >= 3 / 4 * rect.points.length || distance >= 30) {
            return true;
        }
        for (let i: number = 0; i < points.length; i++) {
            if (isNaN(points[i].x) || isNaN(points[i].y)
            || Math.abs(points[i].x) === Infinity || Math.abs(points[i].y) === Infinity) {
                return true;
            }
        }
        return false;
    }

    private isLineOut(p1: Projection, p2: Projection): boolean {
        if (isNaN(p2.x) || isNaN(p1.x) || Math.abs(p2.x - p1.x) === Infinity
        || isNaN(p2.y) || isNaN(p1.y) || Math.abs(p2.y - p1.y) === Infinity) {
            return true;
        }
        if ((p1.x < 0 && p2.x < 0) || (p1.y < 0 && p2.y < 0) || (p1.x > 1 && p2.x > 1) || (p1.y > 1 && p2.y > 1)) {
            return true;
        }

        return false;
    }
}


export default Canvas;
