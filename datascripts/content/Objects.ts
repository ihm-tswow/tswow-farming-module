import { FarmObject } from "../core/FarmObject";

export const SIMPLE_CHAIR = FarmObject
    .create('simple-chair', 'Simple Chair', 'INV_FISHINGCHAIR')
    .GameObject.mod(gobj=>gobj
        .Type.CHAIR.set()
        .Slots.set(1)
        .Height.set(1)
        .Display.setSimple('World\\Azeroth\\westfall\\passivedoodads\\westfallchair\\westfallchair.m2',5)
    )