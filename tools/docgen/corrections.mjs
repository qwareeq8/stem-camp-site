// Durable, narrowly scoped corrections applied after source extraction.
//
// The ignored IR contains reviewed hand edits, so a wholesale re-extraction is
// not a safe way to make one public-document fix. This layer records exact text
// replacements in version control and fails loudly if the upstream text drifts.

const troubleshootingPair = (problemFrom, problemTo, fixFrom, fixTo) => [
  { from: problemFrom, to: problemTo },
  { from: fixFrom, to: fixTo },
];

const PYS06_HANDOUT_METHOD = [
  { from: "HOW TO BUILD AND RUN IT", to: "HOW TO RUN IT" },
  {
    from: "Clean, complete data is worth as much as a fast result.",
    to: "Record one prediction and one observation for each fixed station, then show the full round-trip calculation.",
  },
  {
    from: "Prediction (what will work best, and why):  ",
    to: "Station prediction and reason:  ",
  },
  {
    from: "The ONE variable we are testing:  ",
    to: "Measured lane length L:  ",
  },
  {
    from: "Baseline result:  ",
    to: "Number of full round trips N and total time:  ",
  },
  {
    from: "After redesign:  ",
    to: "Total distance = 2 x L x N; wave speed = distance / time:  ",
  },
  { from: "DEFEND YOUR DESIGN", to: "DEFEND YOUR WAVE MODEL" },
  {
    from: "What evidence made you change your design?  ",
    to: "Which observation showed reflection or longitudinal motion?  ",
  },
  {
    from: "If you ran it again, what is the ONE thing you would change?  ",
    to: "How do L, N, and total time support your result?  ",
  },
];

const PYS06_GUIDE_METHOD = [
  { from: "Phase 4  Build or solve", to: "Phase 4  Run fixed wave stations" },
  {
    from: "Tier 2 (building but not reasoning): ",
    to: "Tier 2 (measuring but not reasoning): ",
  },
  {
    from: "Design a fair test by controlling one variable while holding others constant (Apply).",
    to: "Apply the fixed predict-test sequence at each station and measure lane length L, full round trips N, and total time (Apply).",
  },
  {
    from: "Use their own data to decide whether a redesign improved the result (Analyze).",
    to: "Calculate total pulse distance as 2 x L x N and wave speed as distance divided by time (Analyze).",
  },
  {
    from: "Defend a final claim with specific evidence (Evaluate).",
    to: "Defend a wave or SONAR claim with station observations and the measured calculation (Evaluate).",
  },
  {
    from: "Set up one station per team with the materials above, sorted and ready.",
    to: "Tape measured floor lanes and stage the fixed station cards, slinkies, and clipboards at each lane.",
  },
  {
    from: "Stage the scoring sheet and any reference values before testing begins.",
    to: "Stage the scoring sheet and the distance reference: total distance = 2 x L x N.",
  },
  {
    from: "Before any materials move, each team writes one prediction and one reason on the handout. No building yet.",
    to: "Before each fixed station test, teams record what the pulse will do and why.",
  },
  {
    from: "Set the rules: approved materials only, change one variable at a time, record at least one data point before any redesign, and follow the safety notes.",
    to: "Use the fixed station sequence. Keep the slinky flat, held at both ends, and no longer than about 3 m; measure L and count only full down-and-back round trips.",
  },
  {
    from: "Teams work through the steps on the student handout. Circulate, ask what they are testing, and resist solving it for them.",
    to: "Teams predict, launch, observe, and explain each fixed station card. Circulate to enforce the hold, stretch, and goggle rules.",
  },
  {
    from: "Teams run the standard test and log a baseline result before changing anything.",
    to: "Teams measure L, time N full round trips, and calculate total distance as 2 x L x N before finding wave speed.",
  },
  { from: "Phase 6  Redesign", to: "Phase 6  Evidence defense" },
  {
    from: "Each team changes exactly one variable, predicts the effect, and re-tests to compare against baseline.",
    to: "Teams check units and arithmetic, then defend one station answer with an observation and their round-trip calculation.",
  },
  {
    from: "Teams submit a score slip, answer a debrief question with evidence, and reset the station. PPE off, wash or wipe down.",
    to: "Teams submit a score slip, answer a debrief question with evidence, return goggles, and reset each slinky without tangling it.",
  },
  ...troubleshootingPair(
    "A team changed several things at once.",
    "A team launches before predicting.",
    "Have them reset to one variable before the next reading counts; treat it as a data-quality coaching moment.",
    "Pause the station and require the written prediction before the next fixed card test.",
  ),
  ...troubleshootingPair(
    "No measurable result on the first test.",
    "The pulse is hard to see.",
    "Check the setup against the steps, confirm the standard test was followed, and log the baseline anyway.",
    "Reduce the stretch, use one sharp push, keep both ends held, and watch from the side.",
  ),
  ...troubleshootingPair(
    "Readings vary between trials.",
    "The speed calculation is inconsistent.",
    "Standardize the procedure: same conditions, same technique, average several trials.",
    "Recheck L, count full round trips only, and use total distance = 2 x L x N.",
  ),
  ...troubleshootingPair(
    "A team finishes early.",
    "A team finishes early.",
    "Push the extension prompt below and ask them to quantify their improvement.",
    "Ask them to verify a second station answer and explain one limit of the slinky model.",
  ),
  {
    from: '"What single change could improve your result without changing anything else?"',
    to: '"Which observation distinguishes a longitudinal pulse from a transverse one?"',
  },
  {
    from: '"Run a second version that isolates a different variable and compare the two with data."',
    to: '"Use L, N, and total time to audit the wave-speed calculation, then name one limit of the SONAR analogy."',
  },
  {
    from: "Return reusable items to the bin, dispose of consumables, wipe surfaces, and collect score slips.",
    to: "Return goggles and station cards, relax and coil each slinky without kinks, remove floor tape if directed, and collect score slips.",
  },
];

const PYS08_HANDOUT_METHOD = [
  { from: "HOW TO BUILD AND RUN IT", to: "HOW TO RUN IT" },
  {
    from: "Do every challenge next to the wall with your back and heels touching it so a slip just leaves you leaning on the wall. Keep the floor clear of bags and chairs. A helper spots the chair stand. The taped line is flat on the floor: no running, no raised beam.",
    to: "Do every challenge next to a clear wall so a helper can steady you if needed. Keep bags and unused chairs out of the test area. A helper spots the backless-chair stand. The taped line stays flat on the floor: no running and no raised beam.",
  },
  {
    from: "Clean, complete data is worth as much as a fast result.",
    to: "Record one prediction and one observed result for each of the four fixed challenges.",
  },
  {
    from: "Prediction (what will work best, and why):  ",
    to: "Challenge 1 prediction and observed result:  ",
  },
  {
    from: "The ONE variable we are testing:  ",
    to: "Challenge 2 prediction and observed result:  ",
  },
  {
    from: "Baseline result:  ",
    to: "Challenge 3 prediction and observed result:  ",
  },
  {
    from: "After redesign:  ",
    to: "Challenge 4 prediction and observed result:  ",
  },
  { from: "DEFEND YOUR DESIGN", to: "EXPLAIN YOUR FORCE MAP" },
  {
    from: "What evidence made you change your design?  ",
    to: "Which challenge best showed the line of gravity leaving the base of support?  ",
  },
  {
    from: "If you ran it again, what is the ONE thing you would change?  ",
    to: "How did the center-of-mass position explain one observed result?  ",
  },
];

const PYS08_GUIDE_METHOD = [
  { from: "Phase 4  Build or solve", to: "Phase 4  Run fixed challenges" },
  {
    from: "Tier 2 (building but not reasoning): ",
    to: "Tier 2 (completing challenges but not reasoning): ",
  },
  {
    from: "Design a fair test by controlling one variable while holding others constant (Apply).",
    to: "Apply the four fixed challenge cards safely and record a prediction before each test (Apply).",
  },
  {
    from: "Use their own data to decide whether a redesign improved the result (Analyze).",
    to: "Analyze whether the line of gravity stays over the base of support in each challenge (Analyze).",
  },
  {
    from: "Defend a final claim with specific evidence (Evaluate).",
    to: "Defend a center-of-mass claim with a prediction, observed result, and force map (Evaluate).",
  },
  {
    from: "Set up one station per team with the materials above, sorted and ready.",
    to: "Stage the four fixed challenge cards, a clear wall area, a backless chair with a helper spotter, a flat taped line, a coin, and a small weight.",
  },
  {
    from: "Stage the scoring sheet and any reference values before testing begins.",
    to: "Stage the scoring sheet and one center-of-mass template per team before rotations begin.",
  },
  {
    from: "Stage only the activity-specific safety controls named in the student safety note and staff run sheet; gloves, goggles, and trays are not universal requirements.",
    to: "Clear the floor beside every challenge, assign a helper to spot the backless-chair stand, and keep the taped line flat. No running or raised balance surface.",
  },
  {
    from: "Before any materials move, each team writes one prediction and one reason on the handout. No building yet.",
    to: "Before each of the four fixed challenges, every team records whether it will work and where the center of mass will move.",
  },
  {
    from: "Set the rules: approved materials only, change one variable at a time, record at least one data point before any redesign, and follow the safety notes.",
    to: "Use only the four challenge cards. Test next to a clear wall, spot the chair stand, and keep the taped line flat and untimed.",
  },
  {
    from: "Teams work through the steps on the student handout. Circulate, ask what they are testing, and resist solving it for them.",
    to: "Rotate teams through the four fixed challenge cards without revealing the center-of-mass explanation before each prediction.",
  },
  {
    from: "Teams run the standard test and log a baseline result before changing anything.",
    to: "Teams record the observed result and complete a force map for each challenge before moving to the next card.",
  },
  { from: "Phase 6  Redesign", to: "Phase 6  Evidence defense" },
  {
    from: "Each team changes exactly one variable, predicts the effect, and re-tests to compare against baseline.",
    to: "Teams compare all four predictions with the observed results and defend one center-of-mass explanation.",
  },
  {
    from: "Teams submit a score slip, answer a debrief question with evidence, and reset the station. PPE off, wash or wipe down.",
    to: "Teams submit a score slip, answer a debrief question with evidence, return the cards and templates, and clear the taped-line area.",
  },
  ...troubleshootingPair(
    "A team changed several things at once.",
    "A team invents a different pose.",
    "Have them reset to one variable before the next reading counts; treat it as a data-quality coaching moment.",
    "Return to the exact fixed challenge card so predictions and scoring remain comparable.",
  ),
  ...troubleshootingPair(
    "No measurable result on the first test.",
    "A challenge result is unclear.",
    "Check the setup against the steps, confirm the standard test was followed, and log the baseline anyway.",
    "Recheck the card posture and base of support, then repeat once with the helper ready.",
  ),
  ...troubleshootingPair(
    "Readings vary between trials.",
    "Teammates report different sensations.",
    "Standardize the procedure: same conditions, same technique, average several trials.",
    "Score the observable result, then let each student mark where balance felt difficult.",
  ),
  ...troubleshootingPair(
    "A team finishes early.",
    "A team finishes early.",
    "Push the extension prompt below and ask them to quantify their improvement.",
    "Ask them to improve one force map and explain the line of gravity without retesting a new pose.",
  ),
  {
    from: '"What single change could improve your result without changing anything else?"',
    to: '"Where is the base of support, and where does the line of gravity fall?"',
  },
  {
    from: '"Run a second version that isolates a different variable and compare the two with data."',
    to: '"Compare two fixed challenges and explain why their bases of support produce different results."',
  },
  {
    from: "Return reusable items to the bin, dispose of consumables, wipe surfaces, and collect score slips.",
    to: "Return the four challenge cards, templates, coin, and weight; move the chair out of the lane; remove tape if directed; and collect score slips.",
  },
];

const PYS10_HANDOUT_METHOD = [
  { from: "HOW TO BUILD AND RUN IT", to: "HOW TO RUN IT" },
  {
    from: "No flame tests. No lasers. Diffraction glasses are not eye protection.  Allergy: None.",
    to: "No flame tests, lasers, or direct sun viewing. Diffraction glasses are not eye protection. Only staff handle plugged-in or hot light sources.  Allergy: None.",
  },
  {
    from: "Clean, complete data is worth as much as a fast result.",
    to: "Observe and sketch each mystery spectrum before matching it to a source card.",
  },
  {
    from: "Prediction (what will work best, and why):  ",
    to: "Mystery source or card number and observed pattern:  ",
  },
  {
    from: "The ONE variable we are testing:  ",
    to: "Proposed source match and visible evidence:  ",
  },
  {
    from: "Baseline result:  ",
    to: "Second mystery source or card and observed pattern:  ",
  },
  {
    from: "After redesign:  ",
    to: "Proposed source match and visible evidence:  ",
  },
  { from: "DEFEND YOUR DESIGN", to: "DEFEND YOUR MATCHES" },
  {
    from: "What evidence made you change your design?  ",
    to: "Which visible feature best separated the source types?  ",
  },
  {
    from: "If you ran it again, what is the ONE thing you would change?  ",
    to: "How does a line spectrum connect to fireworks colors?  ",
  },
];

const PYS10_GUIDE_METHOD = [
  { from: "Phase 4  Build or solve", to: "Phase 4  Observe and match spectra" },
  {
    from: "Tier 2 (building but not reasoning): ",
    to: "Tier 2 (matching but not reasoning): ",
  },
  {
    from: "Design a fair test by controlling one variable while holding others constant (Apply).",
    to: "Use reference spectra to identify and match mystery light-source patterns (Apply).",
  },
  {
    from: "Use their own data to decide whether a redesign improved the result (Analyze).",
    to: "Analyze whether a spectrum is a smooth rainbow, broad band, or set of separate lines (Analyze).",
  },
  {
    from: "Defend a final claim with specific evidence (Evaluate).",
    to: "Defend each source match with a labeled sketch and visible spectral evidence (Evaluate).",
  },
  {
    from: "Set up one station per team with the materials above, sorted and ready.",
    to: "Stage verified light sources in a dimmable viewing area and place reference cards, clue sheets, and sketch sheets at team stations.",
  },
  {
    from: "Stage the scoring sheet and any reference values before testing begins.",
    to: "Stage the scoring sheet and confirm that at least one true neon or other verified line source is available.",
  },
  {
    from: "Stage only the activity-specific safety controls named in the student safety note and staff run sheet; gloves, goggles, and trays are not universal requirements.",
    to: "Allow no flames, lasers, or direct sun viewing. Diffraction glasses are not eye protection; only staff handle plugged-in or hot light sources.",
  },
  {
    from: "Before any materials move, each team writes one prediction and one reason on the handout. No building yet.",
    to: "Before viewing each mystery source, teams predict whether they expect a smooth rainbow, broad band, or separate lines.",
  },
  {
    from: "Set the rules: approved materials only, change one variable at a time, record at least one data point before any redesign, and follow the safety notes.",
    to: "Observe from the marked safe position, sketch before matching, and cite a visible pattern. No flames, lasers, or direct sun viewing.",
  },
  {
    from: "Teams work through the steps on the student handout. Circulate, ask what they are testing, and resist solving it for them.",
    to: "Teams observe, sketch, match, and justify each mystery spectrum. Circulate without naming a source before its sketch is complete.",
  },
  {
    from: "Teams run the standard test and log a baseline result before changing anything.",
    to: "Teams compare each sketch with the reference cards and record a source match plus the visible evidence.",
  },
  { from: "Phase 6  Redesign", to: "Phase 6  Evidence check" },
  {
    from: "Each team changes exactly one variable, predicts the effect, and re-tests to compare against baseline.",
    to: "Teams audit their matches, revise only when the observed pattern supports the change, and prepare a fireworks-science explanation.",
  },
  {
    from: "Teams submit a score slip, answer a debrief question with evidence, and reset the station. PPE off, wash or wipe down.",
    to: "Teams submit a score slip, answer a debrief question with evidence, return cards and gratings, and leave light sources for staff to unplug.",
  },
  ...troubleshootingPair(
    "A team changed several things at once.",
    "A spectrum looks washed out.",
    "Have them reset to one variable before the next reading counts; treat it as a data-quality coaching moment.",
    "Dim ambient light, increase viewing distance, and use a clear view of the source.",
  ),
  ...troubleshootingPair(
    "No measurable result on the first test.",
    "Every source looks like a broad band.",
    "Check the setup against the steps, confirm the standard test was followed, and log the baseline anyway.",
    "Confirm that the line source is true neon or another verified gas source, not an LED night light.",
  ),
  ...troubleshootingPair(
    "Readings vary between trials.",
    "Sketches disagree.",
    "Standardize the procedure: same conditions, same technique, average several trials.",
    "Reobserve from the same marked position and compare pattern type and line locations, not brightness alone.",
  ),
  ...troubleshootingPair(
    "A team finishes early.",
    "A team finishes early.",
    "Push the extension prompt below and ask them to quantify their improvement.",
    "Give an additional clue card or ask them to connect one line pattern to an emitting element.",
  ),
  {
    from: '"What single change could improve your result without changing anything else?"',
    to: '"Which visible pattern supports your source match?"',
  },
  {
    from: '"Run a second version that isolates a different variable and compare the two with data."',
    to: '"Compare a smooth, broad-band, and line spectrum and explain what each reveals about its source."',
  },
  {
    from: "Return reusable items to the bin, dispose of consumables, wipe surfaces, and collect score slips.",
    to: "Return gratings, reference cards, and clue sheets; staff unplug and cool light sources; then collect score slips.",
  },
];

const PYS11_HANDOUT_METHOD = [
  { from: "HOW TO BUILD AND RUN IT", to: "HOW TO RUN IT" },
  {
    from: "Good addressing and smart routing minimize travel and avoid traffic jams. You simulate storage and retrieval with order cards, bin addresses, and routing rules, then defend your algorithm.",
    to: "Good addressing and smart routing minimize legal moves. You simulate storage and retrieval with order cards, bin addresses, and routing rules, then defend your algorithm.",
  },
  {
    from: "Clean, complete data is worth as much as a fast result.",
    to: "Record the card addresses, route order, legal move count, and card optimum for the shared-mat run.",
  },
  {
    from: "Prediction (what will work best, and why):  ",
    to: "Order card and required addresses:  ",
  },
  {
    from: "The ONE variable we are testing:  ",
    to: "Planned route from DEPOT back to DEPOT:  ",
  },
  {
    from: "Baseline result:  ",
    to: "Team legal moves and card minimum:  ",
  },
  {
    from: "After redesign:  ",
    to: "Efficiency score = max(0, 10 - (team moves - card minimum)):  ",
  },
  { from: "DEFEND YOUR DESIGN", to: "DEFEND YOUR ROUTE" },
  {
    from: "What evidence made you change your design?  ",
    to: "What rule did your team use to choose the retrieval order?  ",
  },
  {
    from: "If you ran it again, what is the ONE thing you would change?  ",
    to: "Which route segment could be shortened while keeping every move legal?  ",
  },
];

const PYS11_GUIDE_METHOD = [
  { from: "Phase 4  Build or solve", to: "Phase 4  Run the shared-mat route" },
  {
    from: "Tier 2 (building but not reasoning): ",
    to: "Tier 2 (routing but not reasoning): ",
  },
  {
    from: "What made one route faster than another?",
    to: "What made one route use fewer legal moves?",
  },
  {
    from: "Design a fair test by controlling one variable while holding others constant (Apply).",
    to: "Plan a legal orthogonal route that starts and finishes at DEPOT and retrieves every required address (Apply).",
  },
  {
    from: "Use their own data to decide whether a redesign improved the result (Analyze).",
    to: "Compare team legal moves with the verified minimum for the selected order card (Analyze).",
  },
  {
    from: "Defend a final claim with specific evidence (Evaluate).",
    to: "Defend a routing rule with the address order, legal move count, and card optimum (Evaluate).",
  },
  {
    from: "Stage the scoring sheet and any reference values before testing begins.",
    to: "Stage the order deck, staff answer key, score sheet, and verified minimum move count for every card.",
  },
  {
    from: "Before any materials move, each team writes one prediction and one reason on the handout. No building yet.",
    to: "Each team draws an order card and records a complete planned route from DEPOT back to DEPOT before its run.",
  },
  {
    from: "Teams work through the steps on the student handout. Circulate, ask what they are testing, and resist solving it for them.",
    to: "Teams plan on their copies, then execute the selected order card on the shared judging mat while staff count legal moves.",
  },
  { from: "Phase 6  Redesign", to: "Phase 6  Algorithm defense" },
  {
    from: "Each team changes exactly one variable, predicts the effect, and re-tests to compare against baseline.",
    to: "Teams compare their legal move count with the card minimum, compute the normalized efficiency score, and defend their routing rule.",
  },
  ...troubleshootingPair(
    "A team changed several things at once.",
    "A route uses a diagonal or skips an address.",
    "Have them reset to one variable before the next reading counts; treat it as a data-quality coaching moment.",
    "Stop the run, mark it incomplete, and have the team trace a legal orthogonal route on its planning copy.",
  ),
  ...troubleshootingPair(
    "No measurable result on the first test.",
    "A move count is disputed.",
    "Check the setup against the steps, confirm the standard test was followed, and log the baseline anyway.",
    "Replay the route slowly on the shared mat and count each adjacent square from DEPOT back to DEPOT.",
  ),
  ...troubleshootingPair(
    "Readings vary between trials.",
    "Teams compare different cards directly.",
    "Standardize the procedure: same conditions, same technique, average several trials.",
    "Normalize each result against that card's verified minimum before comparing efficiency.",
  ),
  ...troubleshootingPair(
    "A team finishes early.",
    "A team finishes early.",
    "Push the extension prompt below and ask them to quantify their improvement.",
    "Give a second card for planning only and ask them to justify its route against the key.",
  ),
  {
    from: '"What single change could improve your result without changing anything else?"',
    to: '"Which address order avoids unnecessary backtracking while keeping every move legal?"',
  },
  {
    from: '"Run a second version that isolates a different variable and compare the two with data."',
    to: '"Compare your legal move count with the card optimum and explain where any extra moves occurred."',
  },
  {
    from: "Return reusable items to the bin, dispose of consumables, wipe surfaces, and collect score slips.",
    to: "Return order cards, planning mats, labels, and timers; reset the shared judging mat and collect score slips.",
  },
];

const PYB04_HANDOUT_METHOD = [
  { from: "HOW TO BUILD AND RUN IT", to: "HOW TO RUN IT" },
  {
    from: "A barcode includes an extra check digit computed from the others by a fixed rule. If a digit is mistyped or smudged, the rule no longer matches and the scanner rejects the code. This is how real product codes catch errors automatically.",
    to: "A 12-digit UPC-A code uses a weighted mod-10 check. Add the digits in odd positions 1, 3, 5, 7, 9, and 11 and multiply that sum by 3. Add the digits in even positions 2, 4, 6, 8, 10, and 12. A valid code makes the total a multiple of 10, so a single mistyped digit is rejected.",
  },
  {
    from: "Study the check-digit rule: how the last digit is computed from the rest.",
    to: "For each 12-digit UPC-A code, multiply the odd-position sum by 3, add the even-position digits, and check whether the total is a multiple of 10.",
  },
  {
    from: "Clean, complete data is worth as much as a fast result.",
    to: "Show the weighted UPC-A arithmetic before accepting or rejecting a code.",
  },
  {
    from: "Prediction (what will work best, and why):  ",
    to: "Card number and 12-digit UPC-A code:  ",
  },
  {
    from: "The ONE variable we are testing:  ",
    to: "Odd-position sum x 3:  ",
  },
  {
    from: "Baseline result:  ",
    to: "Even-position sum and grand total:  ",
  },
  {
    from: "After redesign:  ",
    to: "Verdict: accept or reject:  ",
  },
  { from: "DEFEND YOUR DESIGN", to: "DEFEND YOUR VERDICT" },
  {
    from: "What evidence made you change your design?  ",
    to: "Show the arithmetic for one rejected code.  ",
  },
  {
    from: "If you ran it again, what is the ONE thing you would change?  ",
    to: "Why does any single changed digit make this weighted total fail?  ",
  },
];

const PYB04_GUIDE_METHOD = [
  { from: "Phase 4  Build or solve", to: "Phase 4  Verify UPC-A codes" },
  {
    from: "Tier 2 (building but not reasoning): ",
    to: "Tier 2 (calculating but not reasoning): ",
  },
  {
    from: "Design a fair test by controlling one variable while holding others constant (Apply).",
    to: "Apply the weighted mod-10 rule to verify and classify 12-digit UPC-A codes (Apply).",
  },
  {
    from: "Use their own data to decide whether a redesign improved the result (Analyze).",
    to: "Analyze weighted sums to detect corrupted codes without rejecting valid codes (Analyze).",
  },
  {
    from: "Defend a final claim with specific evidence (Evaluate).",
    to: "Defend each accept-or-reject verdict with complete UPC-A arithmetic (Evaluate).",
  },
  {
    from: "Set up one station per team with the materials above, sorted and ready.",
    to: "Stage the 12-digit UPC-A card deck, dry erase boards, markers, and timers at each team station.",
  },
  {
    from: "Stage the scoring sheet and any reference values before testing begins.",
    to: "Stage the worked UPC-A example, scoring sheet, and staff answer key; verify every corrupted card before use.",
  },
  {
    from: "Stage only the activity-specific safety controls named in the student safety note and staff run sheet; gloves, goggles, and trays are not universal requirements.",
    to: "No special PPE is required. Keep cards and dry erase materials organized, and use only the verified 12-digit UPC-A deck.",
  },
  {
    from: "Before any materials move, each team writes one prediction and one reason on the handout. No building yet.",
    to: "Teams work one valid example and explain the odd-position x 3 rule before the timed deck begins.",
  },
  {
    from: "Set the rules: approved materials only, change one variable at a time, record at least one data point before any redesign, and follow the safety notes.",
    to: "Use 12-digit UPC-A only: odd positions x 3, even positions x 1, and accept only totals that are multiples of 10.",
  },
  {
    from: "Teams work through the steps on the student handout. Circulate, ask what they are testing, and resist solving it for them.",
    to: "Teams verify and classify 12-digit UPC-A codes. Circulate to check position numbering and complete arithmetic without revealing verdicts.",
  },
  {
    from: "Teams run the standard test and log a baseline result before changing anything.",
    to: "Teams record accept-or-reject verdicts and flag suspected corruptions; staff score correct detections and false alarms from the key.",
  },
  { from: "Phase 6  Redesign", to: "Phase 6  Verification audit" },
  {
    from: "Each team changes exactly one variable, predicts the effect, and re-tests to compare against baseline.",
    to: "Teams double-check each flagged card, show one full weighted sum, and explain why a single changed digit is detected.",
  },
  {
    from: "Teams submit a score slip, answer a debrief question with evidence, and reset the station. PPE off, wash or wipe down.",
    to: "Teams submit a score slip, answer a debrief question with arithmetic evidence, erase boards, and return the card deck in order.",
  },
  ...troubleshootingPair(
    "A team changed several things at once.",
    "A team weights digits from the wrong end.",
    "Have them reset to one variable before the next reading counts; treat it as a data-quality coaching moment.",
    "Number the 12 UPC-A positions from the left and shade odd positions before recalculating.",
  ),
  ...troubleshootingPair(
    "No measurable result on the first test.",
    "A total does not match the key.",
    "Check the setup against the steps, confirm the standard test was followed, and log the baseline anyway.",
    "Recheck every digit, the odd-position x 3 subtotal, and the final mod-10 test.",
  ),
  ...troubleshootingPair(
    "Readings vary between trials.",
    "A valid code is flagged.",
    "Standardize the procedure: same conditions, same technique, average several trials.",
    "Require a second complete calculation before counting the rejection as final.",
  ),
  ...troubleshootingPair(
    "A team finishes early.",
    "A team finishes early.",
    "Push the extension prompt below and ask them to quantify their improvement.",
    "Have them create one single-digit corruption and prove that the rule catches it.",
  ),
  {
    from: '"What single change could improve your result without changing anything else?"',
    to: '"Which positions are multiplied by 3, and how can you keep that pattern straight?"',
  },
  {
    from: '"Run a second version that isolates a different variable and compare the two with data."',
    to: '"Create one single-digit error, recalculate the weighted total, and explain why the code now fails."',
  },
  {
    from: "Return reusable items to the bin, dispose of consumables, wipe surfaces, and collect score slips.",
    to: "Return barcode cards in order, erase boards, cap markers, return timers, and collect score slips.",
  },
];

const TTT10_STUDENT_METHOD = [
  { from: "HOW TO BUILD AND RUN IT", to: "HOW TO RUN IT" },
  {
    from: "Read the rings to reconstruct the climate events a tree lived through.",
    to: "Use an authored ring-card code to build and defend a model history, then explain what real evidence would require.",
  },
  {
    from: "Most accurate climate-event inferences with claim-evidence-reasoning.",
    to: "Most accurate use of the practice-card code, supported with claim-evidence-reasoning.",
  },
  {
    from: "A tree adds one ring per year. Wide rings mean a good growing season; narrow rings mean stress like drought, cold, or crowding. Because the tree cannot record numbers, the rings are a proxy: an indirect record of past climate.",
    to: "One annual ring contains earlywood and latewood. Ring width can respond to climate, but it also depends on species, site, age, competition, damage, and other conditions. These six authored cards use stylized widths and black marks as a practice code only. Real dendrochronology cross-dates many trees and calibrates measurements against local weather records.",
  },
  {
    from: "You infer events from ring patterns, then justify each call with the specific rings that support it. Scars, sudden narrowing, and runs of wide rings are your clues. Strong inferences cite the evidence.",
    to: "Under the printed practice-card code, assign model events to width and mark patterns, then cite the exact annual bands that support each claim. Alternating gray and white fill only separates years; it does not label good or stressful conditions. A single authored card cannot reconstruct real climate.",
  },
  {
    from: "Wide equals a favorable year, narrow a stress year (drought, cold, or crowding), scar a fire the tree survived. A ring is a proxy, not a thermometer.",
    to: "For these authored cards only, relatively wide means model-favorable, relatively narrow means model-stress, and a black mark means model-disturbance. Do not treat that code as a universal rule for real trees. Each annual band includes earlywood and latewood; gray and white shading only separates adjacent years.",
  },
  {
    from: "Work along the rings from center to bark, noting each pattern and the year it maps to.",
    to: "Read the authored annual bands from center to bark and record each width or black-mark pattern in order.",
  },
  {
    from: "Match patterns to likely events: drought, fire, a crowded stand, a recovery.",
    to: "Apply the printed card code to assign model events such as stress, a marked disturbance, crowding, or recovery. Label them as model events, not a real tree history.",
  },
  {
    from: "For each inference, point to the exact rings that justify it on a claim-evidence card.",
    to: "For each model inference, point to the exact annual bands that support it on a claim-evidence card.",
  },
  {
    from: "Combine your inferences into one short climate history for the tree.",
    to: "Combine the model inferences into one practice-card history, then name the cross-dating and local calibration real climate reconstruction would require.",
  },
  {
    from: "Prediction (which ring pattern is the clearest sign of a hard year, and why):  ",
    to: "Prediction (which authored pattern is the clearest model-stress code, and why):  ",
  },
  {
    from: "Our climate history for the tree, oldest ring to most recent:  ",
    to: "Our model history under the practice-card code, oldest band to newest:  ",
  },
  {
    from: "The events we inferred (drought, fire/scar, crowding, recovery):  ",
    to: "The model events we assigned under the printed code:  ",
  },
  {
    from: "The exact rings (which years and patterns) that are our evidence for each event:  ",
    to: "The exact annual bands that support each model event:  ",
  },
  {
    from: "Correct inferences",
    to: "Practice-code inferences",
  },
];

const TTT10_GUIDE_METHOD = [
  {
    from: "Tier 2 (building but not reasoning): ",
    to: "Tier 2 (applying the card code but not reasoning): ",
  },
  {
    from: '"Which single ring or run of rings most changes your climate story, and why?"',
    to: '"Which authored annual band or pattern most changes your model history under the card code, and why?"',
  },
  {
    from: "Read rings to reconstruct past climate",
    to: "Practice reading stylized rings as proxy evidence",
  },
  {
    from: "Read the rings to reconstruct the climate events a tree lived through.  Plan about 80 minutes for the core block; 4 teams of 4 students.",
    to: "Use an authored ring-card code to build and defend a model history, then explain what real evidence would require.  Plan about 80 minutes for the core block; 4 teams of 4 students.",
  },
  {
    from: "Explain the core science of this challenge: tree rings, proxy data, paleoclimate, pattern recognition (Understand).",
    to: "Explain that earlywood and latewood form one annual ring and that width-climate relationships depend on species, site, and calibration (Understand).",
  },
  {
    from: "Read the rings in order and infer past climate events, citing the exact rings as evidence (Apply).",
    to: "Apply the printed code to the six stylized authored cards and cite the exact annual bands that support each model event (Apply).",
  },
  {
    from: "Weigh the ring evidence to decide which climate story best fits the sequence (Analyze).",
    to: "Analyze which model history best fits the authored pattern and distinguish that exercise from real climate reconstruction (Analyze).",
  },
  {
    from: "Defend a final claim with specific evidence (Evaluate).",
    to: "Defend a practice-card claim and name the cross-dating, replication, and local calibration real dendrochronology requires (Evaluate).",
  },
  {
    from: "Build the answer key for each ring-card set (the correct climate-event sequence) and stage it with the instructor, plus the score slips, before play begins.",
    to: "Prepare a scoring reference for consistent use of the printed practice-card code and cited bands; do not present the authored cards as cross-dated samples or a real climate answer key. Stage it with the score slips.",
  },
  {
    from: "Pose the mission as a challenge: \"Read the rings to reconstruct the climate events a tree lived through.\" Take a quick prediction by show of hands.",
    to: "Pose the mission as a challenge: \"Use the authored ring-card code to build a model history, then explain what real evidence would require.\" Take a quick prediction by show of hands.",
  },
  {
    from: "Before reading the rings, each team writes one prediction and one reason on the handout: which ring pattern is the clearest sign of a hard year. No reading the sequence yet.",
    to: "Before reading the cards, each team predicts which authored pattern is the clearest model-stress code and explains why. No reading the sequence yet.",
  },
  {
    from: "Set the rules: read the rings in order from center to bark, map each ring to a year, cite the exact rings as evidence for every inference, and an inference with no cited ring does not score.",
    to: "Read annual bands from center to bark, apply only the printed practice-card code, and cite exact bands for every model inference. State that alternating fill only separates years and that real interpretation requires cross-dating and local calibration.",
  },
  {
    from: "Teams read the ring sequence from center to bark, map each pattern to a year on the answer board, and infer the likely events. Circulate, ask which rings support each call, and resist reading it for them.",
    to: "Teams read the authored band sequence from center to bark, record each pattern, and assign model events under the printed code. Circulate and ask which bands support each call without treating the cards as real samples.",
  },
  {
    from: "For each inference, teams fill a claim-evidence card naming the exact rings (which years, what pattern) that justify the call.",
    to: "For each model inference, teams fill a claim-evidence card naming the exact annual bands and pattern that support the call.",
  },
  {
    from: "Each team combines its inferences into one short climate history for the tree, then re-checks its least certain inference against the rings before scoring.",
    to: "Each team combines its model inferences into one practice-card history, rechecks its least certain claim, and lists the real cross-dating and calibration evidence that is missing.",
  },
  ...troubleshootingPair(
    "A team names events without pointing to rings.",
    "A team names model events without pointing to bands.",
    "Have them point to the exact ring that supports each claim before moving on; treat it as an evidence-quality coaching moment.",
    "Require the exact annual band that supports each claim before moving on.",
  ),
  ...troubleshootingPair(
    "A team makes an inference with no cited rings.",
    "A model inference has no cited bands.",
    "Point to a claim-evidence card and ask which exact rings (years and pattern) support the call; an uncited inference does not score, so coach them to anchor every claim to evidence.",
    "Use the claim-evidence card to name the exact annual bands and pattern; an unsupported claim does not score.",
  ),
  ...troubleshootingPair(
    "Two teams read the same rings differently.",
    "Two teams apply the card code differently.",
    "Have them re-read from center to bark and cite the exact ring for each call; dendrochronologists crossdate and compare many trees to agree on dates.",
    "Re-read from center to bark and cite exact bands. Explain that real dendrochronologists cross-date many trees and calibrate measurements against local records rather than resolving a real history from one stylized card.",
  ),
  ...troubleshootingPair(
    "A team finishes early.",
    "A team finishes early.",
    "Push the extension prompt below and ask them to defend their climate story with the specific rings.",
    "Ask them to defend the model history with specific bands and list two kinds of real evidence needed to test it.",
  ),
  {
    from: '"Cross-date your tree against a second ring-card set: find a shared stress year in both and use it to line up the timelines."',
    to: '"Explain how cross-dating many real trees and calibrating ring measurements against local weather could test this card-based model."',
  },
  {
    from: "Correct inferences",
    to: "Practice-code inferences",
  },
];

const TTT12_SCORE_LABELS = [
  { from: "Counting accuracy", to: "Standardized counting accuracy" },
  {
    from: "Ranking evidence",
    to: "Cautious evidence-backed hypothesis",
  },
  { from: "Team data table", to: "Mean-and-range data table" },
];

const TTT12_STUDENT_METHOD = [
  { from: "HOW TO BUILD AND RUN IT", to: "HOW TO RUN IT" },
  {
    from: "Count the breathing pores and rank leaves by how they manage water.",
    to: "Compare stomatal density with a standardized count and make a cautious, testable hypothesis.",
  },
  {
    from: "Most accurate detective ranking with clean data and strong evidence.",
    to: "Most reliable density comparison with mean, range, and an evidence-limited hypothesis.",
  },
  {
    from: "Leaves breathe through tiny pores called stomata. They open to take in carbon dioxide and let oxygen out, but open stomata also lose water. The number and spacing of stomata reflect how a plant balances feeding itself against drying out.",
    to: "Stomata are pores that support carbon-dioxide uptake and water-vapor loss. Actual gas exchange and water use depend on aperture, pore size, conductance, species, leaf surface, and environmental conditions, not stomatal counts alone.",
  },
  {
    from: "You make a safe leaf peel or use prepared slides, count stomata in several fields of view, and average. Comparing counts across leaves lets you rank them by water strategy with real data.",
    to: "Use the same leaf surface, preparation, magnification, field area, and counting rule for every sample. Count at least three fields, then report the mean and range. Compare stomatal density and make a cautious hypothesis; counts alone cannot rank actual water use.",
  },
  {
    from: "Count stomata in three or more fields of view and average to reduce error.",
    to: "Count stomata in three or more equal fields of view, then calculate the mean and range to show both center and variation.",
  },
  {
    from: "Repeat for different leaves and build a team data table of counts per field.",
    to: "Repeat with the same surface, preparation, magnification, field area, and counting rule, then build a team density table.",
  },
  {
    from: "Rank by water strategy.  ",
    to: "Compare density cautiously.  ",
  },
  {
    from: "Use your counts to rank leaves from water-saving to water-spending, citing the data.",
    to: "Compare mean stomatal density and range, then write a cautious hypothesis. Counts alone cannot rank actual water use; aperture, pore size, gas exchange, species, and conditions also matter.",
  },
  {
    from: "Clean, complete data is worth as much as a fast result.",
    to: "Use one standardized counting method and report both mean and range for every leaf.",
  },
  {
    from: "Prediction (what will work best, and why):  ",
    to: "Prediction (which sample will have the highest stomatal density, and why):  ",
  },
  {
    from: "Leaf 1 name/type and counts per field (at least 3):    ____  ____  ____   average: ",
    to: "Leaf 1 name/type and counts per field (at least 3):    ____  ____  ____   mean: ____   range: ",
  },
  {
    from: "Leaf 2 name/type and counts per field (at least 3):    ____  ____  ____   average: ",
    to: "Leaf 2 name/type and counts per field (at least 3):    ____  ____  ____   mean: ____   range: ",
  },
  {
    from: "Leaf 3 name/type and counts per field (at least 3):    ____  ____  ____   average: ",
    to: "Leaf 3 name/type and counts per field (at least 3):    ____  ____  ____   mean: ____   range: ",
  },
  {
    from: "Our ranking, water-saving to water-spending (use the averages):    ",
    to: "Density comparison, highest to lowest mean under our fixed method:    ",
  },
  { from: "DEFEND YOUR RANKING", to: "DEFEND YOUR COMPARISON" },
  {
    from: "What counts (numbers) support your ranking from water-saving to water-spending?    ",
    to: "What mean and range support your density comparison, and what cautious hypothesis can you make?    ",
  },
  {
    from: "Where could counting error sneak in, and how did averaging several fields help?    ",
    to: "Where could counting error enter, and what do the mean and range reveal about sampling variation?    ",
  },
  ...TTT12_SCORE_LABELS,
];

const TTT12_GUIDE_METHOD = [
  {
    from: "Tier 2 (building but not reasoning): ",
    to: "Tier 2 (counting but not reasoning): ",
  },
  {
    from: "Count stomata and rank leaves by water strategy",
    to: "Compare standardized stomatal density without overclaiming water use",
  },
  {
    from: "Count the breathing pores and rank leaves by how they manage water.  Plan about 80 minutes for the core block; 4 teams of 4 students, one digital microscope per team.",
    to: "Compare stomatal density with a standardized count and make a cautious, testable hypothesis.  Plan about 80 minutes for the core block; 4 teams of 4 students, one digital microscope per team.",
  },
  {
    from: "Design a fair test by controlling one variable while holding others constant (Apply).",
    to: "Apply one standardized surface, preparation, magnification, field area, and counting rule across samples (Apply).",
  },
  {
    from: "Use their own data to decide whether a redesign improved the result (Analyze).",
    to: "Calculate and compare mean stomatal density and range from at least three fields per sample (Analyze).",
  },
  {
    from: "Defend a final claim with specific evidence (Evaluate).",
    to: "Defend a cautious hypothesis while stating that counts alone cannot rank actual water use (Evaluate).",
  },
  {
    from: "Stage the scoring sheet, the grid/counting sheets, and 4 backup prepared stomata slides, and decide the counting convention (count every stoma fully inside the field, at least three fields per leaf) so all teams count the same way.",
    to: "Stage the scoring and counting sheets plus 4 backup prepared slides. Fix the same leaf surface, preparation, magnification, field area, and fully-inside counting rule for all samples; require at least three fields and both mean and range.",
  },
  {
    from: "Pose the mission as a challenge: \"Count the breathing pores and rank leaves by how they manage water.\" Take a quick prediction by show of hands.",
    to: "Pose the mission as a challenge: \"Compare stomatal density with one standardized method, then make a cautious hypothesis.\" Take a quick prediction by show of hands.",
  },
  {
    from: "Before any materials move, each team writes one prediction and one reason on the handout. No building yet.",
    to: "Before preparing slides, each team predicts which sample will have the highest stomatal density and gives one reason.",
  },
  {
    from: "Set the rules: approved materials only, change one variable at a time, record at least one data point before any redesign, and follow the safety notes.",
    to: "Use the same leaf surface, preparation, magnification, field area, and counting rule for every sample. Count at least three fields and report mean plus range; there is no redesign round.",
  },
  {
    from: "Teams make clear-polish impressions of 3 to 4 leaves at the ventilated station, lift them with tape onto labeled slides, then focus each slide and count stomata in at least three fields per leaf. Circulate, check that they count the same way every time and log every field, and resist counting for them.",
    to: "Teams prepare impressions at the ventilated station, then count at least three equal fields per sample using the fixed surface, preparation, magnification, field area, and fully-inside rule. Circulate to verify the standard without counting for them.",
  },
  { from: "Phase 5  Average and rank", to: "Phase 5  Calculate and compare" },
  {
    from: "Teams average their counts per leaf and rank the leaves from water-saving (fewer stomata) to water-spending (more stomata), citing the numbers.",
    to: "Teams calculate mean and range for each sample and compare stomatal density. They may state a cautious hypothesis, but counts alone cannot rank actual water use.",
  },
  {
    from: "Phase 6  Check a second surface or species   (extension)",
    to: "Phase 6  Add evidence or test a surface   (extension)",
  },
  {
    from: "Teams who finish make an impression of a top surface or a different species and compare it to their lower-surface counts, noting where most stomata are.",
    to: "Teams who finish add a fourth standardized field or test the other surface as a separately labeled comparison, then recompute mean and range without claiming actual water use.",
  },
  {
    from: "Teams submit a score slip, defend their ranking with their counts, then reset the station: bin used tape, peels, and browned leaves, return microscopes and reusable slides to the bin, cap the polish, wipe the tables, and wash hands (remove gloves first if worn).",
    to: "Teams submit a score slip, defend the density comparison with mean and range, state the counts-only limitation, then reset the station, cap polish, wipe tables, and wash hands after removing gloves if worn.",
  },
  ...troubleshootingPair(
    "A team's counts vary wildly between fields.",
    "Counts vary widely between fields.",
    "Standardize the count: same magnification, count only stomata fully inside the field, do not move the stage mid-count, and average at least three fields; treat it as a data-quality coaching moment.",
    "Recheck the fixed surface, magnification, field area, and fully-inside rule. Keep all valid fields and report the range with the mean rather than hiding variation.",
  ),
  ...troubleshootingPair(
    "The peel shows nothing under the microscope.",
    "The peel shows nothing under the microscope.",
    "Confirm the polish dried fully before taping, that the underside was painted (most stomata are there), and that the leaf was not browned by the solvent; if it failed, switch that team to a backup prepared slide so they can still count and rank.",
    "Confirm the polish dried fully and the intended surface was sampled. If it failed, use a backup prepared slide so the team can still compare standardized density.",
  ),
  ...troubleshootingPair(
    "A team finishes early.",
    "A team finishes early.",
    "Push the extension prompt below and ask them to quantify their improvement.",
    "Add a fourth standardized field, recompute mean and range, and explain whether the extra field changes the cautious hypothesis.",
  ),
  {
    from: '"What single change could improve your result without changing anything else?"',
    to: '"Which parts of the sampling method must stay identical for a density comparison?"',
  },
  {
    from: '"Run a second version that isolates a different variable and compare the two with data."',
    to: '"What aperture, pore-size, gas-exchange, species, and environmental data would be needed before discussing actual water use?"',
  },
  {
    from: "What does a high stomata count suggest about a leaf's habitat?",
    to: "Why can stomatal counts alone not determine a leaf's actual water use?",
  },
  ...TTT12_SCORE_LABELS,
  {
    from: "Return reusable items to the bin, dispose of consumables, wipe surfaces, and collect score slips.",
    to: "Return microscopes and slides, dispose of used tape and peels, cap polish at the ventilated station, wipe tables, wash hands, and collect score slips.",
  },
  {
    from: "California Academy of Sciences, Stomata Printing microscope investigation (clear nail polish + clear tape impressions, grades 3 to 12); Rothamsted Bioimaging, Measuring Stomatal Density using nail varnish; Science and Plants for Schools (SAPS), Measuring Stomatal Density.",
    to: "California Academy of Sciences, Stomata Printing microscope investigation; Rothamsted Bioimaging, Measuring Stomatal Density using nail varnish; Bertolino, Caine, and Gray (2019), PMCID PMC6414756; Lunn et al. (2024), PMCID PMC11565199; USDA Forest Service hardwood physiology research.",
  },
];

const PACKET_GUIDE_METHOD = {
  "PYS-06": [
    {
      from: "Constraints: approved materials, one variable at a time, record before redesign.",
      to: "Fixed protocol: predict each station first; keep the slinky flat, held, and under about 3 m; measure L and count full round trips N.",
    },
    {
      from: "Build or solve, then run the standard test for a baseline.",
      to: "Predict and test the fixed cards, then time N full round trips and calculate total distance = 2 x L x N.",
    },
    {
      from: "Redesign one variable, re-test, compare to baseline.",
      to: "Check units and arithmetic, then defend one station answer with an observation and the round-trip calculation.",
    },
  ],
  "PYS-08": [
    {
      from: "Constraints: approved materials, one variable at a time, record before redesign.",
      to: "Fixed protocol: predict before each of the four challenge cards; test next to a clear wall and spot the backless-chair stand.",
    },
    {
      from: "Build or solve, then run the standard test for a baseline.",
      to: "Rotate through the four fixed challenge cards and record the observed result plus one force map for each.",
    },
    {
      from: "Redesign one variable, re-test, compare to baseline.",
      to: "Compare predictions with results and defend one center-of-mass explanation; do not invent a new pose or redesign round.",
    },
  ],
  "PYS-10": [
    {
      from: "Constraints: approved materials, one variable at a time, record before redesign.",
      to: "Fixed method: predict, observe, and sketch each mystery spectrum before consulting the reference cards.",
    },
    {
      from: "Build or solve, then run the standard test for a baseline.",
      to: "Observe, sketch, match, and justify each source using a smooth rainbow, broad band, or separate lines as evidence.",
    },
    {
      from: "Redesign one variable, re-test, compare to baseline.",
      to: "Audit the matches against visible evidence, then connect a line spectrum to fireworks colors without flame tests.",
    },
  ],
  "PYS-11": [
    {
      from: "What made one route faster than another?",
      to: "What made one route use fewer legal moves?",
    },
    {
      from: "Constraints: approved materials, one variable at a time, record before redesign.",
      to: "Shared-mat rules: start and finish at DEPOT, move orthogonally, retrieve every listed address, and run one team at a time.",
    },
    {
      from: "Build or solve, then run the standard test for a baseline.",
      to: "Plan on team copies, then run the selected card on the shared judging mat while staff count legal moves.",
    },
    {
      from: "Redesign one variable, re-test, compare to baseline.",
      to: "Compare legal moves with that card's verified optimum, compute normalized efficiency, and defend the routing rule.",
    },
  ],
  "PYB-04": [
    {
      from: "Constraints: approved materials, one variable at a time, record before redesign.",
      to: "UPC-A rule: verify 12 digits from the left, multiply odd positions by 3, and accept only totals that are multiples of 10.",
    },
    {
      from: "Build or solve, then run the standard test for a baseline.",
      to: "Verify and classify 12-digit UPC-A codes, recording correct detections and false alarms from the staff key.",
    },
    {
      from: "Redesign one variable, re-test, compare to baseline.",
      to: "Audit flagged cards, show one complete weighted sum, and explain why a single changed digit is detected.",
    },
  ],
};

const REPLACEMENTS = {
  PYS_01_Magnetic_Capsule_Maze_Cup_Student_Handout: [
    {
      from: "Safety:  You steer only the steel token (a paperclip or washer). NEVER touch or hold the tiny magnets. Swallowing two magnets, or a magnet plus a steel object, is a medical emergency. Keep all magnets away from mouths, electronics, and medical implants. A teacher counts magnets in and out.  ",
      to: "Safety: You steer only the steel token (a paperclip or washer). NEVER touch or hold loose magnets. If anyone may have swallowed a magnet, tell an adult immediately and get medical help. Keep all magnets away from mouths, electronics, and medical implants. A teacher counts magnets in and out.  ",
    },
  ],
  PYS_02_Oobleck_Armor_Arena_Instructor_Guide: [
    {
      from: "test weights, and a sealed corn-allergy pad (teacher-made)",
      to: "a sealed corn-allergy pad (teacher-made)",
    },
  ],
  PYS_03_Cardboard_Automata_Arcade_Instructor_Guide: [
    {
      from: "hot glue station",
      to: "staff-run low-temperature hot glue station",
    },
  ],
  PYS_03_Cardboard_Automata_Arcade_Student_Handout: [
    {
      from: "Cut a cam disc and glue it firmly to the shaft so it cannot slip or spin. An off-center or oval cam gives more motion.",
      to: "Cut a cam disc, then ask staff to use low-temperature hot glue to secure it to the shaft so it cannot slip. An off-center or oval cam gives more motion.",
    },
    {
      from: "Glue a straw into the top of the frame as a guide, then slide a vertical rod down through it to rest on the cam. The rod must slide freely in the straw so it rises and falls as you crank.",
      to: "Ask staff to use low-temperature hot glue to secure a straw in the frame as a guide, then slide a vertical rod through it so it rests on the cam and rises and falls freely as you crank.",
    },
    {
      from: "Hot glue is staff-supervised. Scissors stay seated and closed when not in use.  Allergy: None.",
      to: "Low-temperature hot glue is staff-only; wait until glue cools before handling the build. Scissors stay seated and closed when not in use.  Allergy: None.",
    },
    {
      from: "Hot glue",
      to: "Low-temperature hot glue (staff only)",
    },
  ],
  PYS_04_Stethoscope_Sprint_and_Recovery_Challenge_Student_Handout: [
    {
      from: "With consent, count the pulse at the wrist or neck for a timed window. If the stethoscope is hard to hear, the wrist or neck count still works.",
      to: "With consent, count the radial pulse at the wrist for a timed window. If the stethoscope is hard to hear, the wrist count still works. Do not take a neck pulse.",
    },
    {
      from: "After light activity, measure how heart rate returns toward rest. Sanitize shared parts.",
      to: "After optional light activity, measure how heart rate trends toward its starting level. Anyone may opt out and take a recorder or timer role. Stop immediately and tell an adult if you feel dizzy, have chest pain, have unusual trouble breathing, or feel unwell. Sanitize shared parts.",
    },
    {
      from: "Sanitize shared parts. No forced heart-rate measurement. Use pulse count alternative.  Allergy: Latex balloon alternative: plastic wrap or nitrile membrane.",
      to: "Sanitize shared parts. Wrist pulse only; no neck pulse. Measurement and light activity are optional. Follow any health-plan or staff restriction, and stop immediately for dizziness, chest pain, unusual trouble breathing, or feeling unwell.  Allergy: Latex balloon alternative: plastic wrap or nitrile membrane.",
    },
  ],
  PYS_04_Stethoscope_Sprint_and_Recovery_Challenge_Instructor_Guide: [
    {
      from: "Stage only the activity-specific safety controls named in the student safety note and staff run sheet; gloves, goggles, and trays are not universal requirements.",
      to: "Use the radial wrist pulse only, never a neck pulse. Measurement and light activity require consent; offer recorder and timer roles. Follow health-plan restrictions, and stop immediately for dizziness, chest pain, unusual trouble breathing, or feeling unwell. Sanitize every shared earpiece, tube end, and funnel between users.",
    },
    {
      from: "What does a fast recovery suggest?",
      to: "Why must repeated pulse counts use the same method and conditions?",
    },
  ],
  PYS_06_SONAR_Slinky_Showdown_Student_Handout: [
    ...PYS06_HANDOUT_METHOD,
    {
      from: "Send one pulse, count 4 to 6 reflections, time the whole sequence, then divide the total distance by the total time. That gives a steadier speed than timing one trip, the SONAR idea.",
      to: "Measure lane length L. Time N full down-and-back round trips, so total distance = 2 × L × N. Divide that distance by the total time. Timing several round trips gives a steadier speed than timing one trip.",
    },
    {
      from: "Safety:  Keep the slinky flat on the floor and never let go while it is stretched, or it can snap back and hurt someone. Do not overstretch it (about 3 m max). Keep fingers clear of coils.  ",
      to: "Safety: Wear goggles whenever the slinky is stretched. Keep it flat on the floor and never let go while it is stretched, or it can snap back and hurt someone. Do not overstretch it (about 3 m max). Keep fingers clear of coils.  ",
    },
  ],
  PYS_06_SONAR_Slinky_Showdown_Instructor_Guide: [
    ...PYS06_GUIDE_METHOD,
    {
      from: "4 to 6 metal slinkies",
      to: "4 to 6 metal slinkies; safety goggles: one pair per participant while any slinky is stretched",
    },
    {
      from: "Stage only the activity-specific safety controls named in the student safety note and staff run sheet; gloves, goggles, and trays are not universal requirements.",
      to: "Issue goggles before any slinky is stretched. Keep every slinky flat on the floor, never release it while stretched, limit the stretch to about 3 m, and keep fingers clear of the coils. Gloves and trays are not required.",
    },
  ],
  PYS_08_Low_Ropes_Force_Map_Relay_Student_Handout: PYS08_HANDOUT_METHOD,
  PYS_08_Low_Ropes_Force_Map_Relay_Instructor_Guide: PYS08_GUIDE_METHOD,
  PYS_09_Hovercraft_Hockey_Hackathon_Student_Handout: [
    {
      from: "Best glide plus control in a gym-safe tournament.",
      to: "Highest normalized glide and five-shot target scores, with explanation and build quality.",
    },
    {
      from: "Hot glue",
      to: "Low-temperature hot glue",
    },
    {
      from: "Glue a pop-top cap over the center hole of the disc, sealing the edge.",
      to: "Ask a staff member to use low-temperature hot glue to attach a pop-top cap over the center hole of the disc and seal the edge.",
    },
    {
      from: "Safety:  Latex allergy note. No face-level launches. Play floor-only. A grown-up inflates the balloons; throw away any balloon that pops right away.  ",
      to: "Safety: Low-temperature hot glue is staff-only; wait until it cools before handling the puck. Latex allergy note. No face-level launches. Play floor-only. A grown-up inflates the balloons; throw away any balloon that pops right away.  ",
    },
    {
      from: "Compete in gym-safe rounds. Glide and control both count.",
      to: "Use the Glide Test and Target Rules sheet. Glide points are normalized to the field-best distance out of 30; divide the five-shot target total by 6 and round for a maximum of 25.",
    },
  ],
  PYS_09_Hovercraft_Hockey_Hackathon_Instructor_Guide: [
    {
      from: "hot glue station",
      to: "staff-run low-temperature hot glue station",
    },
    {
      from: "Stage only the activity-specific safety controls named in the student safety note and staff run sheet; gloves, goggles, and trays are not universal requirements.",
      to: "Only staff operate low-temperature hot glue and campers wait for it to cool. An adult inflates balloons; discard popped pieces immediately. Use floor or tabletop launches only, never face-level launches, and provide a nonlatex alternative when required.",
    },
    {
      from: "Build a puck that moves by barely touching the floor.  Plan about 80 minutes for the core block; 4 to 6 teams of 4 to 5 students.",
      to: "Build a puck that moves by barely touching the floor.  Plan about 80 minutes for the core block; 4 to 6 teams of 4 to 5 students. Score glide as round(30 x team best / field best), capped at 30; score the five-shot target total as round(raw / 6), capped at 25.",
    },
  ],
  PYS_10_Spectra_Sleuth_Showdown_Student_Handout: PYS10_HANDOUT_METHOD,
  PYS_10_Spectra_Sleuth_Showdown_Instructor_Guide: PYS10_GUIDE_METHOD,
  PYS_11_BookBot_Bin_Logic_Challenge_Student_Handout: [
    {
      from: "Most correct retrievals with few traffic conflicts and clear algorithm defense.",
      to: "Most correct retrievals with the fewest legal moves and a clear algorithm defense.",
    },
    {
      from: "Letter the rows down the side (A-D) and number the columns across the top (1-6) so an address like B3 is clear. Place items by address, not by subject.",
      to: "Use one shared tabletop judging mat with rows A-D and columns 1-6. Mark DEPOT immediately left of A1. Teams may use separate copies to plan, but they run the shared mat one at a time.",
    },
    {
      from: "Order your retrievals to minimize travel and avoid collisions with other teams.",
      to: "Start at DEPOT, order the retrievals, and return to DEPOT. One legal move goes to an orthogonally adjacent bin (never diagonal) or between DEPOT and A1. Route cost is the number of legal moves.",
    },
    {
      from: "Fetch the items by address against the clock. Wrong items cost points.",
      to: "Move one legal step at a time, retrieve each requested address, and return to DEPOT. Record legal moves before time; a missed address or illegal jump makes the run incomplete.",
    },
    {
      from: "Low traffic conflicts",
      to: "Legal complete route",
    },
    {
      from: "Efficiency",
      to: "Efficiency versus card optimum",
    },
    ...PYS11_HANDOUT_METHOD,
  ],
  PYS_11_BookBot_Bin_Logic_Challenge_Instructor_Guide: [
    ...PYS11_GUIDE_METHOD,
    {
      from: "route mat",
      to: "planning route mats: one per team; shared judging mat: one",
    },
    {
      from: "Set up one station per team with the materials above, sorted and ready.",
      to: "Give each team a planning copy, then stage one shared tabletop judging mat. Mark DEPOT immediately left of A1 and run one team at a time.",
    },
    {
      from: "Stage only the activity-specific safety controls named in the student safety note and staff run sheet; gloves, goggles, and trays are not universal requirements.",
      to: "Use tabletop pointers only. Keep the shared judging mat clear of actual library operations; no gloves, goggles, or trays are required.",
    },
    {
      from: "Set the rules: approved materials only, change one variable at a time, record at least one data point before any redesign, and follow the safety notes.",
      to: "Set the route rules: start and finish at DEPOT; one move is an orthogonal step between adjacent bins or between DEPOT and A1; retrieve every requested address; no diagonal moves or jumps.",
    },
    {
      from: "Teams run the standard test and log a baseline result before changing anything.",
      to: "Teams plan on their own copies, then run one at a time on the shared mat. Record legal-move count before time; a missed address or illegal jump makes the route incomplete. Use the instructor route and scoring key to compare the card minimum and normalize the efficiency score.",
    },
    {
      from: "Teams submit a score slip, answer a debrief question with evidence, and reset the station. PPE off, wash or wipe down.",
      to: "Teams submit a score slip, answer a debrief question with evidence, clear their pointer and order card, and reset the shared mat to DEPOT.",
    },
    {
      from: "Low traffic conflicts",
      to: "Legal complete route",
    },
    {
      from: "Efficiency",
      to: "Efficiency versus card optimum",
    },
  ],
  PYB_04_Barcode_Checksum_Rescue_Student_Handout: PYB04_HANDOUT_METHOD,
  PYB_04_Barcode_Checksum_Rescue_Instructor_Guide: PYB04_GUIDE_METHOD,
  PY_STEM_Instructor_Guide_Packet: [
    {
      from: "test weights, and a sealed corn-allergy pad (teacher-made)",
      to: "a sealed corn-allergy pad (teacher-made)",
    },
    {
      from: "hot glue station",
      to: "staff-run low-temperature hot glue station",
      expected: 2,
    },
    {
      from: "Build a medical listening tool and use it like a sports scientist.  About 80 min; 4 to 6 teams.",
      to: "Build a medical listening tool and use it like a sports scientist.  About 80 min; 4 to 6 teams. Use radial wrist pulse only, never a neck pulse. Measurement and light activity are optional; follow health-plan restrictions and stop for dizziness, chest pain, unusual trouble breathing, or feeling unwell.",
    },
    {
      from: "What does a fast recovery suggest?",
      to: "Why must repeated pulse counts use the same method and conditions?",
    },
    {
      from: "Make invisible distance sensing visible with a slinky pulse.  About 80 min; 4 to 6 teams.",
      to: "Make invisible distance sensing visible with a slinky pulse.  About 80 min; 4 to 6 teams. Goggles are required whenever a slinky is stretched; keep it flat, held at both ends, and no longer than about 3 m.",
    },
    {
      from: "4 to 6 metal slinkies",
      to: "4 to 6 metal slinkies; safety goggles: one pair per participant while any slinky is stretched",
    },
    {
      from: "Retrieve the right book by using bin addresses, not a conveyor race.  About 80 min; 4 to 6 teams.",
      to: "Retrieve the right book by using bin addresses, not a conveyor race.  About 80 min; 4 to 6 teams. For this station, override the generic setup: one shared tabletop judging mat, DEPOT beside A1, one team at a time, orthogonal adjacent moves only, start and finish at DEPOT, and score legal moves before time. Normalize the efficiency score as max(0, 10 - (team legal moves - card minimum)); use time only as a tie-breaker.",
    },
    {
      from: "Build a puck that moves by barely touching the floor.  About 80 min; 4 to 6 teams.",
      to: "Build a puck that moves by barely touching the floor.  About 80 min; 4 to 6 teams. Only staff use low-temperature hot glue. Score glide as round(30 x team best / field best), capped at 30; score the five-shot target total as round(raw / 6), capped at 25.",
    },
    {
      from: "Low traffic conflicts",
      to: "Legal complete route",
    },
    {
      from: "Efficiency",
      to: "Efficiency versus card optimum",
    },
    {
      from: "route mat",
      to: "planning route mats: one per team; shared judging mat: one",
    },
    {
      from: "Make a nerve signal survive a gap",
      to: "Test a domino relay across a gap and name the model's limits",
      expected: 2,
    },
    {
      from: "How is a bridge piece like a synapse?",
      to: "Why is the bridge only an engineering repair rather than a literal synapse or myelin sheath?",
    },
    {
      from: "Dominoes",
      to: "Dominoes: about 16 tiles for one shared backup track",
    },
    {
      from: "Rulers",
      to: "Rulers: shared at the backup track",
    },
  ],
  PY_STEM_Score_Sheets_and_Leaderboard: [
    {
      from: "Low traffic conflicts",
      to: "Legal complete route",
    },
    {
      from: "Efficiency",
      to: "Efficiency versus card optimum",
    },
  ],
  PY_STEM_Student_Handout_Packet: [
    {
      from: "Best glide plus control in a gym-safe tournament.",
      to: "Highest normalized glide and five-shot target scores, with explanation and build quality.",
    },
    {
      from: "Safety:  You steer only the steel token (a paperclip or washer). NEVER touch or hold the tiny magnets. Swallowing two magnets, or a magnet plus a steel object, is a medical emergency. Keep all magnets away from mouths, electronics, and medical implants. A teacher counts magnets in and out.  ",
      to: "Safety: You steer only the steel token (a paperclip or washer). NEVER touch or hold loose magnets. If anyone may have swallowed a magnet, tell an adult immediately and get medical help. Keep all magnets away from mouths, electronics, and medical implants. A teacher counts magnets in and out.  ",
    },
    {
      from: "Cut a cam disc and glue it firmly to the shaft so it cannot slip or spin. An off-center or oval cam gives more motion.",
      to: "Cut a cam disc, then ask staff to use low-temperature hot glue to secure it to the shaft so it cannot slip. An off-center or oval cam gives more motion.",
    },
    {
      from: "Glue a straw into the top of the frame as a guide, then slide a vertical rod down through it to rest on the cam. The rod must slide freely in the straw so it rises and falls as you crank.",
      to: "Ask staff to use low-temperature hot glue to secure a straw in the frame as a guide, then slide a vertical rod through it so it rests on the cam and rises and falls freely as you crank.",
    },
    {
      from: "Glue a pop-top cap over the center hole of the disc, sealing the edge.",
      to: "Ask a staff member to use low-temperature hot glue to attach a pop-top cap over the center hole of the disc and seal the edge.",
    },
    {
      from: "Safety:  Latex allergy note. No face-level launches. Play floor-only. A grown-up inflates the balloons; throw away any balloon that pops right away.  ",
      to: "Safety: Low-temperature hot glue is staff-only; wait until it cools before handling the puck. Latex allergy note. No face-level launches. Play floor-only. A grown-up inflates the balloons; throw away any balloon that pops right away.  ",
    },
    {
      from: "Compete in gym-safe rounds. Glide and control both count.",
      to: "Use the Glide Test and Target Rules sheet. Glide points are normalized to the field-best distance out of 30; divide the five-shot target total by 6 and round for a maximum of 25.",
    },
    {
      from: "Hot glue is staff-supervised. Scissors stay seated and closed when not in use.  Allergy: None.",
      to: "Low-temperature hot glue is staff-only; wait until glue cools before handling the build. Scissors stay seated and closed when not in use.  Allergy: None.",
    },
    {
      from: "With consent, count the pulse at the wrist or neck for a timed window. If the stethoscope is hard to hear, the wrist or neck count still works.",
      to: "With consent, count the radial pulse at the wrist for a timed window. If the stethoscope is hard to hear, the wrist count still works. Do not take a neck pulse.",
    },
    {
      from: "After light activity, measure how heart rate returns toward rest. Sanitize shared parts.",
      to: "After optional light activity, measure how heart rate trends toward its starting level. Anyone may opt out and take a recorder or timer role. Stop immediately and tell an adult if you feel dizzy, have chest pain, have unusual trouble breathing, or feel unwell. Sanitize shared parts.",
    },
    {
      from: "Sanitize shared parts. No forced heart-rate measurement. Use pulse count alternative.  Allergy: Latex balloon alternative: plastic wrap or nitrile membrane.",
      to: "Sanitize shared parts. Wrist pulse only; no neck pulse. Measurement and light activity are optional. Follow any health-plan or staff restriction, and stop immediately for dizziness, chest pain, unusual trouble breathing, or feeling unwell.  Allergy: Latex balloon alternative: plastic wrap or nitrile membrane.",
    },
    {
      from: "Safety:  Keep the slinky flat on the floor and never let go while it is stretched, or it can snap back and hurt someone. Do not overstretch it (about 3 m max). Keep fingers clear of coils.  ",
      to: "Safety: Wear goggles whenever the slinky is stretched. Keep it flat on the floor and never let go while it is stretched, or it can snap back and hurt someone. Do not overstretch it (about 3 m max). Keep fingers clear of coils.  ",
    },
    {
      from: "Send one pulse, count 4 to 6 reflections, time the whole sequence, then divide the total distance by the total time. That gives a steadier speed than timing one trip, the SONAR idea.",
      to: "Measure lane length L. Time N full down-and-back round trips, so total distance = 2 × L × N. Divide that distance by the total time. Timing several round trips gives a steadier speed than timing one trip.",
    },
    {
      from: "A line of falling dominoes is a model of a nerve signal: each one knocks the next, so the signal travels without any single domino moving far. A real neuron passes a signal down its length the same way, one step triggering the next.",
      to: "A line of falling dominoes is a limited model of signal propagation along one axon: each tile triggers the next, while no single tile travels down the track. Real nerve impulses use moving ions, not falling cells, so the model has limits.",
    },
    {
      from: "If the gap between dominoes is too large, the signal dies. Neurons face the same problem at synapses. A myelin sheath speeds signals along; you model gaps and insulation to keep the relay fast and reliable.",
      to: "A large gap breaks this mechanical relay. In a real neuron, myelin insulates sections of the axon so an impulse travels quickly between exposed nodes. A synapse is a different junction between cells; myelin does not bridge it.",
    },
    {
      from: "Add a bridge piece, like a synapse helper, so the signal survives.",
      to: "Add a bridge piece so this mechanical relay survives. Call it an engineering repair, not a literal synapse or myelin sheath.",
    },
    {
      from: "Speed it up like myelin.  ",
      to: "Test a faster relay analogy.  ",
    },
    {
      from: "Tape a few tiles into rigid blocks that fall as one unit, so the signal jumps block to block and reaches the end faster than the evenly spaced line.",
      to: "Tape a few tiles into rigid blocks and compare the travel time with the evenly spaced line. Treat fewer active handoffs as an analogy for faster transmission, not a physical model of myelin.",
    },
    {
      from: "Connect your design choices to neurons, synapses, and myelin.",
      to: "Explain what the domino relay can represent, and state that myelin insulates one axon while a synapse connects different cells.",
    },
    {
      from: "Most correct retrievals with few traffic conflicts and clear algorithm defense.",
      to: "Most correct retrievals with the fewest legal moves and a clear algorithm defense.",
    },
    {
      from: "Letter the rows down the side (A-D) and number the columns across the top (1-6) so an address like B3 is clear. Place items by address, not by subject.",
      to: "Use one shared tabletop judging mat with rows A-D and columns 1-6. Mark DEPOT immediately left of A1. Teams may use separate copies to plan, but they run the shared mat one at a time.",
    },
    {
      from: "Order your retrievals to minimize travel and avoid collisions with other teams.",
      to: "Start at DEPOT, order the retrievals, and return to DEPOT. One legal move goes to an orthogonally adjacent bin (never diagonal) or between DEPOT and A1. Route cost is the number of legal moves.",
    },
    {
      from: "Fetch the items by address against the clock. Wrong items cost points.",
      to: "Move one legal step at a time, retrieve each requested address, and return to DEPOT. Record legal moves before time; a missed address or illegal jump makes the run incomplete.",
    },
    {
      from: "Low traffic conflicts",
      to: "Legal complete route",
    },
    {
      from: "Efficiency",
      to: "Efficiency versus card optimum",
    },
  ],
  PYB_02_Domino_Neuron_Relay_Student_Handout: [
    {
      from: "A line of falling dominoes is a model of a nerve signal: each one knocks the next, so the signal travels without any single domino moving far. A real neuron passes a signal down its length the same way, one step triggering the next.",
      to: "A line of falling dominoes is a limited model of signal propagation along one axon: each tile triggers the next, while no single tile travels down the track. Real nerve impulses use moving ions, not falling cells, so the model has limits.",
    },
    {
      from: "If the gap between dominoes is too large, the signal dies. Neurons face the same problem at synapses. A myelin sheath speeds signals along; you model gaps and insulation to keep the relay fast and reliable.",
      to: "A large gap breaks this mechanical relay. In a real neuron, myelin insulates sections of the axon so an impulse travels quickly between exposed nodes. A synapse is a different junction between cells; myelin does not bridge it.",
    },
    {
      from: "Add a bridge piece, like a synapse helper, so the signal survives.",
      to: "Add a bridge piece so this mechanical relay survives. Call it an engineering repair, not a literal synapse or myelin sheath.",
    },
    {
      from: "Speed it up like myelin.  ",
      to: "Test a faster relay analogy.  ",
    },
    {
      from: "Tape a few tiles into rigid blocks that fall as one unit, so the signal jumps block to block and reaches the end faster than the evenly spaced line.",
      to: "Tape a few tiles into rigid blocks and compare the travel time with the evenly spaced line. Treat fewer active handoffs as an analogy for faster transmission, not a physical model of myelin.",
    },
    {
      from: "Connect your design choices to neurons, synapses, and myelin.",
      to: "Explain what the domino relay can represent, and state that myelin insulates one axon while a synapse connects different cells.",
    },
  ],
  PYB_02_Domino_Neuron_Relay_Instructor_Guide: [
    {
      from: "Make a nerve signal survive a gap",
      to: "Test a domino relay across a gap and name the model's limits",
      expected: 3,
    },
    {
      from: "Explain the core science of this challenge: neurons, signal transmission, myelin analogy (Understand).",
      to: "Explain signal propagation and the model's limits: myelin insulates one axon; synapses connect different cells; systems reliability (Understand).",
    },
    {
      from: "Set up one station per team with the materials above, sorted and ready.",
      to: "Tape down and stage one shared backup track, then rotate all six teams through it sequentially.",
    },
    {
      from: "How is a bridge piece like a synapse?",
      to: "Why is the bridge only an engineering repair rather than a literal synapse or myelin sheath?",
    },
  ],
  TTT_10_Tree_Ring_Climate_Detective_Tournament_Student_Handout: TTT10_STUDENT_METHOD,
  TTT_10_Tree_Ring_Climate_Detective_Tournament_Instructor_Guide: TTT10_GUIDE_METHOD,
  TTT_12_Leaf_Stomata_Microscope_Detective_Student_Handout: TTT12_STUDENT_METHOD,
  TTT_12_Leaf_Stomata_Microscope_Detective_Instructor_Guide: TTT12_GUIDE_METHOD,
  TTT_08_Arboretum_Eco_Quest_Student_Handout: [
    {
      from: "Identifying a tree is detective work: leaf shape, bark texture, branching pattern, and seeds are all clues. A dichotomous key turns those clues into a series of either-or choices that lead to a name.",
      to: "Leaf shape, bark texture, branching pattern, and seeds are observable traits that help narrow possibilities. Use the adaptive evidence key to record those traits, but do not treat them as proof of species. Record a species name only when a staff-verified numbered field tag, visible label, or route key confirms it.",
    },
    {
      from: "Use leaf, bark, and seed clues with the key to answer each station.",
      to: "Use the adaptive evidence key to record leaf, bark, and seed traits at each station. Name a species only from a staff-verified numbered field tag, visible label, or route key.",
    },
    {
      from: "Dichotomous key (laminated, keyed to the route)",
      to: "Adaptive evidence key (laminated); staff-verified tags, labels, or route key confirm species names",
    },
  ],
  TTT_08_Arboretum_Eco_Quest_Instructor_Guide: [
    {
      from: "Design a fair test by controlling one variable while holding others constant (Apply).",
      to: "Plan an efficient checkpoint route that stays within approved field boundaries (Apply).",
    },
    {
      from: "Use their own data to decide whether a redesign improved the result (Analyze).",
      to: "Use observable traits to narrow possibilities, then use a staff-verified field tag, visible label, or route key to confirm species identity (Analyze).",
    },
    {
      from: "Set up one station per team with the materials above, sorted and ready.",
      to: "Assemble one route pack per team with the materials above, sorted and ready.",
    },
    {
      from: "Stage the scoring sheet and any reference values before testing begins.",
      to: "Stage the scoring sheet, staff route key, and verified identity references before teams begin.",
    },
    {
      from: "1 laminated dichotomous key per team, keyed to the route (plus 1 spare; key printed in this guide)",
      to: "1 laminated adaptive evidence key per team (plus 1 spare); use a staff-verified numbered field tag, visible label, or route key to confirm any species name",
    },
    {
      from: "Set the rules: approved materials only, change one variable at a time, record at least one data point before any redesign, and follow the safety notes.",
      to: "Set the field method: stay with the team on approved paths, plan a no-backtrack route, record observable traits at every checkpoint, and use verified sources for species names.",
    },
    {
      from: "Teams walk their route, use the clue cards and the dichotomous key to answer each checkpoint, record the justifying clue, and collect the evidence token. Circulate, ask which clue led to each answer, and resist naming the tree for them.",
      to: "Teams walk their route, use the clue cards and adaptive evidence key to record observable traits, then use a staff-verified numbered field tag, visible label, or route key for any species name. They record the evidence and collect the token. Circulate and ask which evidence supports each answer.",
    },
    {
      from: "A team is stuck at a checkpoint and cannot reach a name.  Fix: Send them back to the first either-or choice on the key, have them point to the actual leaf or bark feature that decides it, and use the optional QR code only to confirm after they commit to an answer.",
      to: "A team is stuck at a checkpoint.  Fix: Have them use the adaptive evidence key to record the observable leaf or bark trait. Confirm any species name only from a staff-verified numbered field tag, visible label, route key, or verified Arboretum Explorer record.",
    },
    {
      from: "Push the extension prompt below and ask them to quantify their improvement.",
      to: "Ask them to recheck one checkpoint with a second observable trait and strengthen their evidence record.",
    },
    {
      from: "Tier 2 (building but not reasoning): ",
      to: "Tier 2 (observing but not explaining): ",
    },
    {
      from: "\"What single change could improve your result without changing anything else?\"",
      to: "\"Which observable trait supports your answer, and what source verifies any species name?\"",
    },
    {
      from: "\"Run a second version that isolates a different variable and compare the two with data.\"",
      to: "\"Recheck one checkpoint with a second observable trait, then verify any species name against a field tag, visible label, staff route key, or Arboretum Explorer record.\"",
    },
    {
      from: "Collect the route maps, clue cards, dichotomous keys, clipboards, and evidence tokens and return them to the bin, and collect score slips. Nothing is consumed and there are no surfaces to wipe.",
      to: "Collect the route maps, clue cards, adaptive evidence keys, clipboards, and evidence tokens and return them to the bin, and collect score slips. Nothing is consumed and there are no surfaces to wipe.",
    },
  ],
  From_Trees_to_Tech_Student_Handout_Packet: [
    {
      from: "Identifying a tree is detective work: leaf shape, bark texture, branching pattern, and seeds are all clues. A dichotomous key turns those clues into a series of either-or choices that lead to a name.",
      to: "Leaf shape, bark texture, branching pattern, and seeds are observable traits that help narrow possibilities. Use the adaptive evidence key to record those traits, but do not treat them as proof of species. Record a species name only when a staff-verified numbered field tag, visible label, or route key confirms it.",
    },
    {
      from: "Use leaf, bark, and seed clues with the key to answer each station.",
      to: "Use the adaptive evidence key to record leaf, bark, and seed traits at each station. Name a species only from a staff-verified numbered field tag, visible label, or route key.",
    },
  ],
  From_Trees_to_Tech_Instructor_Guide_Packet: [
    {
      from: "route map, and a laminated dichotomous key per team",
      to: "route map and laminated adaptive evidence key per team; keep the staff route key for verified species names",
    },
    {
      from: "Walk the route and use the clue cards and dichotomous key to answer each checkpoint, then collect the evidence token.",
      to: "Walk the route and use the clue cards and adaptive evidence key to record observable traits. Use a staff-verified numbered field tag, visible label, or route key for any species name, then collect the evidence token.",
    },
  ],
  From_Trees_to_Tech_Score_Sheets_and_Leaderboard: [
    { from: "Correct inferences", to: "Practice-code inferences" },
    ...TTT12_SCORE_LABELS,
  ],
  "2026_STEM_Camps_Master_Curriculum_and_Operations_Guide": [
    {
      from: "Two camps, 24 primary missions and 8 backups, built on one engineering-design loop: predict, build or solve, test, score, redesign, defend.",
      to: "Two camps, 24 primary missions and 8 backups, using activity-specific sequences to predict, build, observe, measure, solve, score, and defend. Redesign appears only where the method and rubric include it.",
    },
    {
      from: "Held ready for weather, trip delays, or materials failure. Same loop, lighter setup.",
      to: "Held ready for weather, trip delays, or materials failure. Activity-specific sequence, lighter setup.",
    },
    {
      from: "Every activity moves teams through the same cycle, which mirrors the engineering design process and the practices in NGSS MS-ETS1.",
      to: "Each activity uses the engineering or scientific practices that fit its actual method; fixed observation, matching, calculation, and routing tasks do not add a redesign round.",
    },
    {
      from: "Predict: teams commit to a prediction and a reason before any materials move.",
      to: "Predict or frame the question: teams state an expectation or decision rule before the activity begins when the method calls for it.",
    },
    {
      from: "Build or solve: teams construct or work the challenge using approved materials.",
      to: "Build, observe, or solve: teams follow the activity-specific construction, field, microscopy, matching, calculation, or routing method.",
    },
    {
      from: "Test: teams run a standard test and record a baseline result.",
      to: "Measure or verify: teams follow the fixed protocol and record the required observations, calculations, or results; a baseline exists only where the activity names one.",
    },
    {
      from: "Redesign: teams change one variable, predict its effect, and re-test.",
      to: "Redesign where applicable: teams change one defined variable and re-test only in activities whose method and rubric include redesign.",
    },
    {
      from: "Score: the 100-point rubric rewards design, data quality, teamwork, and explanation.",
      to: "Score: each 100-point rubric uses the activity's named performance, evidence or reasoning, data or method, safety or cleanup, and collaboration criteria.",
    },
    {
      from: "Best glide plus control in a gym-safe tournament.",
      to: "Highest normalized glide and five-shot target scores, with explanation and build quality.",
    },
    {
      from: "Most correct retrievals with few traffic conflicts and clear algorithm defense.",
      to: "Most correct retrievals with the fewest legal moves, card-normalized efficiency, and clear algorithm defense.",
    },
    {
      from: "PPE is required where splash, soil, oobleck, plant peel, or cleanup risk exists: goggles, nitrile gloves, handwashing.",
      to: "Safety controls are activity-specific: goggles for stretched slinkies; gloves and trays for soil, oobleck, or wet work; optional latex-free gloves at the ventilated polish station; and handwashing after cleanup.",
    },
    {
      from: "Core rule: bins packed before instruction starts, score sheets ready before testing starts, PPE visible before materials are distributed.",
      to: "Core rule: bins packed before instruction starts, score sheets ready before work starts, and each activity's named safety controls staged before materials are distributed.",
    },
    {
      from: "Most accurate climate-event inferences with claim-evidence-reasoning.",
      to: "Most accurate use of the practice-card code, supported with claim-evidence-reasoning.",
    },
    {
      from: "Most accurate detective ranking with clean data and strong evidence.",
      to: "Most reliable density comparison with mean, range, and an evidence-limited hypothesis.",
    },
  ],
  Staff_Setup_Prep_and_Safety_Checklist: [
    {
      from: "Confirm field-trip logistics: greenhouse, arboretum, pool, ropes, Science History Institute, BookBot tour, bus times.",
      to: "Confirm Ambler greenhouse, pool, arboretum, and ropes-course access; Engineering and BookBot hosts; transportation; and the timing in the live schedule.",
    },
  ],
  TTB_04_Photosynthesis_Float_Off_Playoffs_Instructor_Guide: [
    {
      from: "Liquid dish soap: a few drops per 500 mL batch as a wetting agent so the disks sink; the assay fails without it (MISSING from the buy list; add 1 small bottle)",
      to: "Liquid dish soap: a few drops per 500 mL batch as a wetting agent so the disks sink; the assay fails without it",
    },
    {
      from: "Light source: 1 clamp lamp per team with a bright LED or 100 W equivalent bulb, about 12 in (30 cm) above the cup (MISSING from the buy list; borrow 4, or share the PYS-10 lights)",
      to: "Light source: 1 clamp lamp per team with a bright LED or 100 W equivalent bulb, about 12 in (30 cm) above the cup",
    },
  ],
};

// Material tables need row-scoped edits when a common quantity such as
// "per team" occurs elsewhere in the same document. Matching both cells keeps
// these corrections precise without coupling them to extraction indices.
const TABLE_ROW_REPLACEMENTS = {
  PYB_02_Domino_Neuron_Relay_Student_Handout: [
    {
      anchor: "Dominoes",
      replacements: [
        ["Dominoes", "Dominoes for one shared backup track"],
        ["per team", "about 16 tiles total; teams rotate"],
      ],
    },
    {
      anchor: "Rulers",
      replacements: [
        ["Rulers", "Shared rulers"],
        ["per team", "shared at the backup track"],
      ],
    },
  ],
  PYS_06_SONAR_Slinky_Showdown_Student_Handout: [
    {
      anchor: "Metal slinkies",
      replacements: [
        ["Metal slinkies", "Metal slinkies; safety goggles"],
        ["4 to 6", "4 to 6 slinkies; one pair of goggles per participant while stretched"],
      ],
    },
  ],
  PYS_11_BookBot_Bin_Logic_Challenge_Student_Handout: [
    {
      anchor: "Route mat",
      replacements: [
        ["Route mat", "Planning route mats and shared judging mat"],
        ["per team", "one planning copy per team; one shared judging mat"],
      ],
    },
  ],
};

// Packet summaries and station signs repeat generic template strings across
// many activities. Limit these edits to the blocks between unique activity
// headings so unrelated stations retain their intended build workflows.
const SECTION_REPLACEMENTS = {
  PY_STEM_Student_Handout_Packet: [
    {
      start: "SONAR Slinky Showdown",
      end: "Pinhole Precision Challenge",
      replacements: [{ from: "BUILD AND RUN IT", to: "RUN IT" }],
    },
    {
      start: "Low-Ropes Force Map Relay",
      end: "Hovercraft Hockey Hackathon",
      replacements: [
        { from: "BUILD AND RUN IT", to: "RUN IT" },
        PYS08_HANDOUT_METHOD[1],
      ],
    },
    {
      start: "Spectra Sleuth Showdown",
      end: "BookBot Bin Logic Challenge",
      replacements: [
        { from: "BUILD AND RUN IT", to: "RUN IT" },
        PYS10_HANDOUT_METHOD[1],
      ],
    },
    {
      start: "BookBot Bin Logic Challenge",
      end: "Accessibility Ramp Rescue Lab",
      replacements: [
        { from: "BUILD AND RUN IT", to: "RUN IT" },
        PYS11_HANDOUT_METHOD[1],
      ],
    },
    {
      start: "Barcode Checksum Rescue",
      end: "Code Break Cipher Relay",
      replacements: [
        { from: "BUILD AND RUN IT", to: "RUN IT" },
        ...PYB04_HANDOUT_METHOD.slice(1, 3),
      ],
    },
  ],
  PY_STEM_Instructor_Guide_Packet: [
    {
      start: "SONAR Slinky Showdown",
      end: "Pinhole Precision Challenge",
      replacements: PACKET_GUIDE_METHOD["PYS-06"],
    },
    {
      start: "Low-Ropes Force Map Relay",
      end: "Hovercraft Hockey Hackathon",
      replacements: PACKET_GUIDE_METHOD["PYS-08"],
    },
    {
      start: "Spectra Sleuth Showdown",
      end: "BookBot Bin Logic Challenge",
      replacements: PACKET_GUIDE_METHOD["PYS-10"],
    },
    {
      start: "BookBot Bin Logic Challenge",
      end: "Accessibility Ramp Rescue Lab",
      replacements: PACKET_GUIDE_METHOD["PYS-11"],
    },
    {
      start: "Barcode Checksum Rescue",
      end: "Code Break Cipher Relay",
      replacements: PACKET_GUIDE_METHOD["PYB-04"],
    },
  ],
  From_Trees_to_Tech_Instructor_Guide_Packet: [
    {
      start: "Arboretum Eco-Quest",
      end: "Minecraft Tree World Resilience Cup",
      replacements: [
        {
          from: "Constraints: approved materials, one variable at a time, record before redesign.",
          to: "Field method: stay together on approved paths, plan a no-backtrack route, record observable traits, and use verified sources for species names.",
        },
        {
          from: "Check that every answer cites a real observed clue before returning; there is no build or redesign step.",
          to: "Check that every answer cites an observed trait and that every species name uses a verified field tag, visible label, or staff route key before returning.",
        },
      ],
    },
    {
      start: "Tree Ring Climate Detective",
      end: "Lotus Leaf Surface Sprint",
      replacements: [
        {
          from: "Read rings to reconstruct past climate",
          to: "Practice reading stylized rings as proxy evidence",
        },
        {
          from: "Read the rings to reconstruct the climate events a tree lived through.  About 80 min; 4 teams.",
          to: "Use an authored ring-card code to build and defend a model history, then explain what real evidence would require.  About 80 min; 4 teams.",
        },
        {
          from: "Constraints: read each card from center to bark and cite the exact rings for every inference.",
          to: "Practice-card limits: read annual bands center to bark, apply only the authored code, cite exact bands, and distinguish the model from real cross-dated and calibrated evidence.",
        },
        {
          from: "Read the ring sequences and infer the climate events.",
          to: "Read the authored band sequences and assign model events under the printed practice-card code.",
        },
        {
          from: "Back each claim with the exact rings on a claim-evidence card, then synthesize the story.",
          to: "Support each model claim with exact annual bands, synthesize a practice-card history, and state what real cross-dating and local calibration would require.",
        },
        { from: "Correct inferences", to: "Practice-code inferences" },
      ],
    },
    {
      start: "Leaf Stomata Microscope Detective",
      end: "Root Grip Erosion Rescue",
      replacements: [
        {
          from: "Count stomata and rank leaves by water strategy",
          to: "Compare standardized stomatal density without overclaiming water use",
        },
        {
          from: "Count the breathing pores and rank leaves by how they manage water.  About 80 min; 4 teams.",
          to: "Compare stomatal density with a standardized count and make a cautious, testable hypothesis.  About 80 min; 4 teams.",
        },
        {
          from: "Constraints: approved materials, one variable at a time, record before redesign.",
          to: "Standardize surface, preparation, magnification, field area, and counting rule; count 3 or more fields and report mean plus range.",
        },
        {
          from: "Build or solve, then run the standard test for a baseline.",
          to: "Prepare and count samples with the fixed method, then compare mean stomatal density and range.",
        },
        {
          from: "Redesign one variable, re-test, compare to baseline.",
          to: "Make a cautious hypothesis and state that counts alone cannot rank actual water use; aperture, pore size, gas exchange, species, and conditions also matter.",
        },
        {
          from: "What does a high stomata count suggest about a leaf's habitat?",
          to: "Why can stomatal counts alone not determine a leaf's actual water use?",
        },
        ...TTT12_SCORE_LABELS,
        {
          from: "California Academy of Sciences Stomata Printing; Rothamsted Bioimaging; SAPS Measuring Stomatal Density.",
          to: "California Academy of Sciences Stomata Printing; Rothamsted Bioimaging; Bertolino, Caine, and Gray (2019), PMCID PMC6414756; Lunn et al. (2024), PMCID PMC11565199; USDA Forest Service hardwood physiology research.",
        },
      ],
    },
  ],
  From_Trees_to_Tech_Student_Handout_Packet: [
    {
      start: "Tree Ring Climate Detective",
      end: "Lotus Leaf Surface Sprint",
      replacements: [
        { from: "BUILD AND RUN IT", to: "RUN IT" },
        ...TTT10_STUDENT_METHOD.slice(1, 10),
        TTT10_STUDENT_METHOD[TTT10_STUDENT_METHOD.length - 1],
      ],
    },
    {
      start: "Leaf Stomata Microscope Detective",
      end: "Root Grip Erosion Rescue",
      replacements: [
        { from: "BUILD AND RUN IT", to: "RUN IT" },
        ...TTT12_STUDENT_METHOD.slice(1, 9),
        ...TTT12_SCORE_LABELS,
      ],
    },
  ],
  PY_STEM_Station_Signs: [
    {
      start: "PYS-06  ·  WAVES + SOUND",
      end: "PYS-07  ·  OPTICS + LIGHT",
      replacements: [
        { from: "PREDICT", to: "PREDICT" },
        { from: "BUILD or SOLVE", to: "SEND PULSE" },
        { from: "TEST", to: "TIME N TRIPS" },
        { from: "SCORE", to: "CALCULATE" },
        { from: "REDESIGN", to: "DEFEND" },
      ],
    },
    {
      start: "PYS-08  ·  MECHANICS",
      end: "PYS-09  ·  MECHANICS",
      replacements: [
        { from: "PREDICT", to: "PREDICT" },
        { from: "TEST", to: "MAP FORCES" },
        { from: "BUILD or SOLVE", to: "TEST FIXED CARD" },
        { from: "SCORE", to: "COMPARE" },
        { from: "REDESIGN", to: "SCORE" },
      ],
    },
    {
      start: "PYS-09  ·  MECHANICS",
      end: "PYS-10  ·  OPTICS + LIGHT",
      replacements: [
        {
          from: "Best glide plus control in a gym-safe tournament.",
          to: "Highest normalized glide and five-shot target scores, with explanation and build quality.",
        },
      ],
    },
    {
      start: "PYS-10  ·  OPTICS + LIGHT",
      end: "PYS-11  ·  COMPUTING",
      replacements: [
        { from: "PREDICT", to: "PREDICT" },
        { from: "BUILD or SOLVE", to: "OBSERVE" },
        { from: "TEST", to: "SKETCH" },
        { from: "SCORE", to: "MATCH" },
        { from: "REDESIGN", to: "JUSTIFY" },
      ],
    },
    {
      start: "PYS-11  ·  COMPUTING",
      end: "PYS-12  ·  DESIGN",
      replacements: [
        {
          from: "Most correct retrievals with few traffic conflicts and clear algorithm defense.",
          to: "Most correct retrievals with the fewest legal moves, card-normalized efficiency, and clear algorithm defense.",
        },
        { from: "PREDICT", to: "PLAN" },
        { from: "BUILD or SOLVE", to: "RUN SHARED MAT" },
        { from: "TEST", to: "COUNT MOVES" },
        { from: "SCORE", to: "CHECK OPTIMUM" },
        { from: "REDESIGN", to: "DEFEND" },
      ],
    },
    {
      start: "PYB-04  ·  COMPUTING",
      end: "PYB-05  ·  COMPUTING",
      replacements: [
        { from: "PREDICT", to: "LEARN RULE" },
        { from: "BUILD or SOLVE", to: "CALCULATE" },
        { from: "TEST", to: "VERIFY" },
        { from: "SCORE", to: "AUDIT" },
        { from: "REDESIGN", to: "EXPLAIN" },
      ],
    },
  ],
  From_Trees_to_Tech_Station_Signs: [
    {
      start: "TTT-08  ·  FIELD SCIENCE",
      end: "TTT-09  ·  ECOLOGY",
      replacements: [
        { from: "PREDICT", to: "OBSERVE" },
        { from: "BUILD or SOLVE", to: "PLAN ROUTE" },
        { from: "TEST", to: "VERIFY" },
        { from: "SCORE", to: "RECORD EVIDENCE" },
        { from: "REDESIGN", to: "SCORE" },
      ],
    },
    {
      start: "TTT-10  ·  DATA + CLIMATE",
      end: "TTT-11  ·  MATERIALS",
      replacements: [
        TTT10_STUDENT_METHOD[1],
        TTT10_STUDENT_METHOD[2],
        { from: "PREDICT", to: "OBSERVE" },
        { from: "BUILD or SOLVE", to: "APPLY CARD CODE" },
        { from: "TEST", to: "CITE BANDS" },
        { from: "SCORE", to: "CHECK LIMITS" },
        { from: "REDESIGN", to: "SCORE" },
      ],
    },
    {
      start: "TTT-12  ·  FIELD SCIENCE",
      end: "TTB-01  ·  FIELD SCIENCE",
      replacements: [
        TTT12_STUDENT_METHOD[1],
        TTT12_STUDENT_METHOD[2],
        { from: "PREDICT", to: "STANDARDIZE" },
        { from: "BUILD or SOLVE", to: "COUNT 3+ FIELDS" },
        { from: "TEST", to: "MEAN + RANGE" },
        { from: "SCORE", to: "HYPOTHESIZE" },
        { from: "REDESIGN", to: "SCORE" },
      ],
    },
  ],
};

const UNIVERSAL_REPLACEMENTS = [
  {
    from: "Put out PPE (gloves, goggles, trays) before any materials are handled.",
    to: "Stage only the activity-specific safety controls named in the student safety note and staff run sheet; gloves, goggles, and trays are not universal requirements.",
  },
];

// Insertions are reserved for true structural additions that cannot be made by
// replacing a run in place. The safety checklist needs a distinct checkbox,
// not a second hazard folded into an unrelated line.
const INSERTIONS = {
  Staff_Setup_Prep_and_Safety_Checklist: [
    {
      after: "Stage PPE: goggles, nitrile gloves, trays, handwashing supplies.",
      text: "Stage leakproof trays and fresh trash-bag or table liners for Mud Battery, Xylem Pipeline, and Photosynthesis stations.",
    },
    {
      after: "Pinhole optics: never view the sun directly.",
      text: "Hovercraft: only staff operate low-temperature hot glue; let glue cool before campers handle the puck.",
    },
  ],
};

function replaceDeep(value, from, to) {
  let count = 0;
  function walk(node) {
    if (typeof node === "string") {
      if (!node.includes(from)) return node;
      count += node.split(from).length - 1;
      return node.split(from).join(to);
    }
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      for (const key of Object.keys(node)) node[key] = walk(node[key]);
    }
    return node;
  }
  walk(value);
  return count;
}

function countDeep(value, needle) {
  if (typeof value === "string") return value.split(needle).length - 1;
  if (Array.isArray(value)) return value.reduce((count, child) => count + countDeep(child, needle), 0);
  if (value && typeof value === "object") {
    return Object.values(value).reduce((count, child) => count + countDeep(child, needle), 0);
  }
  return 0;
}

function findTableRows(value, anchor) {
  const matches = [];
  function walk(node) {
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node.rows)) {
      for (const row of node.rows) {
        if (countDeep(row, anchor) > 0) matches.push(row);
      }
    }
    Object.values(node).forEach(walk);
  }
  walk(value);
  return matches;
}

function uniqueBlockIndex(blocks, needle, slug) {
  const matches = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => countDeep(block, needle) > 0);
  if (matches.length !== 1) {
    throw new Error(`section correction for ${slug} expected one anchor, found ${matches.length}: ${needle}`);
  }
  return matches[0].index;
}

function applySectionCorrections(doc, ir) {
  const blocks = ir.blocks || [];
  for (const section of SECTION_REPLACEMENTS[doc.slug] || []) {
    const start = uniqueBlockIndex(blocks, section.start, doc.slug);
    const end = uniqueBlockIndex(blocks, section.end, doc.slug);
    if (end <= start) {
      throw new Error(`section correction for ${doc.slug} has invalid bounds: ${section.start}`);
    }
    const scopedBlocks = blocks.slice(start, end);
    for (const { from, to, expected = 1 } of section.replacements) {
      const count = replaceDeep(scopedBlocks, from, to);
      if (count !== expected) {
        throw new Error(`section correction for ${doc.slug} expected ${expected} match(es), found ${count}: ${from}`);
      }
    }
  }
}

export function applyCorrections(doc, ir) {
  for (const { from, to } of UNIVERSAL_REPLACEMENTS) replaceDeep(ir, from, to);
  const replacements = REPLACEMENTS[doc.slug] || [];
  for (const { from, to, expected = 1 } of replacements) {
    const count = replaceDeep(ir, from, to);
    if (count !== expected) {
      throw new Error(`correction for ${doc.slug} expected ${expected} match(es), found ${count}: ${from.slice(0, 60)}`);
    }
  }
  for (const { anchor, replacements: rowReplacements } of TABLE_ROW_REPLACEMENTS[doc.slug] || []) {
    const rows = findTableRows(ir, anchor);
    if (rows.length !== 1) {
      throw new Error(`table correction for ${doc.slug} expected one row, found ${rows.length}: ${anchor}`);
    }
    for (const [from, to] of rowReplacements) {
      const count = replaceDeep(rows[0], from, to);
      if (count !== 1) {
        throw new Error(`table correction for ${doc.slug} expected one cell match, found ${count}: ${from}`);
      }
    }
  }
  applySectionCorrections(doc, ir);
  for (const { after, text } of INSERTIONS[doc.slug] || []) {
    const matches = (ir.blocks || [])
      .map((block, index) => ({ block, index }))
      .filter(({ block }) => countDeep(block, after) > 0);
    if (matches.length !== 1) {
      throw new Error(`insertion for ${doc.slug} expected one anchor, found ${matches.length}: ${after}`);
    }
    const inserted = JSON.parse(JSON.stringify(matches[0].block));
    const count = replaceDeep(inserted, after, text);
    if (count !== 1) throw new Error(`insertion for ${doc.slug} could not replace its cloned anchor: ${after}`);
    ir.blocks.splice(matches[0].index + 1, 0, inserted);
  }
  return ir;
}

export function correctionCount(slug) {
  return (REPLACEMENTS[slug] || []).length
    + (TABLE_ROW_REPLACEMENTS[slug] || []).length
    + (SECTION_REPLACEMENTS[slug] || []).length
    + (INSERTIONS[slug] || []).length;
}
