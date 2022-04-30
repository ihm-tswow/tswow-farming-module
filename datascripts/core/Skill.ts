import { std } from "wow/wotlk";

export const FARMING_LOCK = std.LockTypes.create()
    .ResourceName.enGB.set('Crop')

export const FARMING = std.Professions
    .create('farming-mod','farming-skill')
    .Name.enGB.set('Farming')
    .GatheringSpells.addMod(
          'farming-mod'
        , 'gathering-spell'
        , FARMING_LOCK.ID
    )

export const APPRENTICE_FARMING = FARMING.Ranks
    .addGet('farming-mod','apprentice-farming',75,{enGB:'Apprentice'})

export const JOURNEYMAN_FARMING = FARMING.Ranks
    .addGet('farming-mod','journeyman-farming',150,{enGB:'Journeyman'})

export const EXPERT_FARMING = FARMING.Ranks
    .addGet('farming-mod','expert-farming',225,{enGB:'Expert'})

export const ARTISAN_FARMING = FARMING.Ranks
    .addGet('farming-mod','artisan-farming',300,{enGB:'Artisan'})

export const MASTER_FARMING = FARMING.Ranks
    .addGet('farming-mod','master-farming',375,{enGB:'Master'})

export const GRANDMASTER_FARMING = FARMING.Ranks
    .addGet('farming-mod','grandmaster-farming',450,{enGB:'Grand Master'})