/*
 * @Author: Antoine YANG 
 * @Date: 2019-11-19 09:05:27 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-11-19 15:59:13
 */

import React, { Component } from 'react';
import { Position, Direction, $Line, Graph, CanvasProps, Projection } from './TypeLib';
import $ from 'jquery';


class Canvas extends Component<CanvasProps, {}, {}> {
    private Camera: Position;
    private readonly cameraAngleHorizontal: number = Math.PI * 2 / 3;
    private readonly cameraAngleVertical: number = Math.PI / 2;
    private Header: Direction;
    private height: number = 0;
    private moving = {
        front: false,
        left: false,
        right: false,
        back: false,
        jumping: false
    };
    private units: Array<$Line>;
    private Background: HTMLCanvasElement | null;
    private ctx_Background: CanvasRenderingContext2D | null;
    private lastStyle_Background: string;
    private graphs: Array<Graph>;
    private timer: NodeJS.Timeout;

    public constructor(props: CanvasProps) {
        super(props);
        this.Camera = {
            x: 25, y: -5, z: 3
        };
        this.Header = {
            x: 0, y: 1, z: 0
        }
        this.Background = null;
        this.ctx_Background = null;
        this.lastStyle_Background = '#FF0000';
        this.units = [];
        this.graphs = [];
        for (let x: number = 0; x <= 50; x++) {
            this.units.push({
                source: { x: x, y: 0, z: 0 },
                target: { x: x, y: 50, z: 0 },
                style: {
                    color: 'black',
                    width: 1
                }
            });
        }
        for (let y: number = 0; y <= 50; y++) {
            this.units.push({
                source: { x: 0, y: y, z: 0 },
                target: { x: 50, y: y, z: 0 },
                style: {
                    color: 'black',
                    width: 1
                }
            });
        }
        this.units.forEach((value: $Line) => {
            this.graphs.push(value);
        });

        this.timer = setInterval(() => {
            let step: number = 0.1;
            if (((this.moving.front && !this.moving.back) || (!this.moving.front && this.moving.back))
            && ((this.moving.left && !this.moving.right) || (!this.moving.left && this.moving.right))) {
                step /= Math.sqrt(2);
            }
            if (this.moving.jumping) {
                step /= Math.sqrt(2);
            }
            if (this.moving.front) {
                this.Camera.y += step;
            }
            if (this.moving.left) {
                this.Camera.x -= step;
            }
            if (this.moving.back) {
                this.Camera.y -= step;
            }
            if (this.moving.right) {
                this.Camera.x += step;
            }
            this.draw();
        }, 1000 / 60);

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
            if (e.which === 32) {
                // space
                this.moving.jumping = true;
                setTimeout(() => {
                    this.height = 0;
                    this.moving.jumping = false;
                }, 650);
                for (let i: number = 0; i < 600; i += 15) {
                    setTimeout(() => {
                        this.height = i <= 360 ? i / 180 : 1.5 - (i - 360) / 240;
                    }, i);
                }
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
        });
    }

    public render(): JSX.Element {
        return (
            <canvas key="Canvas_Background" id="BackgroundLayer" ref="BackgroundLayer"
            width={ `${ this.props.width }px` } height={ `${ this.props.height }px` }
            style={{
                background: 'yellow'
            }} />
        );
    }

    public componentDidMount(): void {
        this.Background = document.getElementById("BackgroundLayer") as HTMLCanvasElement;
        this.ctx_Background = this.Background!.getContext('2d');
        this.ctx_Background!.strokeStyle = this.lastStyle_Background;
        this.draw();
    }

    public componentDidUpdate(): void {}

    public componentWillUnmount(): void {
        clearInterval(this.timer);
    }

    private draw(): void {
        if (!this.ctx_Background) {
            return;
        }
        this.ctx_Background!.clearRect(0, 0, this.props.width, this.props.height);
        this.graphs.forEach((graph: Graph) => {
            if (graph as $Line) {
                let line: $Line = graph as $Line;
                this.parseLine(line);
                const source: Position = {
                    x: line.source.x - this.Camera.x,
                    y: line.source.y - this.Camera.y,
                    z: line.source.z - this.Camera.z - this.height
                };
                const target: Position = {
                    x: line.target.x - this.Camera.x,
                    y: line.target.y - this.Camera.y,
                    z: line.target.z - this.Camera.z - this.height
                };
                let p1: Projection = {
                    x: 0.5 + source.x / Math.tan(this.cameraAngleHorizontal / 2) / Math.abs(source.y) / 2,
                    y: source.y >= 0
                        ? 0.5 - source.z / Math.tan(this.cameraAngleVertical / 2) / source.y / 2
                        : NaN
                };
                let p2: Projection = {
                    x: 0.5 + target.x / Math.tan(this.cameraAngleHorizontal / 2) / Math.abs(target.y) / 2,
                    y: target.y >= 0
                        ? 0.5 - target.z / Math.tan(this.cameraAngleVertical / 2) / target.y / 2
                        : NaN
                };
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

    private parseLine(p: $Line): void {
        const SsugX: number = p.source.y / Math.tan(this.cameraAngleHorizontal / 2);
        const TsugX: number = p.target.y / Math.tan(this.cameraAngleHorizontal / 2);
        if (Math.abs(p.source.x) <= SsugX && Math.abs(p.target.x) <= TsugX) {
            return;
        }
        if (Math.abs(p.source.x) <= SsugX) {
            // p.target.y = p.source.y + p.target.y / (p.target.x - p.source.x) * (Math.sign(p.target.x) * TsugX - p.source.x);
            // p.target.x = Math.sign(p.target.x) * TsugX;
        }
        else if (Math.abs(p.target.x) <= TsugX) {
            // p.source.y = p.target.y + p.source.y / (p.source.x - p.target.x) * (Math.sign(p.source.x) * SsugX - p.target.x);
            // p.source.x = Math.sign(p.source.x) * SsugX;
        }
        else {
            // p.source.x = NaN;
            // p.source.y = NaN;
            // p.target.x = NaN;
            // p.target.y = NaN;
        }
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
