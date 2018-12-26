/// <reference path="../../../node_modules/assemblyscript/index.d.ts" />

// @external('console', 'logger')
// declare function logger(offset: usize): void;

const copperLen: u32 = 8;
const size = 605129;
const arrLen = 7000;
const coppersSize = size * copperLen;
const headsArrayOffset = coppersSize + size;
const headsGridOffset = headsArrayOffset + arrLen;
const tailsArrayOffset = headsGridOffset + size;
const tailsGridOffset = tailsArrayOffset + arrLen;

const newHeadsArrayOffset = tailsGridOffset + size;
const newHeadsGridOffset  = newHeadsArrayOffset + arrLen;

@inline
function loadBit(offset: u32): u32 {
  return load<u32>(offset << alignof<u32>());
}

@inline
function storeBit(offset: u32, value: u32): void {
  store<u32>(offset << alignof<u32>(), value);
}

@inline
function loadCopper(offset: u32, pos: u32): u32 {
  return loadBit(offset * copperLen + pos + 1);
}

export function init(): void {
  memory.grow(800);
}

export function tick(): void {
  let newHeadArrayIndex = 0;
  let hLen = loadBit(headsArrayOffset);
  for (let index: u32 = 1; index <= hLen; ++index) {
    let headKey = loadBit(headsArrayOffset + index);
    let hCopperLen = loadBit(headKey * copperLen);
    for (let i: u32 = 0; i < hCopperLen; ++i) {
      let copperStateIndex = loadCopper(headKey, i);
      if (
        !loadBit(tailsGridOffset + copperStateIndex) &&
        !loadBit(headsGridOffset + copperStateIndex) &&
        !loadBit(newHeadsGridOffset + copperStateIndex)
      ) {
        let headNeighbors = 0;
        let hnCopperLen = loadBit(copperStateIndex * copperLen);
        for (let j: u32 = 0; j < hnCopperLen; ++j) {
          let stateIndex = loadCopper(copperStateIndex, j);
          if (loadBit(headsGridOffset + stateIndex) === 1) {
            ++headNeighbors;
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
