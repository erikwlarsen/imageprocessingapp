import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import styles from './css/style.css';
import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import Worker from '../workers/webWorker.js';
import sepiaWorker from 'worker-loader!../workers/sepiaWorker.js';

document.getElementById('sepiaButton').onclick = (event) => {
  const canvas = document.createElement('canvas');
  const image = document.getElementById('image');
  canvas.width = image.width;
  canvas.height = image.height;
  let ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const sepWorker = new sepiaWorker();
  sepWorker.postMessage({ canvasData, id: image.id });
  sepWorker.onmessage = (event) => {
    ctx.putImageData(event.data.canvasData, 0, 0);
    image.setAttribute('src', canvas.toDataURL('image/png'));
  };
}

render(<App />, document.getElementById('root'));

//- SEPIA IMAGE CONVERSION -------------------------------------------------//
const convertImageToCanvas = (image) => {
  var canvas = document.createElement("canvas");
	canvas.width = image.width;
	canvas.height = image.height;
  canvas.getContext("2d").drawImage(image, 0, 0);
  dogeDiv.appendChild(canvas);
	// return canvas;
}

const dogeDiv = document.getElementById('doge');
const dogePic = document.getElementById('doge-pic');
const dogeButton = document.getElementById('doge-button').addEventListener('click', () => convertImageToCanvas(dogePic));
//--------------------------------------------------------------------------//

//- WEBSOCKET STUFF --------------------------------------------------------//
window.addEventListener('load', () => {
  const socket = new WebSocket('ws://192.168.0.70:9000');
  socket.onopen = () => {
    const info = {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      hardwareConcurrency: navigator.hardwareConcurrency,
      platform: navigator.platform,
      connection: JSON.stringify(navigator.connection),
    };
    socket.send(JSON.stringify(info));
  };
  socket.onmessage = (e) => {
    console.log(e.data);
  };
});
//------------------------------------------------------------------------//

if ('serviceWorker' in navigator) {
  runtime.register().then(reg => {
    if (reg.installing) {
      console.log('Service worker installing');
    } else if (reg.waiting) {
      console.log('Service worker is waiting')
    } else if (reg.active) {
      console.log('Service worker is active!')
    }
  }).catch(err => {
    console.log('Registration failed with error: ', err);
  });
}

// might need to wrap entire webWorker section in 'if (window.Worker)' block

// this creates 7 web workers and dispatches them to calculate 29th through 49th fib numbers without cache

const createAndDispatchWorkers = () => {
  for (let i = 1; i <= 7; i++) {
    let webWorker = new Worker;
    webWorker.onmessage = e => console.log(e.data);
    webWorker.onerror = err => console.log('webWorker error:', err);
    webWorker.postMessage({ arguments: [i + 28] });
    webWorker.postMessage({ arguments: [i + 35] });
    webWorker.postMessage({ arguments: [i + 42] });
  }
}

// standard fib function without cache

const nthFib = num => {
  if (num === 0) return 0;
  if (num === 1) return 1;
  return nthFib(num - 1) + nthFib(num - 2);
}

// using worker-loader module to include workers in bundle.js
// const worker = new Worker;
// worker.onmessage = e => {
//   console.log(e.data);
// }

// worker.postMessage({ arguments: [20] });

// has main thread calculate fib numbers 29-49 without cache

const singleThreadFibonaccis = () => {
  for (let i = 29; i <= 49; i++) {
    console.log('single thread fib #' + i + ': ' + nthFib(i));
  }
}

// event handler for clicking switch button on DOM - switches whether Fibonacci calculation
// will be handled by single browser thread or web workers

document.getElementById('switch').addEventListener('click', () => {
  const switchButton = document.getElementById('switch');
  if (switchButton.className === 'singleThread') {
    switchButton.className = 'workerThread';
    switchButton.innerHTML = 'switch to single thread';
  } else {
    switchButton.className = 'singleThread';
    switchButton.innerHTML = 'switch to worker threads';
  }
});

// event handler for button that will run Fibonacci calculation

document.getElementById('fib').addEventListener('click', () => {
  const switchButton = document.getElementById('switch');
  switchButton.className === 'singleThread' ? singleThreadFibonaccis() : createAndDispatchWorkers();
});

