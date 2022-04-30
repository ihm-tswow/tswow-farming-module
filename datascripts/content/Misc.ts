import { std } from "wow/wotlk";

export const CLARAS_FARM_AREA = std.Areas
    .create('farming-mod','claras-farm')
    .Name.enGB.set('Clara\'s Farm')
    .ParentArea.set(12)

// Delete 
std.CreatureInstances.queryAll({id:5917}).forEach(x=>x.delete())