import { EstateAgent } from "../core/EstateAgent";
import { CLARAS_FARM } from "./Farms";

export const ELWYNN_AGENT = EstateAgent
    .create('farming-mod','elwynn-agent')
    .Name.enGB.set('Elwynn Agent')
    .Models.addIds(11898)
    .EstateAreas.add(CLARAS_FARM,100)
    .Spawns.add('farming-mod','elwynn-agent-spawn',[
        {map:0,x:-9453.135742,y:48.623283,z:56.908173,o:2.596932}
    ])