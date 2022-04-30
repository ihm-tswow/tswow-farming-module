import { PlayerFarm } from "./PlayerFarm";

@CharactersTable
export class PlayerObjects extends DBArrayEntry {
    constructor(player: uint64) {
        super();
        this.player = player;
    }

    @DBPrimaryKey
    player: uint64 = 0

    @DBField
    x: float = 0;

    @DBField
    y: float = 0;

    @DBField
    z: float = 0;

    @DBField
    o: float = 0;

    @DBField
    go: uint32 = 0;

    spawnMap: uint32 = 0;
    spawnGuid: uint64 = 0;

    Despawn(map: TSMap) {
        if(this.spawnGuid === 0 || this.spawnMap != map.GetMapID()) return;
        let go = map.GetGameObject(this.spawnGuid);
        if(!go.IsNull()) {
            go.RemoveFromWorld(false);
        }
        this.spawnGuid = 0;
        this.spawnMap = 0;
    }

    Spawn(player: TSPlayer) {
        if(this.spawnGuid != 0) {
            return;
        }
        let go = player.GetMap().SpawnGameObject(
              this.go
            , this.x
            , this.y
            , this.z
            , this.o)
        go.SetPhaseMask(1,true,player.GetGUID())
        this.spawnMap = player.GetMapID();
        this.spawnGuid = go.GetGUID();
    }

    static get(player :TSPlayer): DBContainer<PlayerObjects> {
        return player.GetObject(
              'PlayerObjects'
            , LoadDBArrayEntry(PlayerObjects,player.GetGUID())
        )
    }
}

export function RegisterPlayerObjects(events: TSEvents) {
    events.Player.OnLogin(player=>{
        PlayerObjects.get(player);
    })

    events.Player.OnSave(player=>{
        PlayerObjects.get(player).Save();
    })

    GetIDTag('farming-mod','farm-object-placer').forEach(x=>{
        events.SpellID.OnEffect(x,(spell,cancel,eff,mode)=>{
            cancel.set(true);
            if(mode !== 0) return;
            let player = spell.GetCaster().ToPlayer();
            if(player.IsNull()) return;

            if(!PlayerFarm.get(player).IsInFarm(player)) {
                player.SendNotification(`You can only use this spell in your own farm`)
                return;
            }
            const pos = spell.GetTargetDest();
            const obj = PlayerObjects.get(player).Add(new PlayerObjects(player.GetGUID()))
            obj.go = eff.GetMiscValue();
            obj.x = pos.x
            obj.y = pos.y
            obj.z = pos.z
            obj.o = player.GetO();
            obj.Spawn(player);
        });
    })
}