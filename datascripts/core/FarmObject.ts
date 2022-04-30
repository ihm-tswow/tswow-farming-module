import { ObjContainerCell } from "wow/data/cell/cells/ContainerCell";
import { std } from "wow/wotlk";
import { GameObjectPlain } from "wow/wotlk/std/GameObject/GameObjectTemplate";
import { ItemTemplate } from "wow/wotlk/std/Item/ItemTemplate";
import { Spell } from "wow/wotlk/std/Spell/Spell";

export class FarmObject {
    readonly GameObject: ObjContainerCell<GameObjectPlain,this>
    readonly Spell: ObjContainerCell<Spell,this>
    readonly Item: ObjContainerCell<ItemTemplate,this>

    protected constructor(obj: GameObjectPlain, spell: Spell, item: ItemTemplate) {
        this.GameObject = new ObjContainerCell(this,obj);
        this.Spell = new ObjContainerCell(this,spell);
        this.Item = new ObjContainerCell(this,item);
    }

    static create(registryName: string, name: string, icon: string) {
        const go = std.GameObjectTemplates.Generic
            .create('farming-mod',registryName)
            .Name.enGB.set(name)

        const spell = std.Spells
            .create('farming-mod',`farm-object-${registryName}-spell`)
            .Name.enGB.set(name)
            .Description.enGB.set(`Places a ${name} in your farm`)
            .Range.setSimple(0,500)
            .Priority.set(go.ID)
            .TargetType.DEST_LOCATION.set(true)
            .Tags.add('farming-mod','farm-object-placer')
            .Effects.addMod(effect=>effect
                .Type.TRANS_DOOR.set()
                .GOTemplate.set(go.ID)
                .ImplicitTargetA.DEST_DEST.set()
            )

        const item = std.Items
            .create('farming-mod',`${registryName}-item`)
            .Name.enGB.set(name)
            .DisplayInfo.setSimpleIcon(icon)
            .Quality.WHITE.set()
            .Spells.addMod(ispell=>ispell
                .Charges.set(1,'DELETE_ITEM')
                .Spell.set(spell.ID)
                .Trigger.ON_USE.set()
            )

        return new FarmObject(go,spell,item);
    }
}