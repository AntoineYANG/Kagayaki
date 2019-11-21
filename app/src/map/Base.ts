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
    for (let y: number = 0; y < 40; y+=2) {
        const z: number = 100 + Math.floor(y / 5) * 0.7;
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
                color: Math.floor(y / 5) % 2 === 0
                    ? Color.setLightness(Color.Nippon.Kesizumi, 0.5 + Math.random() * Math.random() * 0.3)
                    : Color.setLightness(Color.Nippon.Kesizumi, 0.06 + Math.random() * Math.random() * 0.1),
                opacity: 1
            }
        };
        cubes.push(new $Cube(rect));
    }
}

cubes.push(new $Cube({
    points: [{
        x: 3, y: 40, z: 107.2
    }, {
        x: 3, y: 50, z: 107.2
    }, {
        x: 7, y: 50, z: 107.2
    }, {
        x: 7, y: 40, z: 107.2
    }],
    style: {
        color: Color.Nippon.Akabeni,
        opacity: 1
    }
}));

for (let y: number = 50; y < 400; y+=2) {
    cubes.push( new $Cube({
        points: [{
            x: 3, y: y, z: 2
        }, {
            x: 3, y: y + 2, z: 2
        }, {
            x: 7, y: y + 2, z: 2
        }, {
            x: 7, y: y, z: 2
        }],
        style: {
            color: Color.Nippon.Kinntya,
            opacity: 1
        }
    }));
}

for (let x: number = -37; x < 47; x+=4) {
    for (let y: number = 40; y < 600; y+=4) {
        const z: number = 1;
        const rect: $Polygon = {
            points: [{
                x: x, y: y, z: z
            }, {
                x: x, y: y + 4, z: z
            }, {
                x: x + 4, y: y + 4, z: z
            }, {
                x: x + 4, y: y, z: z
            }],
            style: {
                color: Color.setLightness(Color.Nippon.Mizu, 0.6),
                opacity: 0.8,
                extra: {
                    floating: 1e-3,
                    blink: 0.15
                }
            }
        };
        ground.push(rect);
    }
}

for (let y: number = 60; y <= 800; y+=10) {
    cubes.push(new $Cube({
        points: [{
            x: 0, y: y, z: 1.5
        }, {
            x: 0, y: y + 1, z: 1.5
        }, {
            x: 1, y: y + 1, z: 1.5
        }, {
            x: 1, y: y, z: 1.5
        }],
        style: {
            color: Color.Nippon.Kinntya,
            opacity: 1
        }
    }), new $Cube({
        points: [{
            x: 9, y: y, z: 1.5
        }, {
            x: 9, y: y + 1, z: 1.5
        }, {
            x: 10, y: y + 1, z: 1.5
        }, {
            x: 10, y: y, z: 1.5
        }],
        style: {
            color: Color.Nippon.Kinntya,
            opacity: 1
        }
    }), new $Cube({
        points: [{
            x: -5, y: y, z: 20
        }, {
            x: -5, y: y + 1, z: 20
        }, {
            x: -4, y: y + 1, z: 20
        }, {
            x: -4, y: y, z: 20
        }],
        style: {
            color: Color.Nippon.Kinntya,
            opacity: 1
        }
    }), new $Cube({
        points: [{
            x: 14, y: y, z: 20
        }, {
            x: 14, y: y + 1, z: 20
        }, {
            x: 15, y: y + 1, z: 20
        }, {
            x: 15, y: y, z: 20
        }],
        style: {
            color: Color.Nippon.Kinntya,
            opacity: 1
        }
    }), new $Cube({
        points: [{
            x: -15, y: y, z: 50
        }, {
            x: -15, y: y + 1, z: 50
        }, {
            x: -14, y: y + 1, z: 50
        }, {
            x: -14, y: y, z: 50
        }],
        style: {
            color: Color.Nippon.Kinntya,
            opacity: 1
        }
    }), new $Cube({
        points: [{
            x: 24, y: y, z: 50
        }, {
            x: 24, y: y + 1, z: 50
        }, {
            x: 25, y: y + 1, z: 50
        }, {
            x: 25, y: y, z: 50
        }],
        style: {
            color: Color.Nippon.Kinntya,
            opacity: 1
        }
    }));
}

const Base: Map = {
    ground: ground,
    cubes: cubes,
    beginPoint: {
        x: 5 + 1e-3, y: 2 + 1e-3, z: 100
    }
};


export default Base;
