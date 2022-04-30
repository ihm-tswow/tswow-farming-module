export class CropType {
    stage0Go: uint32
    stage1Go: uint32
    stage2Go: uint32

    stage1Growth: uint32
    stage2Growth: uint32

    spell: uint32
    item: uint32

    constructor(res: TSDatabaseResult) {
        this.stage0Go = res.GetUInt32(1);
        this.stage1Go = res.GetUInt32(2);
        this.stage2Go = res.GetUInt32(3);
        this.stage1Growth = res.GetUInt32(4);
        this.stage2Growth = res.GetUInt32(5);
        this.spell = res.GetUInt32(6);
        this.item = res.GetUInt32(7);
    }
}

export const CropTypes = CreateDictionary<uint32,CropType>({})

export function RegisterCropTypes(events: TSEvents) {
    ASSERT_WORLD_TABLE('farming_crops','iiiiiiii')
    let res = QueryWorld('SELECT * from `farming_crops`;')
    while(res.GetRow()) {
        CropTypes[res.GetUInt32(0)] = new CropType(res);
    }
}