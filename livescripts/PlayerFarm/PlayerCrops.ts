import { CropType, CropTypes } from "../DataStores/CropType";
import { PlayerFarm } from "./PlayerFarm";

@CharactersTable
export class PlayerCrops extends DBArrayEntry {
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
    spawnTime: uint64 = 0;

    @DBField
    type: uint32 = 0;

    spawnMap: uint32 = 0;
    spawnGuid: uint64 = 0;
    spawnedEntry: uint32 = 0;

    GetActiveGOEntry(): uint32 {
        let type = this.GetType();
        let timeElapsed = GetUnixTime() - this.spawnTime;
        return (timeElapsed > type.stage1Growth + type.stage2Growth)
            ? type.stage2Go
            : (timeElapsed > type.stage1Growth)
            ? type.stage1Go
            : type.stage0Go
    }

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
              this.GetActiveGOEntry()
            , this.x
            , this.y
            , this.z
            , this.o)
        go.SetPhaseMask(1,true,player.GetGUID())
        this.spawnMap = player.GetMapID();
        this.spawnGuid = go.GetGUID();
        this.spawnedEntry = go.GetEntry();
    }

    GetType(): CropType {
        return CropTypes[this.type];
    }

    static get(player :TSPlayer): DBContainer<PlayerCrops> {
        return player.GetObject(
              'CropData'
            , LoadDBArrayEntry(PlayerCrops,player.GetGUID())
        )
    }
}

export function RegisterPlayerCrops(events: TSEvents) {
    events.Player.OnLogin(player=>{
        PlayerCrops.get(player);
    })

    events.Player.OnSave(player=>{
        PlayerCrops.get(player).Save();
    })

    GetIDTag('farming-mod','plant-crop').forEach(x=>{
        events.SpellID.OnCast(x,spell=>{
            let player = spell.GetCaster().ToPlayer();
            if(player.IsNull()) return;
            if(!PlayerFarm.get(player).IsInFarm(player)) {
                player.SendBroadcastMessage(`You can only use this in your own farm!`)
                return
            }
            let cropData = PlayerCrops.get(player);
            if(cropData.Size() > 10) {
                player.SendBroadcastMessage(`You already have more than 10 crops active!`);
                return;
            }
            let crop = cropData.Add(new PlayerCrops(player.GetGUID()))
            crop.x = player.GetX();
            crop.y = player.GetY();
            crop.z = player.GetZ();
            crop.o = player.GetO();
            crop.spawnTime = GetUnixTime();
            crop.type = spell.GetSpellInfo().GetPriority();
            crop.MarkDirty();
            crop.Spawn(player)
        });
    })
}