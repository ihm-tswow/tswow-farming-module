import { finish } from "wow";
import { CellSystem } from "wow/data/cell/systems/CellSystem";
import { std } from "wow/wotlk";
import { CreatureTemplate } from "wow/wotlk/std/Creature/CreatureTemplate";
import { FarmArea } from "./Farm";

// Agent table is used to track what agents sell what areas for what price
std.SQL.Databases.world_dest.writeEarly(`
    DROP TABLE IF EXISTS \`farming_agents\`;
    CREATE TABLE \`farming_agents\` (
        \`agent\` INT(10) NOT NULL,
        \`area\` INT(10) NOT NULL,
        \`price\` INT(10) NOT NULL,
        PRIMARY KEY(\`agent\`,\`area\`)
    );
`)

const areas: {agent: number, price: number, area: FarmArea}[] = []
export class EstateAgentAreas extends CellSystem<EstateAgent> {
    // TODO: make a real multirowsystem
    add(area: FarmArea, price: number) {
        areas.push({agent:this.owner.ID,area,price});
        return this.owner;
    }
}

export class EstateAgent extends CreatureTemplate {
    readonly EstateAreas = new EstateAgentAreas(this);
    static create(mod: string, id: string) {
        const agent = std.CreatureTemplates
            .create(mod,`farm-estate-agent-${id}`)
            .Subname.enGB.set('Farm Estate Agent')
            .NPCFlags.GOSSIP.set(true)
        return new EstateAgent(agent.row);
    }
}

finish('agent-areas',()=>{
    areas.forEach(({agent,area,price})=>{
        std.SQL.Databases.world_dest.write(`
            INSERT INTO \`farming_agents\` VALUES (
                ${agent},${area.Area.get()},${price}
            );
        `)
    });
})