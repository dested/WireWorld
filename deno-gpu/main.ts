const wireworldtxt = await Deno.readTextFile('./wireworld.txt');

const rows = wireworldtxt.replace(new RegExp('\r', 'g'), '').split('\n');

const boardWidth = rows[0].length;
const boardHeight = rows.length;
const workgroupSize = 256;
async function main() {
  let inputData = new Uint32Array(boardWidth * boardHeight);

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];

    for (let characterIndex = 0; characterIndex < row.length; characterIndex++) {
      const character = row[characterIndex];
      inputData[characterIndex + rowIndex * boardWidth] = charToState(character);
    }
  }

  const adapter = (await navigator.gpu.requestAdapter())!;
  const device = await adapter!.requestDevice();

  let inputBufferA = device.createBuffer({
    size: inputData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    mappedAtCreation: true,
  });
  new Uint32Array(inputBufferA.getMappedRange()).set(inputData);
  inputBufferA.unmap();

  let inputBufferB = device.createBuffer({
    size: inputData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    mappedAtCreation: true,
  });
  new Uint32Array(inputBufferB.getMappedRange()).set(inputData);
  inputBufferB.unmap();

  const readbackBuffer = device.createBuffer({
    size: inputData.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
  // Define Shader
  const computeShaderCode = `
struct Data {
  data: array<u32>
};

@group(0) @binding(0) var<storage, read> src: Data;
@group(0) @binding(1) var<storage, read_write> dst: Data;

fn get_cell_state(x: u32, y: u32) -> u32 {
  return src.data[x + y * ${boardWidth}]; 
}

fn get_cell_state2(x: u32, y: u32) -> u32 {
  return select(0u, 1u, src.data[x + y * ${boardWidth}] == 1);
}

@compute @workgroup_size(${workgroupSize})
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let current_state = src.data[global_id.x];
  let x: u32 = global_id.x % ${boardWidth};
  let y: u32 = global_id.x / ${boardWidth};
  
  switch(current_state) {
    case 0: {
      dst.data[global_id.x] = 0;
      break;
    }
    case 1: {
      dst.data[global_id.x] = 2;
      break;
    }
    case 2: {
      dst.data[global_id.x] = 3;
      break;
    }
    default: {
      var electron_head_count=get_cell_state2(x - 1, y - 1) +
                              get_cell_state2(x    , y - 1) +
                              get_cell_state2(x + 1, y - 1) +
                              get_cell_state2(x - 1, y    ) +
                              get_cell_state2(x + 1, y    ) +
                              get_cell_state2(x - 1, y + 1) +
                              get_cell_state2(x    , y + 1) +
                              get_cell_state2(x + 1, y + 1);
      
      if(electron_head_count == 1 || electron_head_count == 2){
        dst.data[global_id.x]=1;
      }else{
        dst.data[global_id.x]=3;
      }
      break;
    }
  }
}`;

  // Create pipeline
  const pipeline = device.createComputePipeline({
    compute: {
      module: device.createShaderModule({
        code: computeShaderCode,
      }),
      entryPoint: 'main',
    },
    layout: 'auto',
  });

  const bindGroupA = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {buffer: inputBufferA},
      },
      {
        binding: 1,
        resource: {buffer: inputBufferB},
      },
    ],
  });
  const bindGroupB = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {buffer: inputBufferB},
      },
      {
        binding: 1,
        resource: {buffer: inputBufferA},
      },
    ],
  });

  let i = 0;
  let msPerRun = 0;
  let isAInput = true;

  while (true) {
    let timeRun = performance.now();
    i++;
    // Dispatch the shader

    let commandEncoder = device.createCommandEncoder();
    let passEncoder = commandEncoder.beginComputePass();
    passEncoder.setPipeline(pipeline);
    passEncoder.setBindGroup(0, isAInput ? bindGroupA : bindGroupB);
    passEncoder.dispatchWorkgroups(Math.ceil(inputData.length / workgroupSize));
    passEncoder.end();

    device.queue.submit([commandEncoder.finish() ]);

    timeRun = performance.now() - timeRun;
    msPerRun += timeRun;

    if (i % 5000 === 0) {
      commandEncoder = device.createCommandEncoder();
      commandEncoder.copyBufferToBuffer(
        isAInput ? inputBufferA : inputBufferB,
        0,
        readbackBuffer,
        0,
        inputData.byteLength,
      );
      device.queue.submit([commandEncoder.finish()]);
      await readbackBuffer.mapAsync(GPUMapMode.READ);
      const readData = new Uint32Array(readbackBuffer.getMappedRange());
      // console.log(readData);
      readbackBuffer.unmap();
      console.log(msPerRun / i);
    }
    isAInput = !isAInput;
  }
}

export enum WireState {
  Empty = 0,
  Head = 1,
  Tail = 2,
  Copper = 3,
}

function charToState(character: string): WireState {
  switch (character) {
    case '#':
      return WireState.Copper;
    case '@':
      return WireState.Head;
    case '~':
      return WireState.Tail;
    default:
      return WireState.Empty;
  }
}

main();

