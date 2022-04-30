export class FarmArea {
    area: uint32;
    name: TSString;
    map: uint32;
    x: double;
    y: double;
    z: double;
    o: double;

    constructor(row: TSDatabaseResult) {
        this.area = row.GetUInt32(0);
        this.name = row.GetString(1);
        this.map = row.GetUInt32(2);
        this.x = row.GetDouble(3);
        this.y = row.GetDouble(4);
        this.z = row.GetDouble(5);
        this.o = row.GetDouble(6);
    }
}

export const FarmAreas = CreateDictionary<uint32,FarmArea>({});

export function RegisterFarmAreas(_: TSEvents) {
    ASSERT_WORLD_TABLE('farm_areas','isiffff')
    let res = QueryWorld(`SELECT * from \`farm_areas\``);
    while(res.GetRow()) {
        FarmAreas[res.GetUInt32(0)] = new FarmArea(res);
    }
}