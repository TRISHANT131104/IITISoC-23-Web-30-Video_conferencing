import React, { useState, useRef } from "react";
import dynamic from 'next/dynamic'
import {
    useWindowSize,
    useWindowWidth,
    useWindowHeight,
  } from '@react-hook/window-size'

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
    ssr: false,
  })


const Modal = () => {
    const colors = ["#ff0000", "#ffcc00"];
    //const colors = ["#ff0000", "#00ff00", "#190E4F", "#03012C"];
    const backgroundColor = "white";
    const [width, height] = useWindowSize()
    const totalFrames = 1000;
    let frameCount = 0;
    let recording = false;

    function setup(p,canvasParentRef) {
        p.createCanvas(width<1000?width:width/2, height, p.WEBGL).parent(canvasParentRef);
        p.noiseSeed(200);
        p.randomSeed(100);
    }

    function draw(p) {
        frameCount += 1;
        let frameDelta = (2 * p.PI * (frameCount % totalFrames)) / totalFrames;

        let bg = p.color(backgroundColor);
        p.background(bg);

        p.push();
        p.scale(5);
        p.rotateY(frameCount / 80);
        // p.rotateX(frameCount / 80);
        // p.rotateZ(frameCount / 80);
        // p.rotateX(p.HALF_PI)

        let r = 50;
        let hor = 50;
        let vert = 50;

        var dTheta = p.TWO_PI / vert;
        var dPhi = p.PI / hor;

        let delta = frameCount / 100;

        for (var lat = 0; lat < hor + 1; ++lat) {
            var phi = p.HALF_PI - lat * dPhi;
            var cosPhi = p.cos(phi);
            var sinPhi = p.sin(phi);

            for (var lon = 0; lon < vert + 1; ++lon) {
                var theta = lon * dTheta;
                var cosTheta = p.cos(theta);
                var sinTheta = p.sin(theta);

                let x = r * cosTheta * cosPhi + p.cos(delta + lat / 2) * 2;
                let y = r * sinPhi + p.sin(delta + lon / 2) * 2;
                let z = r * sinTheta * cosPhi;

                let pct = p.dist(0, -50, x, z);
                
                pct = p.map(pct, 0, r * 2, 0, 1);
                let colorA = p.color(colors[0]);
                let colorB = p.color(colors[1]);
                let _color = p.lerpColor(colorA, colorB, pct);

                p.push();

                p.translate(x, y, z);

                p.noStroke();
                p.fill(_color);

                p.sphere(1, 10, 10);

                p.pop();
            }
        }

        

        //checkForRecording();
    }


    return (
        <Sketch setup={setup} draw={draw} />
    );
};

export default Modal;
