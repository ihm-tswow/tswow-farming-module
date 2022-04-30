import { PlayerFarm } from "../PlayerFarm/PlayerFarm";
import { FarmAreas } from "./FarmAreas";

export class EstateAgent {
    areas: TSDictionary<uint32,uint32> = CreateDictionary<uint32,uint32>({})
}

export const EstateAgents: TSDictionary<uint32,EstateAgent>
    = CreateDictionary<uint32,EstateAgent>({})

export function RegisterEstateAgents(events: TSEvents) {
    ASSERT_WORLD_TABLE('farming_agents','iii')
    let res = QueryWorld('SELECT * from `farming_agents`;');
    while(res.GetRow()) {
        let agent = res.GetUInt32(0);
        let area = res.GetUInt32(1);
        let price = res.GetUInt32(2);
        if(!EstateAgents.contains(agent)) {
            EstateAgents[agent] = new EstateAgent();
        }
        let agentObj = EstateAgents[agent];
        agentObj.areas[area] = price;
    }

    EstateAgents.forEach((key)=>{
        events.CreatureID.OnGossipHello(key,(creature,player,cancel)=>{
            cancel.set(true);
            player.GossipClearMenu();
            let value = EstateAgents[creature.GetEntry()]
            value.areas.forEach((area,price)=>{
                let areaName = FarmAreas[area].name;
                player.GossipMenuAddItem(
                      GossipOptionIcon.CHAT
                    , `${areaName}`
                    , 0
                    , area
                    , false
                    , `Do you really want to purchase a new farm at ${areaName}? Your current farm will be sold and all your items in it will be destroyed.`
                    , price
                )
            });
            player.GossipSendTextMenu(creature,`Hi, would you like to purchase a farm? `)
        });

        events.CreatureID.OnGossipSelect(key,(creature,player,menu,selection)=>{
            if(!EstateAgents.contains(creature.GetEntry())) return;
            let agent = EstateAgents[creature.GetEntry()];
            if(!agent.areas.contains(selection)) return;
            let price = agent.areas[selection];
            if(!player.TryReduceMoney(price)) return;
            PlayerFarm.get(player).Move(player,selection,agent.areas[selection]);
            player.GossipClearMenu();
            player.GossipSendTextMenu(creature,`You purchased ${selection}!`)
        });
    });
}