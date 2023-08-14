import {signal} from '@preact/signals-core';

export const timePerTick = signal(0);
export const runFast = signal(false);
export const runFastTicks = signal(50);
export const runFastTicksGPU = signal(500);
