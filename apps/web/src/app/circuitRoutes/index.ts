import { route as circuitBrusselsGrandPlaceLoop } from "./circuit_brussels_grand_place_loop.js";
import { route as circuitCanalLoop } from "./circuit_canal_loop.js";
import { route as circuitCapeTownWaterfrontLoop } from "./circuit_cape_town_waterfront_loop.js";
import { route as circuitCopenhagenHarborLoop } from "./circuit_copenhagen_harbor_loop.js";
import { route as circuitDocklandsSprint } from "./circuit_docklands_sprint.js";
import { route as circuitHarborSprint } from "./circuit_harbor_sprint.js";
import { route as circuitIstanbulBosphorusLoop } from "./circuit_istanbul_bosphorus_loop.js";
import { route as circuitLeftBankLoop } from "./circuit_left_bank_loop.js";
import { route as circuitLisbonBaixaLoop } from "./circuit_lisbon_baixa_loop.js";
import { route as circuitLondonThamesLoop } from "./circuit_london_thames_loop.js";
import { route as circuitMadridCentroLoop } from "./circuit_madrid_centro_loop.js";
import { route as circuitMitteDash } from "./circuit_mitte_dash.js";
import { route as circuitMonacoCasinoSprint } from "./circuit_monaco_casino_sprint.js";
import { route as circuitMonacoHarborLoop } from "./circuit_monaco_harbor_loop.js";
import { route as circuitMontrealIslandLoop } from "./circuit_montreal_island_loop.js";
import { route as circuitPortoBoavistaLoop } from "./circuit_porto_boavista_loop.js";
import { route as circuitPragueVltavaLoop } from "./circuit_prague_vltava_loop.js";
import { route as circuitRingSector } from "./circuit_ring_sector.js";
import { route as circuitRioFlamengoLoop } from "./circuit_rio_flamengo_loop.js";
import { route as circuitRomeTiberLoop } from "./circuit_rome_tiber_loop.js";
import { route as circuitSeoulYeouidoLoop } from "./circuit_seoul_yeouido_loop.js";
import { route as circuitStockholmGamlaStanLoop } from "./circuit_stockholm_gamla_stan_loop.js";
import { route as circuitTokyoBayLoop } from "./circuit_tokyo_bay_loop.js";
import { route as circuitViennaRingLoop } from "./circuit_vienna_ring_loop.js";

type CircuitRoute = Array<{ lat: number; lng: number }>;

export const CIRCUIT_ROUTES: Record<string, CircuitRoute> = {
  circuit_brussels_grand_place_loop: circuitBrusselsGrandPlaceLoop,
  circuit_canal_loop: circuitCanalLoop,
  circuit_cape_town_waterfront_loop: circuitCapeTownWaterfrontLoop,
  circuit_copenhagen_harbor_loop: circuitCopenhagenHarborLoop,
  circuit_docklands_sprint: circuitDocklandsSprint,
  circuit_harbor_sprint: circuitHarborSprint,
  circuit_istanbul_bosphorus_loop: circuitIstanbulBosphorusLoop,
  circuit_left_bank_loop: circuitLeftBankLoop,
  circuit_lisbon_baixa_loop: circuitLisbonBaixaLoop,
  circuit_london_thames_loop: circuitLondonThamesLoop,
  circuit_madrid_centro_loop: circuitMadridCentroLoop,
  circuit_mitte_dash: circuitMitteDash,
  circuit_monaco_casino_sprint: circuitMonacoCasinoSprint,
  circuit_monaco_harbor_loop: circuitMonacoHarborLoop,
  circuit_montreal_island_loop: circuitMontrealIslandLoop,
  circuit_porto_boavista_loop: circuitPortoBoavistaLoop,
  circuit_prague_vltava_loop: circuitPragueVltavaLoop,
  circuit_ring_sector: circuitRingSector,
  circuit_rio_flamengo_loop: circuitRioFlamengoLoop,
  circuit_rome_tiber_loop: circuitRomeTiberLoop,
  circuit_seoul_yeouido_loop: circuitSeoulYeouidoLoop,
  circuit_stockholm_gamla_stan_loop: circuitStockholmGamlaStanLoop,
  circuit_tokyo_bay_loop: circuitTokyoBayLoop,
  circuit_vienna_ring_loop: circuitViennaRingLoop
};
