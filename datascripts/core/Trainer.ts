import { std } from "wow/wotlk";
import { Position } from "wow/wotlk/std/Misc/Position";
import { APPRENTICE_FARMING, FARMING, JOURNEYMAN_FARMING } from "./Skill";

export class FarmingTrainer {
    static create(id: string, displayId: number, name: string, pos: Position) {
        return std.CreatureTemplates
            .create('farming-mod',id)
            .NPCFlags.TRAINER.set(true)
            .NPCFlags.GOSSIP.set(true)
            .NPCFlags.VENDOR.set(true)
            .Models.addIds(displayId)
            .Name.enGB.set(name)
            .Subname.enGB.set('Farming Trainer')
            .Spawns.add('farming-mod',`${id}-spawn`,[pos])
            .Trainer.modRefCopy(trainer=>{
                trainer.Spells.addGet(APPRENTICE_FARMING.LearnSpells()[0].ID)
                    .RequiredLevel.set(5)

                trainer.Spells.addGet(JOURNEYMAN_FARMING.LearnSpells()[0].ID)
                    .RequiredLevel.set(10)
                    .RequiredSkill.set(FARMING.ID,50)
                    .ReqAbilities.addId(APPRENTICE_FARMING.ProfessionSpell().ID)
            })
        }
}