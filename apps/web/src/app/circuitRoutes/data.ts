import { route as circuitAccraIndependenceAvenue } from "./circuit_accra_independence_avenue.js";
import { route as circuitAddisAbabaMeskelSquare } from "./circuit_addis_ababa_meskel_square.js";
import { route as circuitAucklandViaductLoop } from "./circuit_auckland_viaduct_loop.js";
import { route as circuitBastiaCitadelLoop } from "./circuit_bastia_citadel_loop.js";
import { route as circuitBattery } from "./circuit_battery.js";
import { route as circuitBrisbaneRiverCity } from "./circuit_brisbane_river_city.js";
import { route as circuitBrusselsGrandPlaceLoop } from "./circuit_brussels_grand_place_loop.js";
import { route as circuitBuenosAiresPark } from "./circuit_buenos_aires_park.js";
import { route as circuitBund } from "./circuit_bund.js";
import { route as circuitCairoNileCorniche } from "./circuit_cairo_nile_corniche.js";
import { route as circuitCanalLoop } from "./circuit_canal_loop.js";
import { route as circuitCannesHoussamLoop } from "./circuit_cannes_houssam_loop.js";
import { route as circuitCapeTownCoastRun } from "./circuit_cape_town_coast_run.js";
import { route as circuitCapeTownWaterfrontLoop } from "./circuit_cape_town_waterfront_loop.js";
import { route as circuitCasablancaAtlanticBoulevard } from "./circuit_casablanca_atlantic_boulevard.js";
import { route as circuitCopenhagenHarborLoop } from "./circuit_copenhagen_harbor_loop.js";
import { route as circuitDakarCornicheOuest } from "./circuit_dakar_corniche_ouest.js";
import { route as circuitDanube } from "./circuit_danube.js";
import { route as circuitDarlingHarbour } from "./circuit_darling_harbour.js";
import { route as circuitDocklandsSprint } from "./circuit_docklands_sprint.js";
import { route as circuitDotonbori } from "./circuit_dotonbori.js";
import { route as circuitDubaiMarina } from "./circuit_dubai_marina.js";
import { route as circuitEmbarcadero } from "./circuit_embarcadero.js";
import { route as circuitEsplanadi } from "./circuit_esplanadi.js";
import { route as circuitGrandHarbour } from "./circuit_grand_harbour.js";
import { route as circuitHarborSprint } from "./circuit_harbor_sprint.js";
import { route as circuitHelsinkiIcebreak } from "./circuit_helsinki_icebreak.js";
import { route as circuitIstanbulBosphorusLoop } from "./circuit_istanbul_bosphorus_loop.js";
import { route as circuitJordaan } from "./circuit_jordaan.js";
import { route as circuitKigaliHillsideTechnical } from "./circuit_kigali_hillside_technical.js";
import { route as circuitKyotoNeonLoop } from "./circuit_kyoto_neon_loop.js";
import { route as circuitLagosVictoriaIsland } from "./circuit_lagos_victoria_island.js";
import { route as circuitLakefront } from "./circuit_lakefront.js";
import { route as circuitLeftBankLoop } from "./circuit_left_bank_loop.js";
import { route as circuitLisbonBaixaLoop } from "./circuit_lisbon_baixa_loop.js";
import { route as circuitLisbonTramline } from "./circuit_lisbon_tramline.js";
import { route as circuitLondonThamesLoop } from "./circuit_london_thames_loop.js";
import { route as circuitLungomare } from "./circuit_lungomare.js";
import { route as circuitMadero } from "./circuit_madero.js";
import { route as circuitMadridCentroLoop } from "./circuit_madrid_centro_loop.js";
import { route as circuitMaputoBaixaWaterfront } from "./circuit_maputo_baixa_waterfront.js";
import { route as circuitMarina } from "./circuit_marina.js";
import { route as circuitMarrakechHeatRing } from "./circuit_marrakech_heat_ring.js";
import { route as circuitMelbourneDocklandsGp } from "./circuit_melbourne_docklands_gp.js";
import { route as circuitMitteDash } from "./circuit_mitte_dash.js";
import { route as circuitMonacoCasinoSprint } from "./circuit_monaco_casino_sprint.js";
import { route as circuitMonacoHarborLoop } from "./circuit_monaco_harbor_loop.js";
import { route as circuitMontrealIslandLoop } from "./circuit_montreal_island_loop.js";
import { route as circuitNairobiUhuruRing } from "./circuit_nairobi_uhuru_ring.js";
import { route as circuitOceanDrive } from "./circuit_ocean_drive.js";
import { route as circuitPerthSwanRiverLoop } from "./circuit_perth_swan_river_loop.js";
import { route as circuitPlaka } from "./circuit_plaka.js";
import { route as circuitPortoBoavistaLoop } from "./circuit_porto_boavista_loop.js";
import { route as circuitPragueVltavaLoop } from "./circuit_prague_vltava_loop.js";
import { route as circuitReforma } from "./circuit_reforma.js";
import { route as circuitReykjavikHarborSprint } from "./circuit_reykjavik_harbor_sprint.js";
import { route as circuitRingSector } from "./circuit_ring_sector.js";
import { route as circuitRioFlamengoLoop } from "./circuit_rio_flamengo_loop.js";
import { route as circuitRomeTiberLoop } from "./circuit_rome_tiber_loop.js";
import { route as circuitRoyalMile } from "./circuit_royal_mile.js";
import { route as circuitSeoulOverpassGp } from "./circuit_seoul_overpass_gp.js";
import { route as circuitSeoulYeouidoLoop } from "./circuit_seoul_yeouido_loop.js";
import { route as circuitSingaporeDockNights } from "./circuit_singapore_dock_nights.js";
import { route as circuitStockholmGamlaStanLoop } from "./circuit_stockholm_gamla_stan_loop.js";
import { route as circuitTokyoBayLoop } from "./circuit_tokyo_bay_loop.js";
import { route as circuitTunisCarthageCoast } from "./circuit_tunis_carthage_coast.js";
import { route as circuitVancouverRainway } from "./circuit_vancouver_rainway.js";
import { route as circuitVictoria } from "./circuit_victoria.js";
import { route as circuitViennaRingLoop } from "./circuit_vienna_ring_loop.js";
import { route as circuitVieuxPort } from "./circuit_vieux_port.js";
import { route as circuitWellingtonWaterfrontWind } from "./circuit_wellington_waterfront_wind.js";

type CircuitRoute = Array<{ lat: number; lng: number }>;

export const CIRCUIT_ROUTES: Record<string, CircuitRoute> = {
  circuit_accra_independence_avenue: circuitAccraIndependenceAvenue,
  circuit_addis_ababa_meskel_square: circuitAddisAbabaMeskelSquare,
  circuit_auckland_viaduct_loop: circuitAucklandViaductLoop,
  circuit_bastia_citadel_loop: circuitBastiaCitadelLoop,
  circuit_battery: circuitBattery,
  circuit_brisbane_river_city: circuitBrisbaneRiverCity,
  circuit_brussels_grand_place_loop: circuitBrusselsGrandPlaceLoop,
  circuit_buenos_aires_park: circuitBuenosAiresPark,
  circuit_bund: circuitBund,
  circuit_cairo_nile_corniche: circuitCairoNileCorniche,
  circuit_canal_loop: circuitCanalLoop,
  circuit_cannes_houssam_loop: circuitCannesHoussamLoop,
  circuit_cape_town_coast_run: circuitCapeTownCoastRun,
  circuit_cape_town_waterfront_loop: circuitCapeTownWaterfrontLoop,
  circuit_casablanca_atlantic_boulevard: circuitCasablancaAtlanticBoulevard,
  circuit_copenhagen_harbor_loop: circuitCopenhagenHarborLoop,
  circuit_dakar_corniche_ouest: circuitDakarCornicheOuest,
  circuit_danube: circuitDanube,
  circuit_darling_harbour: circuitDarlingHarbour,
  circuit_docklands_sprint: circuitDocklandsSprint,
  circuit_dotonbori: circuitDotonbori,
  circuit_dubai_marina: circuitDubaiMarina,
  circuit_embarcadero: circuitEmbarcadero,
  circuit_esplanadi: circuitEsplanadi,
  circuit_grand_harbour: circuitGrandHarbour,
  circuit_harbor_sprint: circuitHarborSprint,
  circuit_helsinki_icebreak: circuitHelsinkiIcebreak,
  circuit_istanbul_bosphorus_loop: circuitIstanbulBosphorusLoop,
  circuit_jordaan: circuitJordaan,
  circuit_kigali_hillside_technical: circuitKigaliHillsideTechnical,
  circuit_kyoto_neon_loop: circuitKyotoNeonLoop,
  circuit_lagos_victoria_island: circuitLagosVictoriaIsland,
  circuit_lakefront: circuitLakefront,
  circuit_left_bank_loop: circuitLeftBankLoop,
  circuit_lisbon_baixa_loop: circuitLisbonBaixaLoop,
  circuit_lisbon_tramline: circuitLisbonTramline,
  circuit_london_thames_loop: circuitLondonThamesLoop,
  circuit_lungomare: circuitLungomare,
  circuit_madero: circuitMadero,
  circuit_madrid_centro_loop: circuitMadridCentroLoop,
  circuit_maputo_baixa_waterfront: circuitMaputoBaixaWaterfront,
  circuit_marina: circuitMarina,
  circuit_marrakech_heat_ring: circuitMarrakechHeatRing,
  circuit_melbourne_docklands_gp: circuitMelbourneDocklandsGp,
  circuit_mitte_dash: circuitMitteDash,
  circuit_monaco_casino_sprint: circuitMonacoCasinoSprint,
  circuit_monaco_harbor_loop: circuitMonacoHarborLoop,
  circuit_montreal_island_loop: circuitMontrealIslandLoop,
  circuit_nairobi_uhuru_ring: circuitNairobiUhuruRing,
  circuit_ocean_drive: circuitOceanDrive,
  circuit_perth_swan_river_loop: circuitPerthSwanRiverLoop,
  circuit_plaka: circuitPlaka,
  circuit_porto_boavista_loop: circuitPortoBoavistaLoop,
  circuit_prague_vltava_loop: circuitPragueVltavaLoop,
  circuit_reforma: circuitReforma,
  circuit_reykjavik_harbor_sprint: circuitReykjavikHarborSprint,
  circuit_ring_sector: circuitRingSector,
  circuit_rio_flamengo_loop: circuitRioFlamengoLoop,
  circuit_rome_tiber_loop: circuitRomeTiberLoop,
  circuit_royal_mile: circuitRoyalMile,
  circuit_seoul_overpass_gp: circuitSeoulOverpassGp,
  circuit_seoul_yeouido_loop: circuitSeoulYeouidoLoop,
  circuit_singapore_dock_nights: circuitSingaporeDockNights,
  circuit_stockholm_gamla_stan_loop: circuitStockholmGamlaStanLoop,
  circuit_tokyo_bay_loop: circuitTokyoBayLoop,
  circuit_tunis_carthage_coast: circuitTunisCarthageCoast,
  circuit_vancouver_rainway: circuitVancouverRainway,
  circuit_victoria: circuitVictoria,
  circuit_vienna_ring_loop: circuitViennaRingLoop,
  circuit_vieux_port: circuitVieuxPort,
  circuit_wellington_waterfront_wind: circuitWellingtonWaterfrontWind
};
