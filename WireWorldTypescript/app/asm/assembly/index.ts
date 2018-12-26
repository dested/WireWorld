@external('console', 'logger')
declare function logger(offset: usize): void

const copperSize: u32 = 9;

@inline
function loadBit(offset: u32): u32 {
  return load<u32>(offset << alignof<u32>());
}

@inline
function storeBit(offset: u32, value: u32): void {
  store<u32>(offset << alignof<u32>(), value);
}

@inline
function loadCopper(offset: u32, pos: u8): u32 {
  return loadBit(offset * copperSize + pos + 1);
}

export function init(): void {
  memory.grow(800);
}

export function tick(): void {
  const size = 605129;
  const coppersSize = size * copperSize;
  const headsArrayOffset = coppersSize + size * 1;
  const headsGridOffset = coppersSize + size * 2;
  const tailsArrayOffset = coppersSize + size * 3;
  const tailsGridOffset = coppersSize + size * 4;

  const newHeadsArrayOffset = coppersSize + size * 5;
  const newHeadsGridOffset = coppersSize + size * 6;
  const newTailsArrayOffset = coppersSize + size * 7;
  const newTailsGridOffset = coppersSize + size * 8;

  /**/
  let newHeadArrayIndex = 0;
  let hLen: u32 = loadBit(headsArrayOffset);
  for (let index: u32 = 1; index <= hLen; index++) {
    let headKey = loadBit(headsArrayOffset + index);
    let hCopperLen: u32 = loadBit(headKey * copperSize);
    for (let i: u8 = 0; i < hCopperLen; i++) {
      let copperStateIndex = loadCopper(headKey, i);
      if (
        loadBit(tailsGridOffset + copperStateIndex) === 0 &&
        loadBit(headsGridOffset + copperStateIndex) === 0 &&
        loadBit(newHeadsGridOffset + copperStateIndex) === 0
      ) {
        let headNeighbors = 0;
        let hnCopperLen: u32 = loadBit(copperStateIndex * copperSize);
        for (let ind2: u8 = 0; ind2 < hnCopperLen; ind2++) {
          let stateIndex = loadCopper(copperStateIndex, ind2);
          if (loadBit(headsGridOffset + stateIndex) === 1) {
            headNeighbors++;
            if (headNeighbors === 3) {
              headNeighbors = 0;
              break;
            }
          }
        }
        if (headNeighbors > 0) {
          storeBit(newHeadsGridOffset + copperStateIndex, 1);
          storeBit(newHeadsArrayOffset + newHeadArrayIndex + 1, copperStateIndex);
          newHeadArrayIndex = newHeadArrayIndex + 1;
        }
      }
    }
  }
  storeBit(newHeadsArrayOffset, newHeadArrayIndex);
}
