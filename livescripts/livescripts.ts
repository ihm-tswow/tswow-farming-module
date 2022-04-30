import { RegisterCropTypes } from "./DataStores/CropType";
import { RegisterEstateAgents } from "./DataStores/EstateAgents";
import { RegisterFarmAreas } from "./DataStores/FarmAreas";
import { RegisterPlayerCrops } from "./PlayerFarm/PlayerCrops";
import { RegisterPlayerFarm } from "./PlayerFarm/PlayerFarm";
import { RegisterPlayerObjects } from "./PlayerFarm/PlayerObjects";

export function Main(events: TSEvents) {
    RegisterFarmAreas(events);
    RegisterEstateAgents(events);
    RegisterCropTypes(events);
    RegisterPlayerFarm(events);
    RegisterPlayerCrops(events);
    RegisterPlayerObjects(events);
}