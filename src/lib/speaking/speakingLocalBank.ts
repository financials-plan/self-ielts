import type { SpeakingLessonContent } from "./speakingEngine";

interface Part1SpeakSeed {
  topic: string;
  title: string;
  line1Raw: string;
  line1Stress: string;
  line2Raw: string;
  line2Stress: string;
  q1: string;
  q1Model: string;
  q2: string;
  q2Model: string;
  basicEn: string;
  naturalEn: string;
}

const P1_SPEAK_SEEDS: Part1SpeakSeed[] = [
  {
    topic: "Public Libraries & Study Spaces",
    title: "Quiet Libraries, Reading Habits & Desk Lighting",
    line1Raw: "Actually, I prefer revising in neighbourhood libraries primarily because the calm atmosphere limits smartphone distractions.",
    line1Stress: "ACTUALLY, / I preFER reVISing / in NEIGHbourhood LIbraries / priMARily beCAUSE / the CALM ATmosphere / LIMits distraction.",
    line2Raw: "For instance, spending two uninterrupted hours by a north window usually doubles my reading speed.",
    line2Stress: "For INstance, / SPENDing two uninterRUPTed HOURS / by a NORTH WINdow / USually DOUbles my speed.",
    q1: "Do you prefer studying in libraries or busy cafes?",
    q1Model: "To be honest, I gravitate toward public libraries rather than bustling coffee shops, mainly because predictable quiet helps me retain dense reading passages. For instance, two focused morning hours beside a sunlit window beat four distracted hours in a noisy cafe.",
    q2: "How often do you borrow physical books nowadays?",
    q2Model: "On the whole, roughly twice a month whenever I want long-form concentration away from backlit screens. My local branch even lets readers reserve titles online ahead of weekend pickup.",
    basicEn: "I like quiet places without phones",
    naturalEn: "a calm atmosphere keeps digital distractions at bay",
  },
  {
    topic: "Weekend Street Markets & Fresh Produce",
    title: "Local Markets, Seasonal Fruit & Haggling",
    line1Raw: "To be honest, visiting open-air morning markets feels far more rewarding than rushing down supermarket aisles.",
    line1Stress: "To be HONest, / VISiting OPen-air MORNing MARkets / feels FAR more reWARDing / than RUSHing down AISLES.",
    line2Raw: "Broadly speaking, chatting briefly with growers teaches me which regional greens are genuinely in season.",
    line2Stress: "BROADly SPEAKing, / CHATting BRIEFly with GROWers / TEACHes me which GREENS / are GENuinely in SEAson.",
    q1: "Do you enjoy shopping at neighbourhood markets?",
    q1Model: "Actually, yes—I'm quite fond of strolling through weekend produce stalls primarily because everything tastes noticeably fresher than packaged goods. Take last Sunday: I picked up sweet local mangoes straight from a family orchard van.",
    q2: "Do people in your town still bargain over prices?",
    q2Model: "That depends on the venue: fixed-price grocers leave zero room for negotiation, whereas traditional flower or spice vendors expect friendly back-and-forth banter before rounding down the total.",
    basicEn: "fresh vegetables in the market",
    naturalEn: "seasonal produce straight from local growers",
  },
  {
    topic: "City Parks, Trees & Evening Walks",
    title: "Pocket Parks, Shade Canopies & Evening Jogs",
    line1Raw: "Off the top of my head, taking a twenty-minute twilight stroll under mature banyan trees resets my mood completely.",
    line1Stress: "Off the TOP of my HEAD, / TAKing a TWENty-MINute TWILIGHT STROLL / under mature TREES / reSETS my MOOD comPLETEly.",
    line2Raw: "On the whole, shaded lakeside footpaths stay several degrees cooler than congested commuter roads nearby.",
    line2Stress: "On the WHOLE, / SHADed LAKEside FOOTpaths / STAY SEVeral deGREES COOLer / than CONgested ROADS.",
    q1: "Are green parks easy to reach from where you live?",
    q1Model: "Yes, thankfully—there's a riverside promenade barely ten minutes on foot from my apartment, which feels like an oasis after long screen sessions. Every dusk, elderly neighbours gather there for badminton and stretching.",
    q2: "What improvements would make city parks even better?",
    q2Model: "Primarily better rainwater drainage along clay running tracks and extra drinking fountains during scorching summer months, so joggers wouldn't need to carry heavy bottles everywhere.",
    basicEn: "helps me feel less tired",
    naturalEn: "helps me decompress and reset my focus",
  },
  {
    topic: "Wristwatches, Punctuality & Schedules",
    title: "Analogue Watches, Timekeeping & Punctuality",
    line1Raw: "In fact, wearing a simple analogue watch saves me from glancing nervously at endless chat alerts.",
    line1Stress: "In FACT, / WEARing a SIMple ANalogue WATCH / SAVES me from GLANCing / at ENDless aLERTS.",
    line2Raw: "For example, arriving ten minutes ahead of interviews keeps my breathing steady before entering the room.",
    line2Stress: "For exAMple, / arRIVing TEN minutes aHEAD / KEEPS my BREATHing STEAdy / beFORE ENtering.",
    q1: "Do you prefer checking time on a wristwatch or a phone?",
    q1Model: "Actually, I stick with a lightweight mechanical watch during workdays primarily because checking a dial takes two seconds without pulling me into social feeds. My phone usually stays tucked inside my backpack until lunch.",
    q2: "Is punctuality considered very important in your culture?",
    q2Model: "Broadly speaking, yes in formal workplace and medical settings, where turning up late signals poor respect for shared schedules, though casual dinners with close friends allow a fifteen-minute buffer.",
    basicEn: "arrive early so I am relaxed",
    naturalEn: "arrive ten minutes ahead to stay composed",
  },
  {
    topic: "Handwriting, Notebooks & Planning",
    title: "Paper Planners, Fountain Pens & Memory",
    line1Raw: "Actually, jotting rough daily priorities onto paper cards clears mental clutter far faster than phone apps.",
    line1Stress: "ACTUALLY, / JOTting rough PRIORities / onto PAper CARDS / CLEARS MENtal CLUTter / far FASTer than APPS.",
    line2Raw: "That said, I still back up confirmed deadlines into a cloud calendar so nothing slips overseas.",
    line2Stress: "THAT SAID, / I still BACK up DEADlines / into a CLOUD CALendar / so NOThing SLIPS.",
    q1: "Do you write more by hand or on a keyboard nowadays?",
    q1Model: "Most heavy drafting happens on a laptop for speed, yet I still sketch morning to-do lists and brainstorm mind-maps in a pocket dot-grid notebook. Putting pen to paper slows thoughts just enough to spot weak logic.",
    q2: "Did you enjoy handwriting practice when you were younger?",
    q2Model: "Honestly, it felt tedious at primary school copying neat columns over and over, though later on I grew appreciative once teachers remarked how legible notes boosted exam revision speed.",
    basicEn: "write things to remember better",
    naturalEn: "jot priorities down to clear mental clutter",
  },
  {
    topic: "Home Cooking, Spices & Shared Dinners",
    title: "Weeknight Meals, Herbs & Kitchen Shortcuts",
    line1Raw: "Primarily because restaurant portions feel overly salty, I batch-cook simple noodle broths every Wednesday evening.",
    line1Stress: "priMARily beCAUSE / RESStaurant PORtions feel SALty, / I BATCH-cook NOODle BROTHS / every WEDnesday.",
    line2Raw: "For instance, freezing pre-chopped aromatics cuts weekday dinner prep down to fifteen minutes flat.",
    line2Stress: "For INstance, / FREEZing pre-CHOPPED aroMATics / CUTS DINner PREP / down to FIFteen MINutes.",
    q1: "Do you enjoy cooking on busy weekdays?",
    q1Model: "To be honest, elaborate recipes feel exhausting after work, yet assembling a quick twenty-minute stir-fry with fresh scallions and ginger genuinely helps me unwind while saving money.",
    q2: "Who taught you the basic cooking skills you use most?",
    q2Model: "Mostly my grandmother by example—she never measured spoonfuls strictly, instead teaching me to listen to the sizzle of garlic and judge broth seasoning by aroma before tasting.",
    basicEn: "fast to make dinner at home",
    naturalEn: "cuts weekday meal prep down to fifteen minutes",
  },
  {
    topic: "Public Buses, Ferries & Commuting",
    title: "Daily Commutes, Audio Podcasts & Traffic",
    line1Raw: "On the whole, riding an express river bus beats bumper-to-bumper motorbike traffic hands down.",
    line1Stress: "On the WHOLE, / RIDing an exPRESS RIver BUS / BEATS BUMper-to-BUMper TRAFfic / HANDS DOWN.",
    line2Raw: "To be honest, slipping on noise-isolating earbuds turns a forty-minute ride into relaxed listening time.",
    line2Stress: "To be HONest, / SLIPping on EARbuds / TURNS a FORty-minute RIDE / into reLAXED LISTening TIME.",
    q1: "What form of transport do you use most frequently?",
    q1Model: "Normally I catch the elevated commuter train during rainy months, primarily because dedicated rails bypass gridlocked junctions completely. On crisp sunny mornings, though, I cycle twenty minutes along quiet canal paths.",
    q2: "What change would improve public transport in your area?",
    q2Model: "Synchronised feeder shuttles connecting outer residential lanes directly to main rail platforms would cut transfer waiting times dramatically for elderly commuters.",
    basicEn: "too many cars stuck on roads",
    naturalEn: "bumper-to-bumper commuter traffic at rush hour",
  },
];

const PART2_CUE_SEEDS = [
  {
    title: "A Useful Workshop or Craft Session You Attended",
    prompt: "Describe a hands-on workshop or training session that taught you something memorable.",
    bullets: ["When and where the session took place", "Who led it and what participants made or practised", "One difficulty you overcame during the session", "Why you still value that practical takeaway"],
    line1Raw: "I'd like to talk about a weekend bicycle puncture-repair workshop I joined at a tiny community garage last October.",
    line1Stress: "I'd LIKE to talk aBOUT / a WEEKend PUNcture WORKshop / I JOINED at a COMmunity gaRAGE / last OcTOber.",
    line2Raw: "Looking back, realising I could fix a roadside flat independently boosted my cycling confidence overnight.",
    line2Stress: "LOOKing BACK, / REAlising I could FIX a FLAT / BOOSTed my CONfidence OverNIGHT.",
    model: "I'd like to describe a practical two-hour woodworking and shelf-joining workshop I attended at a local tool library last autumn. A retired cabinetmaker showed six of us how to measure spirit levels, pre-drill brick wall anchors, and tighten brass brackets squarely without splitting timber. At first I felt clumsy keeping the hand drill perpendicular, so my pilot hole tilted slightly off-mark. After switching to a simple wooden guide block, though, every screw sank smoothly. Looking back, that afternoon cured my fear of home DIY completely, and I recently mounted study bookshelves on my own without hiring contractors.",
    upgrade: ["made me less afraid of trying repairs", "cured my hesitation around hands-on maintenance"],
  },
  {
    title: "A Quiet Place Outside Home Where You Read or Think",
    prompt: "Describe a peaceful public or outdoor spot where you enjoy reading, sketching, or resting.",
    bullets: ["Where this place is located", "What it looks and sounds like there", "How often you visit and what you do", "Why this spot feels special compared with other places"],
    line1Raw: "One tranquil spot I return to constantly is the upper botanical terrace hidden behind our city museum.",
    line1Stress: "One TRANquil SPOT / I reTURN to CONstantly / is the UPper TERrace / HIDden beHIND our muSEum.",
    line2Raw: "Actually, listening to sparrows splash around the stone fountain clears away study stress remarkably fast.",
    line2Stress: "ACTUALLY, / LISTening to SPARrows SPLASH / around the STONE FOUNtain / CLEARS away STRESS fast.",
    model: "One remarkably peaceful spot I visit every second Sunday is a covered timber pavilion tucked behind our municipal botanic conservatory. Because tour buses park on the opposite avenue, barely a handful of readers ever climb those stone steps. Tall bamboo groves filter harsh midday light, leaving gentle dappled shade across stone benches alongside a quiet trickle of pond water. I normally bring an English paperback or review flashcards there for an hour without glancing at work emails. What makes it irreplaceable is the rare blend of fresh earth scent and predictable stillness right in the middle of a noisy district.",
    upgrade: ["very quiet even inside a busy city", "an enclave of stillness amidst urban bustle"],
  },
  {
    title: "A Time When Someone Helped You Navigate an Unfamiliar City",
    prompt: "Describe an occasion when a stranger or acquaintance gave you helpful directions or local advice.",
    bullets: ["Where you were travelling and why you got confused", "Who stepped in to assist you", "How they resolved the problem for you", "How that gesture shaped your view of visiting new places"],
    line1Raw: "Off the top of my head, I vividly remember losing my bearings inside a rainy regional bus terminal two winters ago.",
    line1Stress: "Off the TOP of my HEAD, / I VIVidly reMEMber LOSing my BEARings / inSIDE a RAINy TERminal / two WINters aGO.",
    line2Raw: "In fact, the station baker not only pointed out the hidden platform stairs, but walked me straight to the ticket window.",
    line2Stress: "In FACT, / the STAtion BAKer / WALKED me STRAIGHT / to the TICKet WINdow.",
    model: "A gesture I still recall fondly happened two winters ago when I missed a late commuter ferry in an unfamiliar coastal town during heavy drizzle. With my phone battery dead and local street signs faded, I had no clue which shuttle bay led back to the railway station. Noticing me squinting at a wet timetable, an off-duty tram mechanic carrying groceries paused, sketched a clear three-turn landmark map on a paper napkin, and waited beside the kerb until my night bus pulled in. That small kindness taught me never to hesitate when a traveller looks lost near my own neighbourhood stops.",
    upgrade: ["I did not know where I was going", "I completely lost my bearings in the drizzle"],
  },
  {
    title: "An Item You Repaired Instead of Replacing",
    prompt: "Describe a broken object or appliance you repaired or restored instead of throwing away.",
    bullets: ["What the item was and how it broke", "Whether you repaired it alone or with guidance", "What step proved trickiest", "How you felt once it worked properly again"],
    line1Raw: "I'd like to talk about rescuing a vintage desk lamp whose flickering brass switch had given up after fifteen years.",
    line1Stress: "I'd LIKE to talk aBOUT / REScuing a VINtage LAMP / whose BRASS SWITCH / had GIVen UP.",
    line2Raw: "Broadly speaking, stripping back the braided cord revealed a loose terminal screw fixable in ten careful minutes.",
    line2Stress: "BROADly SPEAKing, / STRIPping BACK the CORD / reVEALED a LOOSE SCREW / FIXable in TEN minutes.",
    model: "I'd like to share how I restored a heavy mid-century cast-iron desk lamp belonging to my uncle after its rotary switch suddenly stopped clicking. Rather than tossing it into household e-waste, I carried it to a Sunday community repair session where an elderly electrician guided me safely through unplugging, unscrewing the felt base, and swapping the burnt toggle switch for a four-dollar spare part. Threading twin cloth wires past the narrow brass gooseneck proved fidgety at first, yet seeing the warm bulb glow steady again felt surprisingly satisfying—almost like rescuing a small piece of family history.",
    upgrade: ["throwing it away as garbage", "consigning a serviceable heirloom to landfill"],
  },
  {
    title: "A Group Project That Taught You Better Communication",
    prompt: "Describe a collaborative project where clear communication helped your team finish smoothly.",
    bullets: ["What the shared goal or assignment was", "What early misunderstanding slowed the group down", "What practical change fixed coordination", "What lesson you carried into later teamwork"],
    line1Raw: "Looking back on university, coordinating a four-person neighbourhood noise survey initially tripped over vague assumptions.",
    line1Stress: "LOOKing BACK, / coORdinating a NOISE SURvey / inITially TRIPPED Over / VAGUE asSUMPtions.",
    line2Raw: "Once we adopted a shared one-page checklist each Friday, duplicated effort vanished almost immediately.",
    line2Stress: "ONCE we aDOPTed / a ONE-page CHECKlist each FRIday, / DUplicated EFfort / VANished imMEdiately.",
    model: "During my second college term, three classmates and I designed a visual map measuring pedestrian shade across six busy crossroads for a local civic fair. In week one, two of us accidentally measured the exact same intersection while nobody visited the eastern schools because chat messages buried task updates. Rather than scheduling endless late-night calls, we drafted a pinned one-page ledger listing names, deadlines, and checked blocks every Friday afternoon. That simple habit prevented duplicate work, kept everyone calm before presentation morning, and won our booth encouraging feedback from visiting town planners.",
    upgrade: ["doing the same work twice by mistake", "duplicating fieldwork through scattered chat threads"],
  },
];

const PART3_ANALYTICAL_SEEDS = [
  {
    theme: "Urban Green Space & Public Health Policy",
    q1: "Why do high-density cities often underinvest in neighbourhood pocket parks?",
    q1Model: "That's a classic municipal trade-off—broadly speaking, city halls face immediate pressure to sell central parcels for housing or commercial tax revenue, whereas preventive health gains from shady parks take decades to show up on hospital ledgers. Take crowded transit quarters, for instance: a tiny square rarely earns direct rent yet measurably lowers summer heatstroke admissions.",
    q2: "Should private developers be legally required to maintain public plazas beside tall towers?",
    q2Model: "To an extent, yes, primarily because high-rise projects heighten street wind tunnels and foot congestion locally. That said, purely private plazas risk imposing heavy security rules that turn away elderly or low-income residents unless municipal charters guarantee open twenty-four-hour seating.",
    basicEn: "good for people's health later",
    naturalEn: "yields long-term preventive health dividends",
  },
  {
    theme: "Artificial Intelligence & Entry-Level Apprenticeships",
    q1: "How might automated drafting tools reshape training for junior graduates?",
    q1Model: "On the whole, junior roles risk losing simple starter tasks—like writing standard summaries or formatting spreadsheets—that historically helped novices build pattern recognition slowly. For example, if software handles every initial draft, senior mentors must intentionally design supervised review drills so newcomers still learn underlying judgment.",
    q2: "Which human capabilities will stay hardest for software tools to replicate cleanly?",
    q2Model: "Broadly speaking, contextual accountability and empathetic negotiation across conflicting human priorities remain stubbornly human. Software can rank statistical options fast, yet deciding how to break sensitive news to an anxious patient or community hall requires genuine ethical presence.",
    basicEn: "helps beginners learn step by step",
    naturalEn: "builds foundational pattern recognition gradually",
  },
  {
    theme: "Right-to-Repair & Consumer Electronics Waste",
    q1: "Why do many households replace slightly worn appliances instead of repairing them?",
    q1Model: "Primarily because sealed glue casings and scarce spare switches push professional repair quotes close to retail replacement prices. Take hairdryers or compact kettles, for instance: when a thermal fuse costs two dollars yet screws are hidden beneath brittle clips, consumers understandably feel nudged toward buying brand-new units.",
    q2: "Can modular labelling laws realistically change global manufacturing habits?",
    q2Model: "That's a nuanced question—repairability scores on retail boxes certainly help shoppers compare battery access at checkout, especially in tighter household budgets. Nevertheless, without requiring standard fasteners and five-year spare-part stocks, glossy labels alone remain largely symbolic.",
    basicEn: "cheaper to buy new than fix",
    naturalEn: "repair quotes rival retail replacement costs",
  },
  {
    theme: "Intergenerational Learning & Local Heritage",
    q1: "What practical knowledge is most at risk of disappearing between grandparents and teenagers?",
    q1Model: "Off the top of my head, tactile everyday crafts—like mending woven textiles, preserving seasonal harvests without freezers, or reading local weather clouds—fade fastest because rapid urbanisation disconnects youth from manual routines. Unless schools pair elders with weekend clubs, such tacit know-how vanishes quietly.",
    q2: "How can public museums make traditional crafts engaging rather than dusty?",
    q2Model: "In fact, shifting away from glass-case displays toward working studio benches transforms visitor curiosity instantly. When teenagers handle raw clay tools or test wooden joinery puzzles alongside living artisans, heritage stops feeling like distant nostalgia and becomes usable engineering.",
    basicEn: "looking at old things behind glass",
    naturalEn: "passive behind-glass exhibition versus hands-on benches",
  },
  {
    theme: "Tourism Pressure & Historic Coastal Towns",
    q1: "How does seasonal over-tourism alter everyday life for year-round residents?",
    q1Model: "Broadly speaking, surging short-term holiday rentals hollow out residential blocks so essential workers like nurses or teachers can no longer afford town-centre flats. By winter, shuttered souvenir lanes leave locals with quiet streets yet fewer year-round grocery and pharmacy services.",
    q2: "Are visitor caps or off-peak incentives fairer ways to protect fragile heritage sites?",
    q2Model: "Actually, tiered off-peak museum passes and timed shuttle slots work more smoothly than blunt bans, since they spread footfall calmly across autumn weekdays. Still, strictly capped fragile caves or coral reefs require absolute daily limits whenever physical erosion accelerates.",
    basicEn: "too many tourists in one season",
    naturalEn: "concentrated peak-season visitor footfall",
  },
];

export const SPEAKING_LOCAL_BANK: SpeakingLessonContent[] = (() => {
  const out: SpeakingLessonContent[] = [];

  // 35 Part 1 lessons
  const p1Contexts = [
    "Daily Life",
    "Commuting",
    "Study Habits",
    "Weekend Routine",
    "Neighbourhood",
  ];
  for (let i = 0; i < 35; i++) {
    const s = P1_SPEAK_SEEDS[i % P1_SPEAK_SEEDS.length];
    const variant = Math.floor(i / P1_SPEAK_SEEDS.length);
    const id = `speak-bank-p1-${String(i + 1).padStart(3, "0")}`;
    const title = variant === 0 ? s.title : `${s.title} (${p1Contexts[variant % p1Contexts.length]} Set ${variant + 1})`;
    out.push({
      id,
      track: "shared",
      partNumber: 1,
      partType: "Part 1 · Interview & Everyday Topics",
      title,
      subtitleVi: `(${s.topic}) Tập trả lời nhanh 45s khung A.R.E, Shadowing nối âm và bỏ filler 'um/uh'.`,
      difficultyBand: i % 2 === 0 ? "6.5" : "7.0",
      ksaFocus: ["K", "S", "A"],
      shadowingLines: [
        {
          id: `${id}-sh1`,
          speaker: "Examiner Model (UK)",
          accent: "en-GB",
          rawText: s.line1Raw,
          stressMarkedText: s.line1Stress,
          ipaChunkNoteVi: "Nhấn rõ các âm tiết viết HOA và giữ cụm nghỉ hơi theo dấu gạch chéo (/).",
        },
        {
          id: `${id}-sh2`,
          speaker: "Examiner Model (AU)",
          accent: "en-AU",
          rawText: s.line2Raw,
          stressMarkedText: s.line2Stress,
          ipaChunkNoteVi: "Giữ âm đuôi rõ ở cuối cụm mở đầu ví dụ 'For instance' / 'On the whole'.",
        },
      ],
      prompts: [
        {
          id: `${id}-q1`,
          partNumber: 1,
          promptEn: s.q1,
          prepSeconds: 10,
          speakSeconds: 45,
          frameworkTag: "A.R.E",
          rescuePromptsVi: [
            "Mở câu trả lời ngay bằng 'To be honest, I lean toward ... primarily because ...'",
            "Kéo dài tự nhiên với ví dụ thực tế: 'Take last week, for instance...'",
          ],
          modelBand80En: s.q1Model,
          upgradePhrases: [
            { basicEn: s.basicEn, naturalEn: s.naturalEn, noteVi: "Collocation tự nhiên nâng tiêu chí Lexical Band 7.5+." },
            { basicEn: "for example last week", naturalEn: "take last week, for instance", noteVi: "Chuyển ý vào ví dụ mượt mà như người bản xứ." },
          ],
        },
        {
          id: `${id}-q2`,
          partNumber: 1,
          promptEn: s.q2,
          prepSeconds: 10,
          speakSeconds: 45,
          frameworkTag: "A.R.E",
          rescuePromptsVi: [
            "Nếu câu hỏi hỏi tần suất: 'On the whole, roughly twice a month whenever...'",
            "Nếu muốn chia theo ngữ cảnh: 'That largely depends on whether...'",
          ],
          modelBand80En: s.q2Model,
          upgradePhrases: [
            { basicEn: "it depends on the situation", naturalEn: "that depends largely on the venue / setting", noteVi: "Mở đầu linh hoạt tránh trả lời Yes/No cộc lốc." },
            { basicEn: "in general I do it", naturalEn: "on the whole, I tend to...", noteVi: "Thể hiện kiểm soát Fluency tự nhiên." },
          ],
        },
      ],
    });
  }

  // 35 Part 2 Cue Card lessons
  const p2FocusTags = [
    "60s Keyword Plan",
    "Past-Present-Future Arc",
    "Fluency Without Pause",
    "Descriptive Precision",
    "Expressive Intonation",
    "Storytelling Pacing",
    "Exam Stamina Drill",
  ];
  for (let i = 0; i < 35; i++) {
    const s = PART2_CUE_SEEDS[i % PART2_CUE_SEEDS.length];
    const variant = Math.floor(i / PART2_CUE_SEEDS.length);
    const id = `speak-bank-p2-${String(i + 1).padStart(3, "0")}`;
    const title = variant === 0 ? s.title : `${s.title} · ${p2FocusTags[variant % p2FocusTags.length]}`;
    out.push({
      id,
      track: "shared",
      partNumber: 2,
      partType: "Part 2 · Individual Long Turn Cue Card",
      title,
      subtitleVi: `Nháp 60s Cue Card + thanh phân 3 vùng nói trọn 2 phút (Bối cảnh → Câu chuyện → Cảm nhận PPF).`,
      difficultyBand: i % 2 === 0 ? "7.0" : "7.5",
      ksaFocus: ["K", "S", "A"],
      shadowingLines: [
        {
          id: `${id}-sh1`,
          speaker: "Examiner Model (UK)",
          accent: "en-GB",
          rawText: s.line1Raw,
          stressMarkedText: s.line1Stress,
          ipaChunkNoteVi: "Lên giọng nhẹ ở mệnh đề chính và nối mượt vào mệnh đề quan hệ.",
        },
        {
          id: `${id}-sh2`,
          speaker: "Examiner Model (AU)",
          accent: "en-AU",
          rawText: s.line2Raw,
          stressMarkedText: s.line2Stress,
          ipaChunkNoteVi: "Câu chốt chuyển sang vùng thứ 3 (Reflection) tạo ấn tượng kết thúc trọn vẹn.",
        },
      ],
      prompts: [
        {
          id: `${id}-cue`,
          partNumber: 2,
          promptEn: s.prompt,
          bulletPointsEn: s.bullets,
          prepSeconds: 60,
          speakSeconds: 120,
          frameworkTag: "PPF (Past-Present-Future)",
          rescuePromptsVi: [
            "Vùng 1 (0–30s): Mở bằng 'I'd like to describe...' + đặt bối cảnh thời gian & không gian.",
            "Vùng 2 (30–90s): Kể khó khăn gặp phải bằng 'At first I felt quite...; however, once I switched to...'",
            "Vùng 3 (90–120s): Chốt bằng 'Looking back, what stuck with me most was...'",
          ],
          modelBand80En: s.model,
          upgradePhrases: [
            { basicEn: s.upgrade[0], naturalEn: s.upgrade[1], noteVi: "Nâng cấp diễn đạt kể chuyện tự nhiên cho Cue Card Part 2." },
            { basicEn: "when I think about it now", naturalEn: "looking back, what struck me most was...", noteVi: "Mở đầu vùng Reflection tạo chiều sâu bài nói." },
          ],
        },
      ],
    });
  }

  // 35 Part 3 lessons
  const p3Angles = [
    "Policy & Society",
    "Long-Term Trade-Offs",
    "Generational Shift",
    "Equity & Regulation",
    "Community Practice",
    "Economic Incentives",
    "Future Outlook",
  ];
  for (let i = 0; i < 35; i++) {
    const s = PART3_ANALYTICAL_SEEDS[i % PART3_ANALYTICAL_SEEDS.length];
    const variant = Math.floor(i / PART3_ANALYTICAL_SEEDS.length);
    const id = `speak-bank-p3-${String(i + 1).padStart(3, "0")}`;
    const title = variant === 0 ? s.theme : `${s.theme} — ${p3Angles[variant % p3Angles.length]}`;
    out.push({
      id,
      track: "shared",
      partNumber: 3,
      partType: "Part 3 · Abstract Discussion",
      title,
      subtitleVi: `Phân tích xã hội 60s theo khung P.E.E.C (Point → Explain → Example → Counter-balance) giữ bình tĩnh câu hỏi trừu tượng.`,
      difficultyBand: i % 2 === 0 ? "7.5" : "8.0",
      ksaFocus: ["K", "S", "A"],
      shadowingLines: [
        {
          id: `${id}-sh1`,
          speaker: "Examiner Model (UK)",
          accent: "en-GB",
          rawText: "That's a multifaceted question—broadly speaking, immediate budget pressures often collide with long-term community gains.",
          stressMarkedText: "THAT'S a MULti-FACeted QUEStion— / BROADly SPEAKing, / imMEdiate BUDget PRESsures / colLIDE with LONG-term GAINS.",
          ipaChunkNoteVi: "Cụm câu giờ tự nhiên lấy 2 giây suy nghĩ mà vẫn tính điểm Fluency cao.",
        },
        {
          id: `${id}-sh2`,
          speaker: "Examiner Model (AU)",
          accent: "en-AU",
          rawText: "That said, purely top-down bans rarely succeed unless everyday residents share affordable alternatives.",
          stressMarkedText: "THAT SAID, / PUREly TOP-down BANS / RAREly sucCEED / unLESS RESidents share alTERnatives.",
          ipaChunkNoteVi: "Chốt góc nhìn phản biện bằng 'That said, ... unless ...' tránh ngữ điệu một chiều.",
        },
      ],
      prompts: [
        {
          id: `${id}-q1`,
          partNumber: 3,
          promptEn: s.q1,
          prepSeconds: 15,
          speakSeconds: 60,
          frameworkTag: "P.E.E.C",
          rescuePromptsVi: [
            "Câu giờ hợp pháp: 'That's a multifaceted issue—broadly speaking, ...'",
            "Đưa ví dụ xã hội: 'Take dense residential quarters, for instance...'",
          ],
          modelBand80En: s.q1Model,
          upgradePhrases: [
            { basicEn: s.basicEn, naturalEn: s.naturalEn, noteVi: "Diễn đạt chuẩn Band 8.0 cho câu hỏi Part 3." },
            { basicEn: "it is hard to answer simply", naturalEn: "that's a nuanced question—broadly speaking...", noteVi: "Tránh im lặng quá 1.5s ngay từ câu mở đầu." },
          ],
        },
        {
          id: `${id}-q2`,
          partNumber: 3,
          promptEn: s.q2,
          prepSeconds: 15,
          speakSeconds: 60,
          frameworkTag: "P.E.E.C",
          rescuePromptsVi: [
            "Nêu quan điểm có điều kiện: 'To an extent, yes, primarily because...'",
            "Lật lại mặt trái cân bằng: 'Nevertheless, without clear safeguards...'",
          ],
          modelBand80En: s.q2Model,
          upgradePhrases: [
            { basicEn: "both good and bad sides", naturalEn: "to an extent, yes... that said, without safeguards...", noteVi: "Cấu trúc 2 chiều mạch lạc Band 8.0." },
            { basicEn: "laws alone are not enough", naturalEn: "rules alone remain largely symbolic unless...", noteVi: "Từ vựng sắc bén chốt quan điểm." },
          ],
        },
      ],
    });
  }

  return out;
})();
