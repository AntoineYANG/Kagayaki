/*
 * @Author: Antoine YANG 
 * @Date: 2019-11-20 22:05:54 
 * @Last Modified by: Antoine YANG
 * @Last Modified time: 2019-11-21 00:42:16
 */

import { Map, $Polygon, $Cube } from '../TypeLib';
import Color from '../preference/Color';


let ground: Array<$Polygon> = [];
let cubes: Array<$Cube> = [];

for (let x: number = 0; x < 10; x+=2) {
    for (let y: number = 0; y < 10; y+=2) {
        const z: number = 1.6;
        const rect: $Polygon = {
            points: [{
                x: x, y: y, z: z
            }, {
                x: x, y: y + 2, z: z
            }, {
                x: x + 2, y: y + 2, z: z
            }, {
                x: x + 2, y: y, z: z
            }],
            style: {
                color: Color.setLightness(Color.Nippon.Kesizumi, 0.6 + Math.random() * Math.random() * 0.2),
                opacity: 1,
                line: {
                    color: Color.Nippon.Aonibi,
                    width: 0.5
                }
            }
        };
        const cube: $Cube = new $Cube(rect);
        cubes.push(cube);
    }
}

for (let x: number = -40; x < 50; x+=2) {
    for (let y: number = -40; y < 50; y+=2) {
        if (x >= 0 && x + 2 <= 10 && y >= 0 && y + 2 <= 10) {
            continue;
        }
        const z: number = 0;
        const rect: $Polygon = {
            points: [{
                x: x, y: y, z: z
            }, {
                x: x, y: y + 2, z: z
            }, {
                x: x + 2, y: y + 2, z: z
            }, {
                x: x + 2, y: y, z: z
            }],
            style: {
                color: Color.setLightness(Color.Nippon.Mizu, 0.6 + Math.random() * 0.15),
                opacity: 0.84
            }
        };
        ground.push(rect);
    }
}


const TestMap: Map = {
    ground: ground,
    cubes: cubes,
    beginPoint: {
        x: 5 + 1e-3, y: 2 + 1e-3, z: 30
    }
};


export default TestMap;
