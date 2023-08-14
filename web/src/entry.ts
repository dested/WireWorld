import * as dat from 'lil-gui';
import {runFast, timePerTick} from './common.ts';
import {WireworldJavascript} from './javascript.ts';
import {WireworldWebASM} from './webASM.ts';
import {WireworldWebGPU} from './webGPU.ts';

async function main() {
  var obj = {
    message: '',
    type: 'javascript',
    runFast: false,
    get timePerTick() {
      return `MS Per Run: ${timePerTick.peek().toFixed(5)}`;
    },
  };

  var gui = new dat.GUI();

  gui.add(obj, 'runFast').onChange((e) => {
    runFast.value = e;
  });

  // gui.add(obj, 'maxSize').min(-10).max(10).step(0.25);

  // Choose from accepted values
  let current: {start: () => void; stop: () => void} = new WireworldJavascript();
  current.start();

  gui.add(obj, 'type', ['javascript', 'webasm', 'webgpu']).onChange((e) => {
    current.stop();
    switch (obj.type) {
      case 'javascript':
        current = new WireworldJavascript();
        break;
      case 'webasm':
        current = new WireworldWebASM();
        break;
      case 'webgpu':
        current = new WireworldWebGPU();
        break;
    }
    current.start();
  });
  let div2 = document.createElement('div');
  div2.style.marginTop = '20px';
  div2.style.marginBottom = '20px';
  div2.style.marginLeft = '8px';
  div2.style.marginRight = '8px';
  gui.$children.prepend(div2);

  let a = document.createElement('a');
  a.style.fontSize = '20px';
  a.style.marginTop = '20px';
  a.style.marginBottom = '20px';
  a.style.marginLeft = '8px';
  a.style.marginRight = '8px';
  a.style.display = 'block';
  a.style.color = 'white';
  a.innerText = 'About me';
  a.href = 'https://dested.com';
  gui.$children.prepend(a);
  a = document.createElement('a');
  a.style.fontSize = '20px';
  a.style.marginTop = '20px';
  a.style.marginBottom = '20px';
  a.style.marginLeft = '8px';
  a.style.marginRight = '8px';
  a.style.display = 'block';
  a.style.color = 'white';
  a.innerText = 'Github';
  a.href = 'https://github.com/dested/WireWorld';
  gui.$children.prepend(a);

  a = document.createElement('a');
  a.style.fontSize = '20px';
  a.style.marginTop = '20px';
  a.style.marginBottom = '20px';
  a.style.marginLeft = '8px';
  a.style.marginRight = '8px';
  a.style.color = 'white';
  a.style.display = 'block';
  a.innerText = 'Wireworld Computer';
  a.href = 'https://www.quinapalus.com/wi-index.html';
  gui.$children.prepend(a);
  a = document.createElement('a');
  a.style.fontSize = '20px';
  a.style.marginTop = '20px';
  a.style.marginBottom = '20px';
  a.style.marginLeft = '8px';
  a.style.marginRight = '8px';
  a.style.display = 'block';
  a.style.color = 'white';
  a.innerText = 'WireWorld';
  a.href = 'https://en.wikipedia.org/wiki/Wireworld';
  gui.$children.prepend(a);

  const div = document.createElement('div');
  div.style.fontSize = '20px';
  div.style.marginTop = '20px';
  div.style.marginBottom = '20px';
  div.style.marginLeft = '8px';
  div.style.marginRight = '8px';
  div.innerText = 'This is the WireWorld Cellular Automata running in WebGPU, WebASM, and Javascript.';
  gui.$children.prepend(div);

  const tpt = gui.add(obj, 'timePerTick');
  setInterval(() => {
    tpt.updateDisplay();
  }, 1000);
}

main();
