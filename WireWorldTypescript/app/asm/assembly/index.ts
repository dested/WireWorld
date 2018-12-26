@external("console", "logger")
declare function logger(offset: usize): void

@inline
function loadBit(offset: u32): u32 {
  return load<u32>(offset << alignof<u32>());
}

@inline
function storeBit(offset: u32, value: u32): void {
  store<u32>(offset << alignof<u32>(), value);
}

function loadCopper(offset: u32, pos: u8): u32 {
  return loadBit(offset * 8 + pos);
}

export function init(): void {
  memory.grow(800);
}

export function tick(): void {
  const size = 605129;
  const coppersSize = size * 8;
  const headsArrayOffset = coppersSize + size * 1;
  const tailsArrayOffset = coppersSize + size * 3;
  const headsGridOffset = coppersSize + size * 2;
  const tailsGridOffset = coppersSize + size * 4;

  const newHeadsArrayOffset = coppersSize + size * 5;
  const newTailsArrayOffset = coppersSize + size * 7;
  const newHeadsGridOffset = coppersSize + size * 6;
  const newTailsGridOffset = coppersSize + size * 8;

  /**/
  let newHeadArrayIndex = 0;
  for (let index = 0; index < size; index++) {
    let headKey = loadBit(headsArrayOffset + index);
    if (headKey === 0) {
      break;
    }
    for (let i: u8 = 0; i < 8; i++) {
      let copperStateIndex = loadCopper(headKey, i);
      if (copperStateIndex === 0) break;
      if (
        loadBit(tailsGridOffset + copperStateIndex) === 0 &&
        loadBit(headsGridOffset + copperStateIndex) === 0 &&
        loadBit(newHeadsGridOffset + copperStateIndex) === 0
      ) {
        let headNeighbors = 0;
        for (let ind2: u8 = 0; ind2 < 8; ind2++) {
          let stateIndex = loadCopper(copperStateIndex, ind2);
          if (stateIndex === 0) break;
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
          storeBit(newHeadsArrayOffset + newHeadArrayIndex, copperStateIndex);
          newHeadArrayIndex = newHeadArrayIndex + 1;
        }
      }
    }
  }

/*
  for (let i = headsArrayOffset, j = 0, l = headsGridOffset + size; i < l; i++, j++) {
    storeBit(newTailsArrayOffset + j, loadBit(i));
  }

  for (let i = newHeadsArrayOffset, j = 0, l = newHeadsArrayOffset + size * 4 + size * 4; i < l; i++, j++) {
    storeBit(headsArrayOffset + j, loadBit(i));
  }
*/

  /*
    this.mem32.copyWithin(newTailsArrayOffset, headsArrayOffset, headsGridOffset + size);
    this.mem32.copyWithin(headsArrayOffset, newHeadsArrayOffset, newHeadsArrayOffset + size * 4 + size * 4);
  */


}

