import { PlayerCrops } from "./PlayerCrops";
import { PlayerObjects } from "./PlayerObjects";

@CharactersTable
export class PlayerFarm extends DBEntry {
    constructor(player: uint64) {
        super();
        this.player = player;
    }

    @DBPrimaryKey
    player: uint64 = 0

    @DBField
    area: uint32 = 0;

    isOpen: bool = false;

    Move(player: TSPlayer, area: uint32, price: uint32) {
        if(!player.TryReduceMoney(price)) return;
        this.area = area;
        PlayerCrops.get(player).forEach(x=>{
            x.Despawn(player.GetMap())
            x.Delete()
        });

        PlayerObjects.get(player).forEach(x=>{
            x.Despawn(player.GetMap());
            x.Delete();
        })
    }

    Open(player: TSPlayer) {
        this.isOpen = true;
        PlayerCrops.get(player).forEach(x=>x.Spawn(player));
        PlayerObjects.get(player).forEach(x=>x.Spawn(player));
        player.SetPhaseMask(player.GetPhaseMask(),true,player.GetGUID());
    }

    Update(player: TSPlayer) {
        PlayerCrops.get(player).forEach(x=>{
            if(x.GetActiveGOEntry() != x.spawnedEntry) {
                x.Despawn(player.GetMap())
                x.Spawn(player);
            }
        })
    }

    Close(player: TSPlayer) {
        this.isOpen = false;
        PlayerCrops.get(player).forEach(x=>x.Despawn(player.GetMap()));
        player.SetPhaseMask(player.GetPhaseMask(),true,0);
        if(!player.GetGroup().IsNull()) {
            player.GetGroup().GetMembers().forEach(x=>{
                if(x.GetPhaseID() == player.GetGUID()) {
                    x.SetPhaseMask(x.GetPhaseMask(),true,0);
                }
            })
        }
    }

    IsInFarm(player: TSPlayer): boolean {
        return player.GetAreaID() == this.area && player.GetPhaseID() == this.player;
    }

    static get(player: TSPlayer): PlayerFarm {
        return player.GetObject('FarmData', LoadDBEntry(new PlayerFarm(player.GetGUID())))
    }
}


export function RegisterPlayerFarm(events: TSEvents) {
    events.Player.OnLogin(player=>{
        PlayerFarm.get(player);
    })

    events.Player.OnSave(player=>{
        PlayerFarm.get(player).Save();
    })

    events.Player.OnUpdateZone((player,_,newArea)=>{
        let farm = PlayerFarm.get(player);
        if (newArea !== farm.area && farm.isOpen ) {
            if(farm.isOpen) farm.Close(player);
        }
    })

    events.Player.OnCommand((player,command,found)=>{
        if(command.get() == 'farm info') {
            found.set(true);
            player.SendBroadcastMessage(`Your farm is at ${PlayerFarm.get(player).area}`)
            return;
        }
        if(command.get() == 'farm enter') {
            found.set(true);
            let farm = PlayerFarm.get(player);
            if(player.GetAreaID() != farm.area) {
                player.SendBroadcastMessage(`You're not currently in your own farm.`);
            } else {
                player.SendBroadcastMessage(`Entering ${player.GetName()}'s farm`)
                farm.Open(player);
            }
            return;
        }

        if(command.get() == 'farm clean') {
            found.set(true);
            PlayerCrops.get(player).forEach(x=>{
                x.Despawn(player.GetMap())
                x.Delete();
            })
            PlayerObjects.get(player).forEach(x=>{
                x.Despawn(player.GetMap());
                x.Delete();
            })
            return;
        }

        if(command.get() == 'farm exit') {
            found.set(true);
            PlayerFarm.get(player).Close(player);
            return;
        }

        if(command.get() == 'farm-teleport') {
            found.set(true);
            PlayerFarm.get(player).area
        }

        if(command.get() == 'farm enchant') {
            found.set(true);
            let item = player.GetItemByEntry(4542)
            if(!item.IsNull()) {
                item.SetEnchantment(4000,0)
                item.SetEnchantment(4000,1)
            }
        }
    });

    // TODO: more efficient updates
    events.Maps.OnUpdate((map)=>{
        map.GetPlayers().forEach(x=>{
            let farm = PlayerFarm.get(x);
            if(farm.isOpen) {
                farm.Update(x);
            }
        })
    });
}