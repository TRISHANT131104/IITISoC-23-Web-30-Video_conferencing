import React, { useEffect } from 'react';
import { SendImageDataToPeers } from '../utils/BoardUtils';

export default function Board({ peers }) {
  useEffect(() => {
    const canvas = document.querySelector('#paint');
    const ctx = canvas.getContext('2d');

    var sketch = document.querySelector('#sketch');
        var sketch_style = getComputedStyle(sketch);
        const offsetX = sketch.offsetLeft;
        const offsetY = sketch.offsetTop;
        canvas.width = parseInt(sketch_style.getPropertyValue('width'));
        canvas.height = parseInt(sketch_style.getPropertyValue('height'));

    let mouse = { x: 0, y: 0 };
    let last_mouse = { x: 0, y: 0 };
    let timeout;

    /* Mouse Capturing Work */
    canvas.addEventListener('mousemove', function (e) {
      last_mouse.x = mouse.x;
      last_mouse.y = mouse.y;

      mouse.x = e.pageX - offsetX - 130;
      mouse.y = e.pageY - offsetY - 100;
    }, false);

    /* Drawing on Paint App */
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'blue';

    canvas.addEventListener('mousedown', function (e) {
      canvas.addEventListener('mousemove', onPaint, false);
    }, false);

    canvas.addEventListener('mouseup', function () {
      canvas.removeEventListener('mousemove', onPaint, false);
    }, false);

    const onPaint = function () {
      ctx.beginPath();
      ctx.moveTo(last_mouse.x, last_mouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.closePath();
      ctx.stroke();

      if (timeout !== undefined) clearTimeout(timeout);
      timeout = setTimeout(() => {
        const base64ImageData = canvas.toDataURL('image/png');
        console.log(base64ImageData);
        SendImageDataToPeers(base64ImageData, peers);
      }, 1000);
    };
  }, []);

  return (
    <div className='w-full h-full bg-white border-2 border-black'>
      <div id='sketch' className='object-fit h-full w-full'>
        <canvas id='paint' className='border-2 border-red-500 !h-full !w-full object-fit'></canvas>
      </div>
    </div>
  );
}
