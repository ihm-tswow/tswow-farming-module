import { Cell } from "wow/data/cell/cells/Cell";
import { ContainerCell } from "wow/data/cell/cells/ContainerCell";
import { std } from "wow/wotlk";
import { Position } from "wow/wotlk/std/Misc/Position";
import { PositionMapXYZOCell } from "wow/wotlk/std/Misc/PositionCell";

// Estates are used to give areas a database name and entrance information
std.SQL.Databases.world_dest.writeEarly(`
    DROP TABLE IF EXISTS \`farm_areas\`;
    CREATE TABLE \`farm_areas\` (
        \`area\` INT(10) NOT NULL,
        \`name\` TEXT NOT NULL,
        \`map\` INT(10) NOT NULL,
        \`entranceX\` FLOAT NOT NULL,
        \`entranceY\` FLOAT NOT NULL,
        \`entranceZ\` FLOAT NOT NULL,
        \`entranceO\` FLOAT NOT NULL,
        PRIMARY KEY(\`area\`)
    );
`)

let areaData: FarmArea[] = []
export class FarmArea {
    Area: Cell<number,this>;
    Entrance: PositionMapXYZOCell<this>;

    protected constructor(area: number, pos: Position) {
        this.Area = new ContainerCell(this,area);
        this.Entrance = new PositionMapXYZOCell(
            this,
            new ContainerCell(this, pos.map),
            new ContainerCell(this, pos.x),
            new ContainerCell(this, pos.y),
            new ContainerCell(this, pos.z),
            new ContainerCell(this, pos.o),
        )
    }

    static create(area: number, pos: Position) {
        let farmArea = new FarmArea(area,pos);
        areaData.push(farmArea);
        return farmArea;
    }
}

// call this in an event in case area names changed
std.Events.finish('farm-estates',()=>{
    areaData.forEach(x=>{
        std.SQL.Databases.world_dest.write(`
            INSERT INTO \`farm_areas\` VALUES (
                ${x.Area.get()},
                "${std.Areas.load(x.Area.get()).Name.enGB.get()}",
                  ${x.Entrance.Map.get()}
                , ${x.Entrance.X.get()}
                , ${x.Entrance.Y.get()}
                , ${x.Entrance.Z.get()}
                , ${x.Entrance.O.get()}
            );
        `)
    })
})