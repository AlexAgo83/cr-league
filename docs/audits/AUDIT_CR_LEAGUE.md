# CR League — Audit produit / UX / game design

> Diagnostic seul. Aucun code ni doc Logics n'a été modifié. Le code est la source de vérité ; la review et les documents fournis servent de contexte. Backlog proposé en fin de document, prêt à scaffolder après validation.
>
> Base analysée : `v0.3.26` (branche `main`). Sources croisées : lecture directe du moteur (`packages/shared/src/simulation`, `domain`, `economy`, `cards`), des écrans (`apps/web/src`), des qualifs (`apps/api`), des données d'équilibrage de l'équipe (`reports/balance/latest.json`), de la roadmap et des ADR.

---

## 1. Executive Summary

### Le constat central : la review teste un build antérieur

Le testeur ouvre avec « il y a des trucs qui n'ont pas trop changé par rapport à avant ». C'est la clé de lecture de tout l'audit. **La majorité de ses frictions UX sont déjà corrigées dans les patchs 0.3.16 → 0.3.26** (bouton de lancement, retour chrono, recap causal, météo sur la carte, vocabulaire et couleurs des stats, consultation des cartes, onboarding). Les prendre au pied de la lettre reviendrait à re-livrer du déjà-livré.

Mais sous les symptômes obsolètes, **quatre causes racines réelles et confirmées dans le code** subsistent — et aucune n'a été traitée par le vernis de lisibilité des derniers patchs, parce qu'elles sont dans le *modèle*, pas dans l'habillage.

### Les 4 causes racines (confirmées code)

**A. La simulation ne différencie pas ses propres entrées.** Les trois traits de circuit (Adhérence / Attaque / Endurance) partagent **une seule et même forme mathématique** — `(trait − 60) × score_joueur / 650` (`simulateRace.ts:638-642`) — et cette interaction pèse **~10× moins** que les termes plats de `pace` ajoutés à chaque segment (coeffs 0.2–0.45 sur des scores de 40–70). Résultat : `pace` domine, l'identité du circuit est un facteur d'arrondi. **Les données d'équilibrage de l'équipe le prouvent** : 9,45 points d'écart entre la meilleure stratégie (`balanced/speed/rain_grip` = 13.04) et la pire (`prudent/weather/fleet_sponsorship` = 3.59), « prudent » est un piège systématique, « speed » bat « reliability » en moyenne. → Le joueur ne *peut pas* sentir que vitesse/endurance/adhérence diffèrent : dans les maths, ils diffèrent à peine. **Aucun relabel UI ne corrige un modèle plat.**

**B. Les magnitudes sont cachées partout.** Le moteur applique des nombres durs (rain_grip = +26 si pluie / −4 sinon ; calculated_attack = +24 si écart ≤ 3.0 s / +6 sinon) que le joueur **ne voit jamais**. Les cartes n'affichent qu'une direction (« + Grip / − Att. ») et une promesse en prose (« Pays off if rain appears around mid-race »). Les traits circuit s'affichent en 0–100 mais sans conversion vers le résultat. → « on ne sait pas ce que fait vraiment la carte », « on ne sait pas à quel point la condition pluie est stricte », « on ne sait pas à quel point les changements ont un impact ». Les nombres **existent et sont déterministes** — ils ne sont simplement pas exposés.

**C. Aucune comparaison avec les autres joueurs.** Les configs adverses ne sont visibles que sous forme de **points abstraits** (3 pastilles approche/prépa/pit), jamais chiffrées, nulle part. C'est la demande la plus enthousiaste du testeur (« ce qui manque de fou »). **C'est le seul vrai manque non planifié** dans toute la roadmap — un slot propre.

**D. Sémantique météo illisible + fissures de déterminisme.** La timeline nuages n'affiche que le *nom* de la météo résolue (pas de distinction « pluie maintenant » vs « probabilité avant course ») ; le point orange « rythme chrono » n'a aucune légende. Pire : **les qualifs utilisent `Math.random()` + `new Date()`** (`qualifying.ts:62,66`) alors qu'un `seed` est disponible — le chrono **n'est pas reproductible**, ce qui casse la boucle « je lance un chrono pour apprendre mon réglage » que le testeur cherche justement, et contredit l'ADR-004 (déterminisme).

### Ce qu'il faut challenger dans la review

| Proposition du testeur | Verdict code | Réponse |
|---|---|---|
| « Tu dépenses beaucoup de tokens dans des recaps LLM » | **FAUX** | Zéro LLM dans tout le dépôt (aucune dépendance, aucune clé, aucun appel). Et c'est une **décision produit explicite** (`prod_005`, `prod_020` : « no LLM, cost/latency/dependency »). Les recaps sont des templates déterministes i18n. Coût token = 0. Ne pas construire de LLM. |
| « Score 4/4 alors que 8e » | **N'existe pas** | Aucune note /4 dans le code. Le « 4/4 » perçu = la grille de recap affiche **toujours 4 cartes** quelle que soit la perf (`ReportView.tsx:46-67`). Illusion de note pleine. À corriger côté présentation, pas côté scoring. |
| « Montrer la meilleure carte / le bon réglage » | **À refuser en l'état** | Violerait le principe « expliquer les règles, jamais la solution » (Decisions_Log). Le bon correctif à la confusion cartes = exposer **magnitudes + conditions objectives**, pas des recommandations. Aligné pilier design. |
| « Voir les configs des autres » | **VALIDE & aligné** | Comparaison + information objective = piliers design. Feu vert franc. |

### Opportunités majeures (par ordre de levier)

1. **Rendre la course lisible avant de la rendre profonde** — exposer les magnitudes de cartes et les conditions de déclenchement (cause B) : quasi zéro risque, pur gain de compréhension, ne touche pas la sim.
2. **Réparer le déterminisme des qualifs** (cause D) : bug de correction + restaure la boucle d'apprentissage. Petit patch, fort impact.
3. **Comparaison des configs adverses** (cause C) : la fonctionnalité « waouh » manquante, alignée design, différenciante.
4. **Faire diverger réellement les trois stats et les stratégies** (cause A) : le chantier le plus profond ; à piloter par les sims d'équilibrage (0.5, evidence-gated). Sans lui, toute la promesse « décisions fortes / profondeur » reste plafonnée.

---

## 2. Audit Produit

### Vision vs réalité du code

La vision (Decisions_Log) : stratégie asynchrone, parties courtes, décisions fortes, profondeur progressive, plaisir d'optimiser, comparaison entre joueurs, peu de micro-management. Le code livre **la structure** de cette vision (boucle plan → chrono → course → replay → garage → saison, tout déterministe côté course) mais **pas encore la substance décisionnelle** :

- **« Décisions fortes »** — partiellement contredit. Le modèle récompense un axe dominant (pace/attaque). Une « décision forte » suppose des dilemmes réels ; les données montrent surtout un gradient bon→mauvais, pas un éventail de choix contextuels. Prudent = mauvais partout ; c'est un faux choix, pas un dilemme.
- **« Plaisir d'optimiser »** — bridé par la cause B : on ne peut pas optimiser ce qu'on ne peut pas mesurer. L'optimiseur n'a ni les magnitudes des cartes, ni un chrono reproductible pour isoler l'effet d'un réglage.
- **« Comparaison entre joueurs »** — structurellement absente (cause C). Le seul comparatif est « votre réglage vs celui du vainqueur » dans le rapport (`helpers.ts:346-381`), déjà bien fait, mais pas un comparatif de champ.
- **« Peu de micro-management »** — respecté, voire trop : peu de leviers, donc peu de matière à optimiser. Le risque n'est pas la surcharge mais la **minceur perçue** une fois la nouveauté passée.

### Économie

- Départ 180 crédits (humains) ; récompenses `[150,130,115,105,100,100]` + bonus comeback (+10/pos, cap 40) ; points `[25,18,15,12,10,8]` puis **0 dès la 7e place**.
- Cartes = consommables (bankables, consommées à l'usage, revente à moitié prix). Prix 120 (×5), 180 (×3), 250 (×6), 500 (×1).
- **Déséquilibres confirmés** : `rain_grip` (120) domine quasi strictement `rain_mapping` (250) — même condition, plus gros payoff, moitié prix. `adjustable_wing` (500) est le piège : pire ROI, `launch_boost` (180) fait mieux. `pit_relay` (250) est la meilleure affaire (late +15/+6/+8, **sans contrepartie**). Plusieurs cartes **re-vendent des leviers gratuits** : `approach: aggressive` donne déjà +16 pace/+16 aggr, `preparation: reliability` +12 reliab — les mêmes stats que soft/hard tires vendues 180–250.
- **Fausse monnaie — OBSOLÈTE (corrigé depuis l'audit).** À l'origine, les points de championnat étaient rendus avec la même puce que les crédits dans le portefeuille du garage. Vérification code actuel : le header n'affiche plus que les crédits (`GarageView.tsx:135-136`) ; la seule occurrence points restante (`:186`) est une ligne de gains de course signée (`+X`), un relevé de récompense légitime, pas un portefeuille. La confusion « on dirait une monnaie » du testeur portait sur un build antérieur. (Pas de « points d'ingénierie » non plus — cette ressource n'a jamais existé.)

### IA / coût

Aucun LLM. Le script `playtest:ai` est un bot à règles, pas un modèle. Le coût token perçu est inexistant. La décision « pas de LLM » est documentée et cohérente avec les contraintes (coûts, latence, dépendances). **Recommandation : ne pas revenir dessus** ; investir plutôt dans les templates déterministes existants (élaguer le remplissage générique, s'appuyer sur les données causales déjà calculées).

---

## 3. UX Review (écran par écran)

Verdicts croisés code ↔ review. Légende : **EXISTE** (friction réelle aujourd'hui) · **CORRIGÉ** (déjà livré) · **MAL INTERPRÉTÉ** · **OBSOLÈTE**.

### Plan / Directive (`PlanView`, `DirectivePanel`, `MapPlanPanel`)
- **Lancement** — *MAL INTERPRÉTÉ, friction résiduelle réelle.* Le testeur croit devoir passer par « Standings → Nouveau GP ». Faux : Standings ne peut rien lancer. Le bouton primaire vit sur la vue « Stand » (`DriveView` → `action_launch_grand_prix`) et sur le sous-onglet **GP** du plan. **Mais** l'onglet d'édition de la directive lui-même n'a **aucun** bouton lancer/envoyer inline (`DirectivePanel` ne reçoit jamais `primaryCommand`) → le joueur doit changer d'onglet pour agir. Friction réelle, ciblée, mineure.
- **Stats circuit** — *PARTIELLEMENT EXISTE.* Adhérence/Attaque/Endurance sont chiffrées 0–100 (`CircuitMap.tsx:565`) + modificateur signé + niveau (`DirectivePanel.tsx:213-221`). Mais aucun énoncé « ce circuit favorise X », et surtout aucune conversion vers l'issue (cause A/B).

### Chrono (`PlanView` sous-onglet Chrono, `DriveView`)
- **Retour au plan** — *MAL INTERPRÉTÉ.* La barre de sous-onglets est toujours affichée → retour au plan en 1 clic. Pas de cul-de-sac. La friction « je suis bloqué dans le rapport » vient probablement d'un build antérieur.
- **Non-déterminisme** — *EXISTE (bug).* `Math.random()` dans les temps au tour → deux chronos identiques donnent des temps différents. Casse l'apprentissage « réglage → temps ». **Non signalé par le testeur mais cause profonde de son « c'est flou de comprendre la bonne stratégie ».**

### Météo (`ReplayProgress`, `DriveView` forecast pill)
- **Timeline nuages** — *EXISTE.* Tooltip = nom de la météo **résolue** uniquement (`resolvedWeather`), aucune distinction « pluie à l'instant T » vs « probabilité pré-course ». Côté plan, la météo est une seule pastille « météo probable ». → exactement la confusion du testeur.
- **Point orange « rythme chrono »** — *EXISTE.* Beat directeur `qualifying_pace` à progress 0.5, sans légende expliquant le playhead mobile ni que les nuages mappent les phases. Repose sur le survol seul.

### Cartes / Garage (`CardStatBadges`, `GarageView`)
- **Clarté carte** — *EXISTE.* Badges direction seule (« + Grip / − Att. ») + un tag (« Weather »), promesse en prose. Aucune magnitude, aucune condition précise. Les nombres existent (sim) et sont même agrégés en modificateur signé dans le briefing directive — mais **jamais montrés par carte**.
- **Consommation** — *EXISTE.* Cartes bankables, consommées à l'usage, **mais l'info n'apparaît qu'après course** (`garage_consumed`). Aucun avertissement pré-engagement → « je doutais qu'il fallait en prendre une / la garder ». Valide.
- **Points ≈ monnaie** — *OBSOLÈTE (corrigé depuis l'audit).* Le header garage n'affiche plus que les crédits (`GarageView.tsx:135-136`) ; les points restants (`:186`) sont un relevé de gains de course signé, pas un portefeuille. Confusion issue d'un build antérieur.

### Rapport / Résultat (`ReportView`, `ResultView`)
- **Valeur du rapport** — *CORRIGÉ / conforme à la demande.* Contrairement au ressenti du testeur, le rapport actuel **est causal et comparatif** : verdict stance/cause/tryNext (`buildRaceVerdict`), cause dominante datée (lap/segment/delta), lien prépa↔météo et carte hit/miss, et **comparaison réglage joueur vs vainqueur** (`recap_plan_chase_winner`). Le « bullshit » cité (« talent du pilote / connaissance du circuit ») **n'existe plus dans le code** → review obsolète sur ce point. Limite résiduelle : la comparaison causale est vs le vainqueur, pas tout le champ ; et le remplissage générique (`recap_lesson_*`) dilue le signal.
- **Illusion 4/4** — *EXISTE.* Grille toujours à 4 cartes → une 8e place « remplit » les 4 cases. Couplé à P7+ = 0 point, le joueur reçoit un feedback visuellement « complet » pour un résultat à zéro point. Dissonance à corriger.

---

## 4. Game Design Review

### Ce qui fonctionne
- **Ossature de boucle** : plan → chrono → course → replay → garage → saison, courte et asynchrone. Le squelette de la vision est là.
- **Course déterministe seedée** (`prng.ts`, LCG sur hash FNV-1a) : rejouable, auditable, base saine pour l'équité multijoueur et le débogage. C'est un atout rare, à protéger.
- **Rapport causal déterministe** : bonne intuition produit (expliquer sans LLM), déjà à moitié réalisée.
- **Cartes conditionnelles** : l'idée (payoff selon contexte) est bonne — c'est l'exécution (seuils durs invisibles) qui pêche.

### Ce qui ne fonctionne pas
- **Trois stats fusionnées** (cause A) : même forme mathématique, interaction ~10× trop faible. Le cœur du « il n'y a pas vraiment de variation entre les trois » est **structurel**, pas cosmétique.
- **Stratégie dominante** : pace-stacking (aggressive + speed + mini_pack + carte pace) l'emporte ; `mini_pack` donne même +16 score gratuits (`simulateRace.ts:590`). « prudent » est dominé partout. → pas de dilemme, un gradient.
- **Conditions en falaise** : rain_grip ne teste que le segment **mid** (`weather !== "dry"`) — une pluie qui arrive en early ou late paie **zéro** et encaisse la pénalité sèche. light_rain et heavy_rain paient pareil. calculated_attack : 2,9 s → +24, 3,1 s → +6. Ces falaises sont invisibles ET frustrantes.
- **Modèle mental faux non contredit** : le testeur croit « le gros pack rattrape et double aux arrêts ». Le code ne modélise **aucune** dynamique de proximité/aspiration/charge d'énergie ; le pack est un delta plat pace/temps. Le jeu n'enseigne donc pas sa propre causalité (les overtakes du replay sont cosmétiques, re-dérivés de l'ordre final).

### Ce qui manque
- **Comparaison de configs adverses** (cause C) : le levier social/optimisation le plus demandé.
- **Différenciation météo** : light vs heavy identiques pour les cartes ; pas de gradient de timing.
- **Boucle d'apprentissage fiable** : chrono reproductible pour isoler l'effet d'un choix.
- **Objectifs de course dynamiques** (déjà en watchlist roadmap, evidence-gated) : de quoi créer des dilemmes contextuels qui rendraient les 3 stats pertinentes selon l'objectif.

### Ce qui est inutile / à élaguer
- Le remplissage `recap_lesson_*` / `recap_verdict_stance_*` générique : dilue le signal causal réel. Élaguer plutôt qu'enrichir.
- La puce « points » stylée en monnaie : soit la dé-styler, soit lui donner une vraie fonction.
- Redondances de cartes (rain_grip/rain_mapping) et cartes re-vendant des leviers gratuits : à consolider en 0.5.

---

## 5. Vision Produit (6–12 mois)

**Thèse : passer d'un jeu qui *a l'air* profond à un jeu qui *se lit* comme profond, puis *est* profond.** Dans cet ordre — la lisibilité d'abord, parce qu'elle est peu risquée et débloque la perception ; la profondeur ensuite, pilotée par les données.

- **Trimestre 1 — Lisibilité (« je comprends ce que je fais »).** Exposer magnitudes de cartes et conditions ; réparer le déterminisme des qualifs ; clarifier la sémantique météo (probabilité pré-course vs météo résolue) et le playhead ; corriger l'illusion 4/4 et la fausse monnaie. Aucun changement de modèle. Objectif mesurable : le joueur peut prédire le signe et l'ampleur approximative de l'effet de chaque choix avant de valider.
- **Trimestre 2 — Comparaison & preuve (« je me compare et j'apprends »).** Comparateur de configs adverses (qualifs + rapport) ; rapport causal étendu au champ. Objectif : rétention par la boucle sociale et l'auto-amélioration.
- **Trimestres 3–4 — Profondeur réelle (« mes choix divergent selon le contexte »).** Faire diverger les trois stats (courbes/plafonds distincts, pas la même forme) ; rebalancer l'économie des cartes ; gradient météo ; objectifs de course dynamiques. Piloté par `balance:sim` + `playtest:ai` + retours testeurs, sous le thème 0.5. Objectif : supprimer la stratégie dominante unique, créer des dilemmes par circuit.

Garde-fous (Decisions_Log) respectés : jamais de recommandation, information objective, incertitude préservée, pas de LLM.

---

## 6. Roadmap (P1 / P2 / P3)

Alignée sur le versioning existant (0.4 = ship rails/perf actif ; 0.5 = economy/card depth, evidence-gated). Les items P1 sont des patchs de lisibilité insérables dans le train 0.3/0.4 ; P2 dépend d'evidence playtest (0.5) ; P3 = vision.

### P1 — Lisibilité, faible risque, fort levier (près-terme)
1. **Magnitudes & conditions de cartes exposées** (cause B) — readability, ne touche pas la sim.
2. **Déterminisme des qualifs** (cause D) — correction de bug + restaure l'apprentissage.
3. **Sémantique météo lisible** : timeline « résolu » vs pastille « probabilité », légende du playhead (cause D).
4. **Corriger l'illusion 4/4** + **dé-styler / requalifier la puce points** (cause B, dissonance feedback).
5. **Avertissement de consommation de carte** pré-engagement + **bouton lancer inline** sur l'onglet directive (frictions ciblées).

### P2 — Profondeur & comparaison, evidence-gated (0.5)
6. **Comparateur de configs adverses** (cause C) — la fonctionnalité différenciante.
7. **Divergence des trois stats** (cause A) — retravailler la forme mathématique + poids segment ; piloté par `balance:sim`.
8. **Rééquilibrage économie cartes** (rain_grip/rain_mapping, adjustable_wing, pit_relay, cartes vs leviers gratuits).

### P3 — Vision (post-evidence)
9. **Gradient météo** : light ≠ heavy ; fenêtre de timing graduelle au lieu de la falaise « mid only ».
10. **Rapport causal champ complet** (« pourquoi chacun a fini là »).
11. **Objectifs de course dynamiques** (déjà en watchlist) — crée les dilemmes qui rendent les 3 stats contextuellement pertinentes.

---

## 7. Corpus Logics Manager — backlog priorisé (proposé)

> Non scaffolder tant que le plan n'est pas validé. Numéros suggérés à partir des prochains libres (req_077, prod_041+, task_078+, items > 144). Chaque ticket suit le gabarit du kit. Les items P2 sont marqués **evidence-gated** (roadmap 0.5) : ne pas scaffolder avant preuve playtest, conformément à la politique roadmap.

---

### TICKET-01 · [P1] Exposer les magnitudes et conditions de déclenchement des cartes
- **Titre** : Card effect magnitudes and trigger conditions surfaced in plan and garage
- **Problème utilisateur** : « on ne sait pas précisément ce que fait une carte », « on ne sait pas à quel point la condition pluie est stricte ».
- **Cause racine (B)** : le moteur applique des valeurs dures (ex. `rain_grip` +26/−4 ; `calculated_attack` +24 si écart ≤ 3 s) et des conditions binaires, mais l'UI n'affiche que direction (`CardStatBadges.tsx:101-121`) + prose (`definitions.ts`). Magnitudes jamais exposées.
- **Description** : pour chaque carte, afficher l'effet chiffré (ou une échelle qualitative calibrée sur la valeur réelle) et la condition exacte de déclenchement (segment, seuil, météo requise), en langage de règle, sans recommandation.
- **Proposition** : dériver les libellés depuis une table unique de vérité partagée avec la sim (éviter les nombres codés en dur en double). Montrer « Déclenche en milieu de course si pluie · +fort si pluie, faible pénalité si sec ».
- **Alternatives** : (a) tooltip magnitude seule ; (b) simulateur « effet sur ce circuit » pré-course (plus coûteux, garder pour plus tard).
- **Dépendances** : aucune bloquante ; s'appuie sur `CardStatBadges`, `GarageView`, i18n.
- **Risques** : révéler des nombres bruts peut figer une méta ; mitiger en exposant *conditions et signes* plutôt que valeurs exactes si l'équipe préfère préserver l'incertitude.
- **Complexité** : M.
- **Priorité** : High.
- **Critères d'acceptation** : chaque carte affiche sa condition de déclenchement et le sens+ampleur de son effet ; les libellés proviennent d'une source partagée avec la sim (test unitaire garantissant la cohérence libellé↔effet) ; aucune formulation de type « meilleure carte / carte recommandée ».

---

### TICKET-02 · [P1] Rendre les qualifications déterministes
- **Titre** : Deterministic qualifying lap times from seed
- **Problème utilisateur** : « c'est flou de comprendre la bonne stratégie » ; impossible d'isoler l'effet d'un réglage.
- **Cause racine (D)** : `qualifying.ts:62` utilise `Math.random()` et `:66` `new Date()` alors qu'un `seed` est disponible et déjà transmis à `createQualifyingResult`. Le chrono n'est pas reproductible ; contredit l'ADR-004 (déterminisme des issues) et la course seedée.
- **Description** : remplacer la variance aléatoire par un tirage PRNG seedé (`createPrng`), et l'horodatage non déterministe par une valeur dérivée de l'état, pour que deux chronos identiques donnent le même temps.
- **Proposition** : réutiliser `createPrng(seed)` du package shared ; seed = fonction de (league, round, team, tentative).
- **Alternatives** : garder une micro-variance mais seedée (préserve un léger aléa sans casser la reproductibilité).
- **Dépendances** : `packages/shared/src/simulation/prng.ts`.
- **Risques** : faible ; vérifier que les grilles existantes ne régressent pas (snapshot).
- **Complexité** : S.
- **Priorité** : High.
- **Critères d'acceptation** : deux appels qualifs avec mêmes entrées produisent des temps identiques (test) ; plus aucun `Math.random`/`Date.now` sur le chemin qualifs ; la grille reste cohérente avec les attentes d'équilibrage.

---

### TICKET-03 · [P1] Clarifier la sémantique météo (probabilité pré-course vs météo résolue) + légende du playhead
- **Titre** : Weather timeline distinguishes forecast probability from resolved weather; explain pace playhead
- **Problème utilisateur** : « tu sais pas si le nuage représente la pluie à cet instant ou juste une possibilité » ; point orange incompris.
- **Cause racine (D)** : côté plan, une seule pastille « météo probable » ; côté replay, la timeline (`ReplayProgress.tsx:70-79`) n'affiche que le nom de `resolvedWeather`, sans marquer qu'il s'agit du résultat effectif ; le beat `qualifying_pace` (playhead) n'a pas de légende.
- **Description** : différencier visuellement et textuellement (i18n) « prévision (probabilité, avant course) » et « météo effective par phase (après résolution) » ; ajouter une légende expliquant le playhead et que les icônes mappent les 5 phases.
- **Proposition** : sur le plan, montrer la distribution de probabilité par phase là où elle est connue ; sur le replay, étiqueter « effectif ». Respecter l'ADR-006 (couleur jamais seule).
- **Alternatives** : bandeau explicatif one-shot au premier affichage (onboarding léger).
- **Dépendances** : `ReplayProgress`, `DriveView` forecast pill, i18n.
- **Risques** : faible.
- **Complexité** : S/M.
- **Priorité** : High.
- **Critères d'acceptation** : le joueur distingue à l'écran probabilité pré-course et météo effective ; le playhead a un libellé/légende ; conforme ADR-006 (indicateur non uniquement chromatique).

---

### TICKET-04 · [P1] Corriger l'illusion « 4/4 »
> Note : ce ticket bundlait deux problèmes. La moitié « puce points-monnaie du garage » est **obsolète (déjà corrigée** : header garage = crédits seuls, `GarageView.tsx:135-136`). Reste la moitié « illusion 4/4 », branchée dans `req_068`.
- **Titre** : Fix full-marks recap illusion
- **Problème utilisateur** : « il m'a mis 4/4 alors que j'ai fini 8e ».
- **Cause racine (B / dissonance feedback)** : la grille de recap rend **toujours 4 cartes** (`ReportView.tsx:46-67`) → perçu comme note pleine ; couplé à P7+ = 0 point.
- **Description** : dissocier visuellement le recap (explication, non-noté) d'un éventuel indicateur de performance honnête ; s'assurer qu'une 8e place ne « ressemble » pas à un succès.
- **Proposition** : retirer toute connotation de score à la grille recap (titre « Analyse », pas de comptage) ; regrouper les points sous « saison/score » et les crédits sous « portefeuille ».
- **Alternatives** : donner une vraie fonction aux points (dépensable) — mais c'est du game design 0.5, à ne pas mélanger ici.
- **Dépendances** : `ReportView`, `ResultView`, `GarageView`, i18n.
- **Risques** : faible.
- **Complexité** : S.
- **Priorité** : Medium-High.
- **Critères d'acceptation** : aucune UI ne suggère une note « N/N » corrélée au recap ; points et crédits sont visuellement et sémantiquement distincts ; un test vérifie qu'un résultat hors-points n'affiche pas d'indicateur de succès.

---

### TICKET-05 · [P1] Frictions ciblées : avertir de la consommation de carte + bouton lancer inline
- **Titre** : Pre-commit card consumption warning and inline launch on directive tab
- **Problème utilisateur** : « savoir que tu perds les cartes, c'est pas clair » ; « une fois le plan validé, il faudrait un bouton Lancer ».
- **Cause racine** : consommation surfacée seulement après course (`garage_consumed`) ; `DirectivePanel` ne reçoit pas `primaryCommand`, donc pas de bouton lancer sur l'onglet d'édition.
- **Description** : afficher, au moment d'attacher une carte au plan, qu'elle sera consommée si la course se lance ; ajouter un bouton lancer/envoyer contextuel sur l'onglet directive (réutiliser `primaryCommand`, ne pas dupliquer la logique).
- **Proposition** : passer `primaryCommand` à `DirectivePanel` ; message de consommation dans le sélecteur de carte du plan.
- **Alternatives** : confirmation modale à la première utilisation seulement.
- **Dépendances** : `PlanView`, `DirectivePanel`, `App.tsx` (primaryCommand), i18n. Attention à ne pas dupliquer le CTA « Stand ».
- **Risques** : faible ; éviter la sur-multiplication des boutons lancer.
- **Complexité** : S.
- **Priorité** : Medium.
- **Critères d'acceptation** : le joueur est informé de la consommation avant de verrouiller ; un bouton lancer fonctionnel est accessible sans quitter l'onglet directive ; pas de régression de navigation.

---

### TICKET-06 · [P2, evidence-gated] Comparateur de configurations adverses
- **Titre** : Numeric opponent setup comparison in qualifying and report
- **Problème utilisateur** : « ce qui manque de fou, c'est de voir les configs des autres… voir ce qui produit quoi ».
- **Cause racine (C)** : les configs adverses ne sont montrées que comme pastilles abstraites (`ChronoPlanAsset`, `ReplayPlanAsset`) ; aucun comparatif chiffré nulle part. Seule la config du vainqueur apparaît, en texte, dans le rapport.
- **Description** : vue comparative approche/prépa/pit/carte (et résultat) du champ, en qualifs et/ou en rapport, en information objective (pas de « meilleure config »).
- **Proposition** : tableau/colonnes « votre config vs le champ », révélé au bon moment (après verrouillage/après course pour ne pas casser l'incertitude pré-course). Aligné piliers « comparaison » et « information objective ».
- **Alternatives** : d'abord ne révéler que post-course (moins de risque de méta pré-course), étendre ensuite.
- **Dépendances** : modèle de données décisions déjà disponible côté résultat ; respecter la frontière de confiance API (ADR-004) sur ce qui est révélé et quand.
- **Risques** : révéler trop tôt réduit l'incertitude (pilier design) ; convergence de méta. Piloter par playtest.
- **Complexité** : M/L.
- **Priorité** : High (dans 0.5) — plus grand différenciateur.
- **Critères d'acceptation** : le joueur voit, chiffrée, la config de chaque adversaire au moment défini ; aucune formulation de recommandation ; règles de révélation conformes à l'incertitude pré-course et à la frontière API.

---

### TICKET-07 · [P2, evidence-gated] Faire diverger réellement les trois stats
- **Titre** : Differentiate grip/attack/energy so circuit identity and strategy diverge
- **Problème utilisateur** : « pas de vraie variation entre les trois », « on n'arrive pas à capter à quel point un circuit favorise la vitesse ».
- **Cause racine (A)** : les trois traits partagent la forme `(trait−60)×score/650` (`simulateRace.ts:638-642`), avec une interaction ~10× plus faible que les termes plats de `pace` (`:644-654`). Données équipe : écart 9,45 pts, pace-stacking dominant, prudent = piège.
- **Description** : donner à chaque stat une forme/rôle distinct (ex. courbes, plafonds, effets de seuil différenciés ; energy déjà décroît en fin de course — étendre ce principe de spécialisation) ; augmenter le poids de l'interaction circuit×stat relativement aux termes plats, pour que l'identité du circuit change la meilleure réponse.
- **Proposition** : itérer via `balance:sim` (`scripts/balance-simulations.ts`) et `playtest:ai` jusqu'à supprimer la stratégie dominante unique et obtenir des gagnants différents par type de circuit ; réduire/retirer le +16 gratuit de `mini_pack` ; requalibrer « prudent ».
- **Alternatives** : garder le modèle et ne travailler que la lisibilité (rejeté : le problème est structurel, la vision « décisions fortes » l'exige).
- **Dépendances** : co-conçu avec TICKET-08 (économie) ; nécessite données playtest (roadmap 0.5).
- **Risques** : rééquilibrage global = risque de régression ; le déterminisme et la reproductibilité doivent être préservés ; **remet en cause l'équilibrage actuel** — signaler explicitement (consigne Decisions_Log).
- **Complexité** : L.
- **Priorité** : High (dans 0.5) mais gated preuve.
- **Critères d'acceptation** : `balance:sim` montre un écart de points resserré ET des stratégies gagnantes différentes selon le type de circuit ; aucune combinaison ne domine tous les circuits ; « prudent » n'est plus dominé partout ; suites déterministes toujours vertes.

---

### TICKET-08 · [P2, evidence-gated] Rééquilibrer l'économie des cartes
- **Titre** : Rebalance card economy (redundancy, mispricing, free-knob overlap)
- **Problème utilisateur** : « une carte et une amélioration de la même stat font le même effet à des prix différents », « lesquelles sont rentables, c'est flou ».
- **Cause racine** : (pas d'upgrades — la comparaison du testeur porte en fait sur cartes vs leviers gratuits). `rain_grip` (120) domine `rain_mapping` (250) ; `adjustable_wing` (500) sous-performe `launch_boost` (180) ; `pit_relay` (250) sans contrepartie ; `soft/hard_tires` re-vendent ce que `approach/preparation` donnent gratuitement.
- **Description** : consolider les doublons, reprixer les outliers, différencier les cartes des leviers de directive gratuits (chaque carte doit offrir quelque chose que le réglage gratuit ne donne pas).
- **Proposition** : fusionner ou re-rôler rain_grip/rain_mapping ; baisser le prix ou augmenter l'effet d'adjustable_wing ; ajouter une contrepartie à pit_relay ; itérer via `economy` summary de `balance:sim`.
- **Alternatives** : introduire une contrainte d'inventaire/rareté plutôt que de re-prixer.
- **Dépendances** : co-conçu avec TICKET-07 (les magnitudes changent avec la sim).
- **Risques** : rééquilibrage ; préserver la lisibilité gagnée en P1.
- **Complexité** : M/L.
- **Priorité** : Medium (dans 0.5).
- **Critères d'acceptation** : `economy` summary de `balance:sim` : aucune carte ne domine simultanément points, winrate et marge crédits ; chaque carte a une raison d'exister distincte d'un réglage gratuit ; `GP/card` reste dans une fourchette faisant du choix un choix.

---

### TICKET-09 · [P3] Gradient météo (light ≠ heavy ; fenêtre de timing)
- **Titre** : Weather gradient — intensity and timing windows instead of hard mid-only checks
- **Problème utilisateur** : « si la pluie arrive un peu avant ou après, est-ce que ça marche ? »
- **Cause racine** : cartes météo ne testent que le segment `mid` en binaire (`weather !== "dry"`) ; light et heavy paient pareil ; pluie hors mid paie zéro (`simulateRace.ts:724,777`).
- **Description** : payoff graduel selon intensité (light < heavy) et proximité temporelle de la fenêtre visée, plutôt qu'une falaise.
- **Proposition** : fonction de payoff continue sur (intensité, distance à la fenêtre).
- **Alternatives** : élargir la fenêtre à early/late sans gradient (plus simple).
- **Dépendances** : TICKET-01 (les conditions exposées doivent refléter le nouveau modèle) ; TICKET-07.
- **Risques** : complexité de lisibilité — le gradient doit rester explicable.
- **Complexité** : M.
- **Priorité** : Low (vision).
- **Critères d'acceptation** : light et heavy produisent des payoffs distincts ; une pluie proche mais pas exactement en mid produit un effet partiel lisible ; conditions affichées cohérentes (TICKET-01).

---

### TICKET-10 · [P3] Rapport causal étendu au champ complet
- **Titre** : Field-wide causal race report
- **Problème utilisateur** : « incapable de comprendre pourquoi j'ai fini là », « le rapport manque d'une comparaison avec ce qu'ont fait les autres ».
- **Cause racine** : le rapport causal actuel (`buildRaceVerdict`, `recapPlanRead`) explique surtout le joueur vs le vainqueur, pas l'ensemble.
- **Description** : étendre l'explication causale déterministe à « pourquoi chaque équipe a fini là », en s'appuyant sur les données déjà calculées (deltas d'événements, cartes, météo par phase).
- **Proposition** : réutiliser le pipeline déterministe existant, pas de LLM ; élaguer en parallèle le remplissage générique `recap_lesson_*`.
- **Alternatives** : garder joueur-vs-vainqueur et n'ajouter que la config chiffrée du champ (recouvre TICKET-06).
- **Dépendances** : TICKET-06 (données de config champ) ; contrainte no-LLM.
- **Risques** : surcharge d'information — hiérarchiser.
- **Complexité** : M.
- **Priorité** : Low (vision).
- **Critères d'acceptation** : le rapport explique causalement le classement au-delà du seul vainqueur, sans LLM, sans recommandation, avec un signal non dilué par du texte générique.

---

## Annexe — Table de correspondance review → verdict code

| # | Remarque testeur | Verdict | Référence code |
|---|---|---|---|
| 1 | Points « vitesse » pas clairs | Valide (cause B) | `DirectivePanel.tsx`, magnitudes cachées |
| 2 | On ne sait pas si le circuit favorise la vitesse | Valide (cause A+B) | `simulateRace.ts:638-654`, interaction ~10× trop faible |
| 3 | Pas de variation entre les 3 stats | Valide, structurel (A) | forme `(trait−60)×score/650` identique |
| 4 | Pluie : instant T vs proba qualifs vs proba course | Valide (D) | `resolveWeather` vs `qualifying.ts` (strongestForecast) |
| 5 | Bouton « Lancer » après le plan | Mal interprété + friction résiduelle | CTA sur « Stand »/onglet GP ; absent de l'onglet directive |
| 6 | Bloqué dans le rapport chrono | Mal interprété | barre sous-onglets toujours visible |
| 7 | Cartes/buffs : savoir ce que ça fait | Valide (B) | `CardStatBadges.tsx`, `definitions.ts` prose |
| 8 | Timeline nuages : pluie ou possibilité ? | Valide (D) | `ReplayProgress.tsx:70-79` |
| 9 | Point orange rythme incompris | Valide (D) | beat `qualifying_pace`, sans légende |
| 10 | Compte rendu : impossible de relier au résultat | Partiellement corrigé | `buildRaceVerdict`, `recapPlanRead` causaux |
| 11 | Textes recap « bullshit » (talent, connaissance) | Obsolète | strings absents du code actuel ; recap data-driven |
| 12 | Score 4/4 alors que 8e | N'existe pas / illusion | grille toujours à 4 cartes ; P7+ = 0 pt |
| 13 | Voir configs des autres | Valide, manque net (C) | pastilles abstraites uniquement |
| 14 | Points affichés comme monnaie | Obsolète (corrigé) | header garage = crédits seuls (`GarageView.tsx:135-136`) ; `:186` = gains de course signés |
| 15 | Carte vs amélioration même effet, prix ≠ | Reformulé | pas d'upgrades ; cartes vs leviers gratuits + doublons |
| 16 | Cartes conditionnelles floues (rentable si pluie mi-course) | Valide (B) | seuils durs `mid only`, light=heavy |
| 17 | On perd les cartes, pas clair | Valide | consommation surfacée post-course seulement |
| 18 | Moments clés inutiles | Partiellement valide | mini-events cosmétiques |
| 19 | Beaucoup de tokens en recaps LLM | **Faux** | aucun LLM ; décision produit `prod_005/020` |
| 20 | Gros pack rattrape et double aux arrêts | **Faux (modèle mental)** | aucune dynamique de proximité modélisée |
| 21 | Savoir l'impact réel des changements | Valide (A+B+D) | magnitudes cachées + qualifs non déterministes |
