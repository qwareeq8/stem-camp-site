// Durable, narrowly scoped corrections applied after source extraction.
//
// The ignored IR contains reviewed hand edits, so a wholesale re-extraction is
// not a safe way to make one public-document fix. This layer records exact text
// replacements in version control and fails loudly if the upstream text drifts.

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
    {
      from: "4 to 6 metal slinkies",
      to: "4 to 6 metal slinkies; safety goggles: one pair per participant while any slinky is stretched",
    },
    {
      from: "Stage only the activity-specific safety controls named in the student safety note and staff run sheet; gloves, goggles, and trays are not universal requirements.",
      to: "Issue goggles before any slinky is stretched. Keep every slinky flat on the floor, never release it while stretched, limit the stretch to about 3 m, and keep fingers clear of the coils. Gloves and trays are not required.",
    },
  ],
  PYS_09_Hovercraft_Hockey_Hackathon_Student_Handout: [
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
  ],
  PYS_11_BookBot_Bin_Logic_Challenge_Instructor_Guide: [
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
