import { finish } from "wow";
import { ContainerCell } from "wow/data/cell/cells/ContainerCell";
import { CellSystemTop } from "wow/data/cell/systems/CellSystem";
import { std } from "wow/wotlk";
import { GameObjectGoober } from "wow/wotlk/std/GameObject/GameObjectTemplate";
import { ItemTemplate } from "wow/wotlk/std/Item/ItemTemplate";
import { Spell } from "wow/wotlk/std/Spell/Spell";
import { FARMING } from "./Skill";

std.SQL.Databases.world_dest.writeEarly(`
    DROP TABLE IF EXISTS \`farming_crops\`;
    CREATE TABLE \`farming_crops\` (
        \`id\` INT(10) NOT NULL,
        \`stage0go\` INT(10) NOT NULL,
        \`stage1go\` INT(10) NOT NULL,
        \`stage2go\` INT(10) NOT NULL,
        \`stage1growth\` INT(10) NOT NULL,
        \`stage2growth\` INT(10) NOT NULL,
        \`spell\` INT(10) NOT NULL,
        \`item\` INT(10) NOT NULL,
        PRIMARY KEY(\`id\`)
    );
`)

const cropDataIds = std.IDs.CreateStatic('FarmingModCropData',1)

const crops: Crop[] = []

export class Crop extends CellSystemTop {
    readonly Stage0Go: GameObjectGoober
    readonly Stage1Go: GameObjectGoober
    readonly Stage2Go: GameObjectGoober

    readonly Stage1Growth: ContainerCell<number,this>
    readonly Stage2Growth: ContainerCell<number,this>

    readonly Spell: Spell;
    readonly Item: ItemTemplate;

    readonly ID: number
    readonly Name: string

    protected constructor(
        id: number,
        name: string,
        stage0Go: GameObjectGoober,
        stage1Go: GameObjectGoober,
        stage2Go: GameObjectGoober,
        stage1Growth: number,
        stage2Growth: number,
        spell: Spell,
        item: ItemTemplate
    ) {
        super();
        this.ID = id;
        this.Name = name;
        this.Stage0Go = stage0Go;
        this.Stage1Go = stage1Go;
        this.Stage2Go = stage2Go;
        this.Stage1Growth = new ContainerCell(this, stage1Growth);
        this.Stage2Growth = new ContainerCell(this, stage2Growth);
        this.Spell = spell;
        this.Item = item;
    }

    static create(
          id: string
        , displayName: string
        , stage0Model: string | {name: string, size: number}
        , stage1Model: string | {name: string, size: number}
        , stage2Model: string | {name: string, size: number}
        , stage0Growth: number
        , stage1Growth: number
    ) {

        const resolveModel = (value: string | {name: string, size: number}) => {
            return typeof(value) === 'string' ? {name:value,size:1} : value
        }

        const stage0ModelRes = resolveModel(stage0Model);
        const stage1ModelRes = resolveModel(stage1Model);
        const stage2ModelRes = resolveModel(stage2Model);

        const cropDataId = cropDataIds.id('farming-mod',`${id}-cropdata`);

        const stage0Go = std.GameObjectTemplates.Goobers
            .create('farming-mod',`farming-crop-${id}-stage0`)
            .Name.enGB.set(`${displayName} Seeds`)
            .Size.set(stage0ModelRes.size)
            .Display.modRefCopy(value=>{value
                .ModelName.set(stage0ModelRes.name)
                .GeoBox.set(5)
            })

        const stage1go = std.GameObjectTemplates.Goobers
            .create('farming-mod',`farming-crop-${id}-stage1`)
            .Name.enGB.set(displayName)
            .Size.set(stage1ModelRes.size)
            .Display.modRefCopy(value=>value
                .ModelName.set(stage1ModelRes.name)
                .GeoBox.set(5)
            )

        const stage2go = std.GameObjectTemplates.Goobers
            .create('farming-mod',`farming-crop-${id}-stage2`)
            .Name.enGB.set(displayName)
            .Size.set(stage2ModelRes.size)
            .Display.modRefCopy(value=>value
                .ModelName.set(stage2ModelRes.name)
                .GeoBox.set(5)
            )

        const plantSpell = std.Spells
            .create('farming-mod',`farming-plant-${id}`)
            .Name.enGB.set(`Plant ${displayName}`)
            .Description.enGB.set(`Plants a ${displayName}.`)
            .CastTime.setSimple(1000)
            .InterruptFlags.ON_MOVEMENT.set(true)
            .Priority.set(cropDataId)
            .Tags.add('farming-mod','plant-crop')
            .Visual.modRefCopy(visual=>{
                visual.CastKit.getRefCopy()
                    .Animation.KNEEL_END.set()

                visual.PrecastKit.getRefCopy()
                    .Animation.KNEEL_LOOP.set()
                    .StartAnimation.KNEEL_START.set()
            })

            const item = std.Items
                .create('farming-mod',`${id}-item`)
                .Name.enGB.set(`${displayName} Seeds`)
                .DisplayInfo.set(1443)
                .Requirements.Skill.set(FARMING.ID,5)
                .Quality.WHITE.set().Spells.
                    addMod(spell=>{spell
                        .Spell.modRefCopy('farming-mod',`farming-plant-${id}`,
                            (spell)=>spell
                                .Name.enGB.set(`Plant ${displayName}`)
                                .Description.enGB.set(`Plants a ${displayName}.`)
                                .CastTime.setSimple(1000)
                                .InterruptFlags.ON_MOVEMENT.set(true)
                                .Priority.set(cropDataId)
                                .Tags.add('farming-mod','plant-crop')
                                .Visual.modRefCopy(visual=>{visual
                                    .CastKit.modRefCopy(ck=>ck.Animation.KNEEL_END.set())
                                    .PrecastKit.modRefCopy(pck=>pck
                                        .Animation.KNEEL_LOOP.set()
                                        .StartAnimation.KNEEL_START.set())
                                }))
                                .Trigger.ON_USE.set()
                            })

        let crop = new Crop(cropDataId,displayName,stage0Go,stage1go,stage2go,stage0Growth,stage1Growth,plantSpell,item)
        crops.push(crop);
        return crop;
    }
}

finish('farming-crops',()=>{
    crops.forEach(x=>{
        std.SQL.Databases.world_dest.write(`
            INSERT INTO \`farming_crops\` VALUES (
                ${x.ID},
                ${x.Stage0Go.ID},
                ${x.Stage1Go.ID},
                ${x.Stage2Go.ID},
                ${x.Stage1Growth.get()},
                ${x.Stage2Growth.get()},
                ${x.Spell.ID},
                ${x.Item.ID}
            );
        `)
    })
});