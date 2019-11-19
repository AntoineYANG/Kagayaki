/*
 * @Author: Antoine YANG 
 * @Date: 2019-11-19 09:05:27 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-11-20 00:00:25
 */

import React, { Component } from 'react';
import { Position, $Line, Graph, CanvasProps, Projection } from './TypeLib';
import $ from 'jquery';
import Color from './preference/Color';


class Canvas extends Component<CanvasProps, {}, {}> {
    private Camera: Position;
    private readonly cameraAngleHorizontal: number = Math.PI * 2 / 3;
    private readonly cameraAngleVertical: number = Math.PI / 2;
    private Header: {
        horizontal: number;
        vertical: number;
    };
    private height: number = 0;
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
    private jumpHeight: Array<number> = [
        0, -0.05, -0.08, -0.1, -0.12, -0.13, -0.08,
        0, 0.176, 0.342, 0.5, 0.648, 0.788, 0.918, 1.04, 1.152, 1.256, 1.35,
        1.435, 1.512, 1.58, 1.58,
        1.567, 1.538, 1.497, 1.444, 1.381, 1.309, 1.228, 1.138, 1.04, 0.934, 0.821, 0.7,
        0.571, 0.436, 0.293, 0.144, -0.12, -0.051
    ];
    private units: Array<$Line>;
    private Background: HTMLCanvasElement | null;
    private ctx_Background: CanvasRenderingContext2D | null;
    private lastStyle_Background: string;
    private graphs: Array<Graph>;
    private timer: NodeJS.Timeout;

    public constructor(props: CanvasProps) {
        super(props);
        this.Camera = {
            x: 10, y: 50, z: 2
        };
        this.Header = {
            horizontal: 0,
            vertical: 0
        };
        this.Background = null;
        this.ctx_Background = null;
        this.lastStyle_Background = '#FF0000';
        this.units = [];
        this.graphs = [];
        for (let x: number = 0; x <= 20; x++) {
            this.units.push({
                source: { x: x, y: 0, z: 0 },
                target: { x: x, y: 100, z: 0 },
                style: {
                    color: Color.Nippon.Gohunn,
                    width: 1
                }
            });
        }
        for (let y: number = 0; y <= 100; y++) {
            this.units.push({
                source: { x: 0, y: y, z: 0 },
                target: { x: 20, y: y, z: 0 },
                style: {
                    color: Color.Nippon.Gohunn,
                    width: 1
                }
            });
        }
        this.units.forEach((value: $Line) => {
            this.graphs.push(value);
        });

        this.timer = setInterval(() => {
            this.tick();
        }, 1000 / 60);
    }

    public render(): JSX.Element {
        return (
            <canvas key="Canvas_Background" id="BackgroundLayer" ref="BackgroundLayer"
            width={ `${ this.props.width }px` } height={ `${ this.props.height }px` }
            style={{
                background: Color.Nippon.Kati
            }} />
        );
    }

    public componentDidMount(): void {
        this.Background = document.getElementById("BackgroundLayer") as HTMLCanvasElement;
        this.ctx_Background = this.Background!.getContext('2d');
        this.ctx_Background!.strokeStyle = this.lastStyle_Background;
        this.draw();
        this.onGameStart();
    }

    public componentDidUpdate(): void {}

    public componentWillUnmount(): void {
        clearInterval(this.timer);
    }

    private onGameStart(): void {
        $('*').keydown((e: JQuery.KeyDownEvent<HTMLElement, null, HTMLElement, HTMLElement>) => {
            if (this.moving.jumping) {
                return;
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
                return;
            }
            if (e.which === 32) {
                // space
                this.moving.jumping = true;
                setTimeout(() => {
                    this.height = 0;
                    this.moving.jumping = false;
                }, 1200);
                for (let i: number = 0; i < this.jumpHeight.length; i ++) {
                    setTimeout(() => {
                        this.height = this.jumpHeight[i];
                    }, i * 25);
                }
            }
        });
    }

    private tick(): void {
        if (this.turning.up) {
            this.Header.vertical += 0.02;
        }
        if (this.turning.down) {
            this.Header.vertical -= 0.02;
        }
        if (this.Header.vertical > Math.PI * 4 / 5) {
            this.Header.vertical = Math.PI * 4 / 5;
        }
        else if (this.Header.vertical < Math.PI * 2 / 3) {
            this.Header.vertical = Math.PI * 2 / 3;
        }
        if (this.turning.left) {
            this.Header.horizontal -= 0.02;
        }
        if (this.turning.right) {
            this.Header.horizontal += 0.02;
        }
        let step: number = 0.1;
        if (((this.moving.front && !this.moving.back) || (!this.moving.front && this.moving.back))
        && ((this.moving.left && !this.moving.right) || (!this.moving.left && this.moving.right))) {
            step /= 2;
        }
        if (this.moving.jumping) {
            step /= 2;
        }
        if (this.moving.front) {
            this.Camera.y += step;
        }
        if (this.moving.left) {
            this.Camera.x -= step;
        }
        if (this.moving.back) {
            this.Camera.y -= step / Math.sqrt(2);
        }
        if (this.moving.right) {
            this.Camera.x += step;
        }
        this.draw();
    }

    private draw(): void {
        if (!this.ctx_Background) {
            return;
        }
        this.ctx_Background!.clearRect(0, 0, this.props.width, this.props.height);
        this.graphs.forEach((graph: Graph) => {
            if (graph as $Line) {
                let line: $Line = graph as $Line;
                const dis1: number = Math.sqrt(Math.pow(line.source.x - this.Camera.x, 2) + Math.pow(line.source.y - this.Camera.y, 2));
                const angle1: number = line.source.y > this.Camera.y
                    ? Math.acos((line.source.x - this.Camera.x) / dis1) + this.Header.horizontal
                    : - Math.acos((line.source.x - this.Camera.x) / dis1) + this.Header.horizontal;
                // const angle1: number = line.source.y > this.Camera.y
                //     ? Math.asin((line.source.x - this.Camera.x) / dis1) + this.Header.horizontal
                //     : Math.PI + Math.asin((line.source.x - this.Camera.x) / dis1) + this.Header.horizontal;
                const source: Position = {
                    // x: line.source.x - this.Camera.x,
                    // y: line.source.y - this.Camera.y,
                    x: dis1 * Math.cos(angle1),
                    y: dis1 * Math.sin(angle1),
                    z: line.source.z - this.Camera.z - this.height
                };
                const dis2: number = Math.sqrt(Math.pow(line.target.x - this.Camera.x, 2) + Math.pow(line.target.y - this.Camera.y, 2));
                const angle2: number = line.target.y > this.Camera.y
                    ? Math.acos((line.target.x - this.Camera.x) / dis2) + this.Header.horizontal
                    : - Math.acos((line.target.x - this.Camera.x) / dis2) + this.Header.horizontal;
                // const angle2: number = line.target.y > this.Camera.y
                //     ? Math.asin((line.target.x - this.Camera.x) / dis2) + this.Header.horizontal
                //     : Math.PI + Math.asin((line.target.x - this.Camera.x) / dis2) + this.Header.horizontal;
                const target: Position = {
                    // x: line.target.x - this.Camera.x,
                    // y: line.target.y - this.Camera.y,
                    x: dis2 * Math.cos(angle2),
                    y: dis2 * Math.sin(angle2),
                    z: line.target.z - this.Camera.z - this.height
                };
                let p1: Projection = {
                    x: source.y >= 0
                        ? 0.5 + source.x / Math.tan(this.cameraAngleHorizontal / 2) / source.y / 2
                        : 0.5 - (source.x * Math.tan(this.cameraAngleHorizontal / 2 - Math.PI / 2) * (1 - source.y) / 2),
                    y: source.y >= 0
                        ? 0.5 - source.z / Math.tan(this.cameraAngleVertical / 2) / source.y / 2
                        : 0.5 + source.z * Math.tan(this.cameraAngleVertical / 2 - Math.PI / 2) * (1 - source.y) / 2
                };
                let p2: Projection = {
                    x: target.y >= 0
                        ? 0.5 + target.x / Math.tan(this.cameraAngleHorizontal / 2) / target.y / 2
                        : 0.5 - (target.x * Math.tan(this.cameraAngleHorizontal / 2 - Math.PI / 2) * (1 - target.y) / 2),
                    y: target.y >= 0
                        ? 0.5 - target.z / Math.tan(this.cameraAngleVertical / 2) / target.y / 2
                        : 0.5 + target.z * Math.tan(this.cameraAngleVertical / 2 - Math.PI / 2) * (1 - target.y) / 2
                };
                // let p1: Projection = {
                //     x: source.y >= 0
                //         ? 0.5 + source.x / Math.tan(this.cameraAngleHorizontal / 2) / source.y / 2
                //         : 0.5 - source.x * Math.tan(this.cameraAngleHorizontal / 2 - Math.PI / 2) * (1 - source.y) / 2,
                //     y: source.y >= 0
                //         ? 0.5 - source.z / Math.tan(this.cameraAngleVertical / 2) / source.y / 2
                //         : 0.5 + source.z * Math.tan(this.cameraAngleVertical / 2 - Math.PI / 2) * (1 - source.y) / 2
                // };
                // let p2: Projection = {
                //     x: target.y >= 0
                //         ? 0.5 + target.x / Math.tan(this.cameraAngleHorizontal / 2) / target.y / 2
                //         : 0.5 - target.x * Math.tan(this.cameraAngleHorizontal / 2 - Math.PI / 2) * (1 - target.y) / 2,
                //     y: target.y >= 0
                //         ? 0.5 - target.z / Math.tan(this.cameraAngleVertical / 2) / target.y / 2
                //         : 0.5 + target.z * Math.tan(this.cameraAngleVertical / 2 - Math.PI / 2) * (1 - target.y) / 2
                // };
                if (this.isLineOut(p1, p2)) {
                    return;
                }
                const color: string = line.style.color;
                if (color !== this.lastStyle_Background) {
                    this.ctx_Background!.strokeStyle = color;
                    this.lastStyle_Background = color;
                }
                this.ctx_Background!.beginPath();
                this.ctx_Background!.moveTo(p1.x * this.props.width, p1.y * this.props.height);
                this.ctx_Background!.lineTo(p2.x * this.props.width, p2.y * this.props.height);
                this.ctx_Background!.lineWidth = (graph as $Line).style.width;
                this.ctx_Background!.stroke();
            }
        });
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
