/*
 * @Author: Antoine YANG 
 * @Date: 2019-11-19 09:22:10 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-11-19 11:59:54
 */

export interface CanvasProps {
    width: number;
    height: number;
}

export interface Direction {
    x: number;
    y: number;
    z: number;
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

export interface Position {
    x: number;
    y: number;
    z: number;
}

export interface Projection {
    x: number;
    y: number;
}

