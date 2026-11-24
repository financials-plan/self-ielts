import type { ListeningLessonContent, ListeningMapLayout } from "./listeningEngine";

interface Part1Seed {
  title: string;
  facility: string;
  streetOld: string;
  streetNew: string;
  streetSpelled: string;
  dayOld: string;
  dayNew: string;
  pluralNoun: string;
  feeOld: string;
  feeNew: string;
  gateNumber: string;
}

const P1_SEEDS: Part1Seed[] = [
  { title: "Harbourfront Pottery Studio Sign-Up", facility: "Harbourfront Ceramic Workshop", streetOld: "elmwood", streetNew: "Briarwood", streetSpelled: "B-R-I-A-R-W-O-O-D", dayOld: "Monday", dayNew: "Wednesday", pluralNoun: "aprons", feeOld: "forty-four", feeNew: "thirty-six", gateNumber: "Three" },
  { title: "Oakridge Cycle Locker Rental Enquiry", facility: "Oakridge Commuter Bike Depot", streetOld: "Station", streetNew: "Ashford", streetSpelled: "A-S-H-F-O-R-D", dayOld: "Tuesday", dayNew: "Friday", pluralNoun: "helmets", feeOld: "twenty-eight", feeNew: "twenty-two", gateNumber: "Five" },
  { title: "Willow Creek Kayak Club Registration", facility: "Willow Creek Paddling Centre", streetOld: "Canal", streetNew: "Brampton", streetSpelled: "B-R-A-M-P-T-O-N", dayOld: "Wednesday", dayNew: "Saturday", pluralNoun: "paddles", feeOld: "fifty-two", feeNew: "forty-five", gateNumber: "Two" },
  { title: "Mercer Tool Library Borrowing Desk", facility: "Mercer Community Tool Library", streetOld: "Linden", streetNew: "Thornton", streetSpelled: "T-H-O-R-N-T-O-N", dayOld: "Thursday", dayNew: "Monday", pluralNoun: "goggles", feeOld: "eighteen", feeNew: "fourteen", gateNumber: "Six" },
  { title: "Kestrel Birdwatching Walk Booking", facility: "Kestrel Marsh Visitor Desk", streetOld: "Ferry", streetNew: "Dunmore", streetSpelled: "D-U-N-M-O-R-E", dayOld: "Friday", dayNew: "Sunday", pluralNoun: "binoculars", feeOld: "twenty-four", feeNew: "nineteen", gateNumber: "Four" },
  { title: "Silverline Night-School Woodwork Enrolment", facility: "Silverline Evening College", streetOld: "Market", streetNew: "Halstead", streetSpelled: "H-A-L-S-T-E-A-D", dayOld: "Monday", dayNew: "Thursday", pluralNoun: "chisels", feeOld: "sixty-five", feeNew: "fifty-four", gateNumber: "Seven" },
  { title: "Greenwich Repair Cafe Volunteer Form", facility: "Greenwich Neighbourhood Repair Cafe", streetOld: "Chapel", streetNew: "Cranford", streetSpelled: "C-R-A-N-F-O-R-D", dayOld: "Tuesday", dayNew: "Saturday", pluralNoun: "chargers", feeOld: "thirty", feeNew: "twenty-five", gateNumber: "Two" },
  { title: "Northfield Botanical Sketching Pass", facility: "Northfield Glasshouse Conservatory", streetOld: "Quarry", streetNew: "Larkspur", streetSpelled: "L-A-R-K-S-P-U-R", dayOld: "Wednesday", dayNew: "Sunday", pluralNoun: "brushes", feeOld: "thirty-five", feeNew: "twenty-nine", gateNumber: "Eight" },
  { title: "Camden Rehearsal Room Acoustic Hire", facility: "Camden Shared Music Rooms", streetOld: "Dock", streetNew: "Whitmore", streetSpelled: "W-H-I-T-M-O-R-E", dayOld: "Thursday", dayNew: "Tuesday", pluralNoun: "cables", feeOld: "forty-eight", feeNew: "thirty-nine", gateNumber: "One" },
];

const BRANCH_SUFFIXES = ["Central Wing", "South Annex", "Evening Session"];

function buildPart1Listening(): ListeningLessonContent[] {
  const out: ListeningLessonContent[] = [];
  for (let i = 0; i < 27; i++) {
    const s = P1_SEEDS[i % P1_SEEDS.length];
    const v = Math.floor(i / P1_SEEDS.length);
    const id = `list-bank-p1-${String(i + 1).padStart(3, "0")}`;
    const title = v === 0 ? s.title : `${s.title} · ${BRANCH_SUFFIXES[v]}`;
    const qPrefix = `${id}-q`;

    out.push({
      id,
      track: "shared",
      partNumber: 1,
      partType: "Part 1 · Everyday Dialogue",
      title,
      subtitleVi: `Hội thoại đăng ký ${s.facility}: luyện bẫy tự sửa địa chỉ/ngày học, số đếm và danh từ số nhiều -s ('${s.pluralNoun}').`,
      difficultyBand: i % 2 === 0 ? "6.5" : "7.0",
      durationSec: 120,
      ksaFocus: ["K", "S", "A"],
      segments: [
        {
          id: "seg-1",
          startSec: 0,
          endSec: 15,
          speaker: "Receptionist (UK)",
          accent: "en-GB",
          text: `Good morning, ${s.facility} (${BRANCH_SUFFIXES[v]}). How may I help with your booking?`,
          xrayType: "neutral",
        },
        {
          id: "seg-2",
          startSec: 15,
          endSec: 36,
          speaker: "Caller (AU)",
          accent: "en-AU",
          text: `Hello, I want to join the group pass. My home street used to be ${s.streetOld} Lane, wait sorry—we relocated recently, so it's ${s.streetNew} Avenue, spelled ${s.streetSpelled}.`,
          xrayType: "distractor",
          xrayNoteVi: `Bẫy tự sửa địa chỉ: bỏ '${s.streetOld}' sau cụm 'wait sorry', chốt '${s.streetNew}'.`,
          questionIds: [`${qPrefix}1`],
        },
        {
          id: "seg-3",
          startSec: 36,
          endSec: 56,
          speaker: "Receptionist (UK)",
          accent: "en-GB",
          text: `Recorded cleanly. Beginners normally meet on ${s.dayOld}, actually scratch that—this month's cohort fills ${s.dayNew} instead.`,
          xrayType: "distractor",
          xrayNoteVi: `Signpost 'actually scratch that' loại '${s.dayOld}', chốt '${s.dayNew}'.`,
          questionIds: [`${qPrefix}2`],
        },
        {
          id: "seg-4",
          startSec: 56,
          endSec: 74,
          speaker: "Caller (AU)",
          accent: "en-AU",
          text: `${s.dayNew} suits me fine. Should visitors carry any spare gear or shared equipment?`,
          xrayType: "signpost",
          xrayNoteVi: "Câu hỏi mở đường trực tiếp cho danh từ thiết bị mang theo.",
          questionIds: [`${qPrefix}3`],
        },
        {
          id: "seg-5",
          startSec: 74,
          endSec: 96,
          speaker: "Receptionist (UK)",
          accent: "en-GB",
          text: `Standard members receive safety briefings and bench lockers, though we ask everyone to label spare ${s.pluralNoun} clearly and pack refillable bottles.`,
          xrayType: "evidence",
          xrayNoteVi: `Nghe kỹ âm đuôi -s của danh từ số nhiều '${s.pluralNoun}' và 'bottles'.`,
          connectedSpeechNoteVi: `Chú ý nối âm 'safety_briefings and bench_lockers'.`,
          questionIds: [`${qPrefix}3`, `${qPrefix}4`],
        },
        {
          id: "seg-6",
          startSec: 96,
          endSec: 120,
          speaker: "Receptionist (UK)",
          accent: "en-GB",
          text: `Standard term fees begin at ${s.feeOld} pounds monthly, though our early-booking discount lowers that to ${s.feeNew} pounds. Check in at Gate ${s.gateNumber}.`,
          xrayType: "evidence",
          xrayNoteVi: `Bẫy giá: '${s.feeOld}' chỉ là giá gốc, giá đóng thực tế là '${s.feeNew}'.`,
          questionIds: [`${qPrefix}5`, `${qPrefix}6`],
        },
      ],
      dictationDrills: [
        {
          id: `${id}-d1`,
          segmentId: "seg-5",
          promptContextVi: "Nghe danh từ số nhiều không bị rơi âm -s.",
          targetText: `we ask everyone to label spare ${s.pluralNoun} clearly and pack refillable bottles`,
          focusPhenomenonVi: `Âm đuôi số nhiều -s (${s.pluralNoun}, bottles)`,
        },
        {
          id: `${id}-d2`,
          segmentId: "seg-6",
          promptContextVi: "Nghe giá ưu đãi sau cụm chỉnh sửa và số cổng.",
          targetText: `our early-booking discount lowers that to ${s.feeNew} pounds at gate ${s.gateNumber.toLowerCase()}`,
          focusPhenomenonVi: "Số đếm & nối âm 'to' giảm nhẹ",
        },
      ],
      questions: [
        {
          id: `${qPrefix}1`,
          number: 1,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (ONE WORD ONLY).",
          wordLimit: 1,
          promptEn: "Current street address: ______ Avenue",
          acceptedAnswers: [s.streetNew],
          anchorKeywords: ["Current", "street", "Avenue"],
          expectedPos: "noun",
          evidenceSegmentId: "seg-2",
          distractorSegmentId: "seg-2",
          distractorTrapNoteVi: `Nhắc tên đường cũ '${s.streetOld}' trước khi đánh vần '${s.streetNew}'.`,
          explanationVi: "Người gọi tự sửa sau cụm 'wait sorry—we relocated recently'.",
          recommendedErrorCode: "L_DISTRACTOR_TRAP",
          ksaDimension: "S",
        },
        {
          id: `${qPrefix}2`,
          number: 2,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (ONE WORD ONLY).",
          wordLimit: 1,
          promptEn: "Scheduled session day this month: ______",
          acceptedAnswers: [s.dayNew],
          anchorKeywords: ["Scheduled", "session", "day"],
          expectedPos: "noun",
          evidenceSegmentId: "seg-3",
          distractorSegmentId: "seg-3",
          distractorTrapNoteVi: `Bẫy hủy ngày '${s.dayOld}' bằng 'actually scratch that'.`,
          explanationVi: `Chốt lịch tháng này học vào '${s.dayNew}'.`,
          recommendedErrorCode: "L_DISTRACTOR_TRAP",
          ksaDimension: "K",
        },
        {
          id: `${qPrefix}3`,
          number: 3,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (có -s số nhiều).",
          wordLimit: 1,
          promptEn: "Label spare ______ clearly before storage",
          acceptedAnswers: [s.pluralNoun],
          anchorKeywords: ["Label", "spare", "storage"],
          expectedPos: "noun_plural",
          evidenceSegmentId: "seg-5",
          distractorTrapNoteVi: "Dễ nghe thiếu âm -s cuối danh từ số nhiều.",
          explanationVi: `Cụm 'label spare ${s.pluralNoun} clearly' đọc rõ âm gió cuối.`,
          recommendedErrorCode: "L_SPELLING_OR_SUFFIX",
          ksaDimension: "K",
        },
        {
          id: `${qPrefix}4`,
          number: 4,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ.",
          wordLimit: 1,
          promptEn: "Bring refillable ______ from home",
          acceptedAnswers: ["bottles"],
          anchorKeywords: ["refillable", "home"],
          expectedPos: "noun_plural",
          evidenceSegmentId: "seg-5",
          distractorTrapNoteVi: "Số nhiều 'bottles' đi liền sau 'pack refillable'.",
          explanationVi: "Bắt buộc giữ đúng đuôi -s của 'bottles'.",
          recommendedErrorCode: "L_SPELLING_OR_SUFFIX",
          ksaDimension: "S",
        },
        {
          id: `${qPrefix}5`,
          number: 5,
          type: "note_completion",
          instructionVi: "Viết CON SỐ hoặc CHỮ SỐ.",
          wordLimit: 2,
          promptEn: "Discounted monthly fee: £______",
          acceptedAnswers: [
            s.feeNew,
            String(
              ({
                "thirty-six": 36,
                "twenty-two": 22,
                "forty-five": 45,
                fourteen: 14,
                nineteen: 19,
                "fifty-four": 54,
                "twenty-five": 25,
                "twenty-nine": 29,
                "thirty-nine": 39,
              } as Record<string, number>)[s.feeNew] ?? 25
            ),
          ],
          anchorKeywords: ["Discounted", "monthly", "fee"],
          expectedPos: "number",
          evidenceSegmentId: "seg-6",
          distractorSegmentId: "seg-6",
          distractorTrapNoteVi: `Nói giá cũ '${s.feeOld}' rồi giảm xuống còn '${s.feeNew}'.`,
          explanationVi: `Giá thực tế sau ưu đãi là ${s.feeNew} bảng.`,
          recommendedErrorCode: "L_DISTRACTOR_TRAP",
          ksaDimension: "K",
        },
        {
          id: `${qPrefix}6`,
          number: 6,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ hoặc SỐ.",
          wordLimit: 1,
          promptEn: "Check-in entrance: Gate ______",
          acceptedAnswers: [
            s.gateNumber,
            String(
              ({ One: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8 } as Record<string, number>)[s.gateNumber] ?? 1
            ),
          ],
          anchorKeywords: ["Check-in", "Gate"],
          expectedPos: "number",
          evidenceSegmentId: "seg-6",
          distractorTrapNoteVi: "Nghe nhanh thông tin ở câu chốt cuối hội thoại.",
          explanationVi: `Điểm đón khách nằm tại Gate ${s.gateNumber}.`,
          recommendedErrorCode: "L_CONNECTED_SPEECH",
          ksaDimension: "A",
        },
      ],
    });
  }
  return out;
}

interface Part2Seed {
  title: string;
  siteName: string;
  zones: { q1Title: string; q1Zone: "A" | "B" | "C" | "D" | "E" | "F"; q2Title: string; q2Zone: "A" | "B" | "C" | "D" | "E" | "F"; q3Title: string; q3Zone: "A" | "B" | "C" | "D" | "E" | "F"; q4Title: string; q4Zone: "A" | "B" | "C" | "D" | "E" | "F" };
  pluralTarget: string;
  closingAdj: string;
}

const P2_SEEDS: Part2Seed[] = [
  { title: "Botanic Glasshouse Orientation Tour", siteName: "Royal Glasshouse Reserve", zones: { q1Title: "Seed Bank Archive", q1Zone: "A", q2Title: "Fern Canopy Bridge", q2Zone: "C", q3Title: "Orchid Nursery", q3Zone: "E", q4Title: "Tool Compost Shed", q4Zone: "B" }, pluralTarget: "labels", closingAdj: "accessible" },
  { title: "Maritime Heritage Shipyard Walk", siteName: "Old Quay Naval Yard", zones: { q1Title: "Ropewalk Loft", q1Zone: "B", q2Title: "Timber Steam Box", q2Zone: "D", q3Title: "Dry-Dock Viewpoint", q3Zone: "F", q4Title: "Chart Reading Room", q4Zone: "A" }, pluralTarget: "anchors", closingAdj: "sheltered" },
  { title: "Regional Science Discovery Hall", siteName: "Meridian Interactive Hall", zones: { q1Title: "Wind Tunnel Lab", q1Zone: "C", q2Title: "Acoustic Dome", q2Zone: "E", q3Title: "Optics Corridor", q3Zone: "A", q4Title: "Solar Roof Terrace", q4Zone: "D" }, pluralTarget: "mirrors", closingAdj: "interactive" },
  { title: "Upland Nature Wetlands Trail Guide", siteName: "heron Marsh Sanctuary", zones: { q1Title: "Ringing Station", q1Zone: "D", q2Title: "Boardwalk Hide", q2Zone: "F", q3Title: "Reed Filtration Pond", q3Zone: "B", q4Title: "Mudflat Viewing Deck", q4Zone: "C" }, pluralTarget: "swallows", closingAdj: "flooded" },
  { title: "Municipal Sports Precinct Orientation", siteName: "Westgate Athletic Precinct", zones: { q1Title: "Physio Recovery Suite", q1Zone: "E", q2Title: "Warm-Up Track", q2Zone: "A", q3Title: "Equipment Issue Cage", q3Zone: "C", q4Title: "Climbing Boulder Wall", q4Zone: "F" }, pluralTarget: "medics", closingAdj: "resurfaced" },
  { title: "Alpine Geology Open-Air Museum", siteName: "Granite Quarry Reserve", zones: { q1Title: "Core Sample Vault", q1Zone: "F", q2Title: "Fossil Terrace", q2Zone: "B", q3Title: "Crushing Mill Floor", q3Zone: "D", q4Title: "Panoramic Ridge Deck", q4Zone: "E" }, pluralTarget: "helmets", closingAdj: "steep" },
  { title: "University Archive Campus Briefing", siteName: "Alderford Rare Books Annex", zones: { q1Title: "Microfilm Bay", q1Zone: "A", q2Title: "Map Restoration Bench", q2Zone: "D", q3Title: "Climate Reading Hall", q3Zone: "B", q4Title: "Locker Cloakroom", q4Zone: "F" }, pluralTarget: "pencils", closingAdj: "humid" },
  { title: "Eco-Farm Orchard Visitor Map", siteName: "Orchardstone Demonstration Farm", zones: { q1Title: "Cider Press Barn", q1Zone: "B", q2Title: "Pollinator Meadow", q2Zone: "E", q3Title: "Solar Pump Well", q3Zone: "F", q4Title: "Root Cellar Store", q4Zone: "C" }, pluralTarget: "hives", closingAdj: "muddy" },
  { title: "Civic Emergency Training Centre Map", siteName: "Harbour Rescue Training Yard", zones: { q1Title: "Hydrant Practice Wall", q1Zone: "C", q2Title: "Rope Descent Tower", q2Zone: "A", q3Title: "Briefing Theatre", q3Zone: "D", q4Title: "Gear Drying Bay", q4Zone: "E" }, pluralTarget: "radios", closingAdj: "restricted" },
];

const SHARED_MAP_BASE: Omit<ListeningMapLayout, "walkPathSteps"> = {
  width: 520,
  height: 320,
  startNode: { x: 260, y: 288, label: "Main Gate" },
  roads: [
    { x1: 260, y1: 288, x2: 260, y2: 50, name: "Central Spine" },
    { x1: 60, y1: 165, x2: 460, y2: 165, name: "Cross Avenue" },
    { x1: 60, y1: 75, x2: 460, y2: 75, name: "North Terrace" },
  ],
  landmarks: [
    { id: "lm-hub", label: "Info Desk", x: 225, y: 180, w: 70, h: 36 },
    { id: "lm-lawn", label: "Central Plaza", x: 220, y: 92, w: 80, h: 42 },
  ],
  candidateZones: [
    { code: "A", x: 90, y: 225 },
    { code: "B", x: 90, y: 118 },
    { code: "C", x: 90, y: 42 },
    { code: "D", x: 430, y: 42 },
    { code: "E", x: 430, y: 118 },
    { code: "F", x: 430, y: 225 },
  ],
};

function zoneCoord(code: "A" | "B" | "C" | "D" | "E" | "F") {
  return SHARED_MAP_BASE.candidateZones.find((z) => z.code === code) ?? { x: 260, y: 160 };
}

function buildPart2Listening(): ListeningLessonContent[] {
  const out: ListeningLessonContent[] = [];
  for (let i = 0; i < 26; i++) {
    const s = P2_SEEDS[i % P2_SEEDS.length];
    const v = Math.floor(i / P2_SEEDS.length);
    const id = `list-bank-p2-${String(i + 1).padStart(3, "0")}`;
    const title = v === 0 ? s.title : `${s.title} (${BRANCH_SUFFIXES[v]})`;
    const qPrefix = `${id}-q`;
    const c1 = zoneCoord(s.zones.q1Zone);
    const c2 = zoneCoord(s.zones.q2Zone);
    const c3 = zoneCoord(s.zones.q3Zone);
    const c4 = zoneCoord(s.zones.q4Zone);

    out.push({
      id,
      track: "shared",
      partNumber: 2,
      partType: "Part 2 · Map Orientation Monologue",
      title,
      subtitleVi: `Độc thoại định hướng bản đồ ${s.siteName}: rèn kỹ năng xoay phương hướng (Zone A–F) và bẫy hủy lựa chọn.`,
      difficultyBand: i % 2 === 0 ? "7.0" : "7.5",
      durationSec: 120,
      ksaFocus: ["K", "S", "A"],
      mapLayout: {
        ...SHARED_MAP_BASE,
        walkPathSteps: [
          { segmentId: "seg-2", x: c1.x, y: c1.y, hintVi: `Tới Zone ${s.zones.q1Zone}: ${s.zones.q1Title}` },
          { segmentId: "seg-3", x: c2.x, y: c2.y, hintVi: `Tới Zone ${s.zones.q2Zone}: ${s.zones.q2Title}` },
          { segmentId: "seg-4", x: c3.x, y: c3.y, hintVi: `Tới Zone ${s.zones.q3Zone}: ${s.zones.q3Title}` },
          { segmentId: "seg-5", x: c4.x, y: c4.y, hintVi: `Tới Zone ${s.zones.q4Zone}: ${s.zones.q4Title}` },
        ],
      },
      segments: [
        {
          id: "seg-1",
          startSec: 0,
          endSec: 18,
          speaker: "Site Coordinator (AU)",
          accent: "en-AU",
          text: `Welcome everyone to ${s.siteName}. We are standing right at the Main Gate facing north up the Central Spine past the Info Desk.`,
          xrayType: "signpost",
          xrayNoteVi: "Điểm neo xuất phát (Main Gate) hướng bắc lên Central Spine.",
        },
        {
          id: "seg-2",
          startSec: 18,
          endSec: 38,
          speaker: "Site Coordinator (AU)",
          accent: "en-AU",
          text: `First, let's locate the ${s.zones.q1Title}. Originally it sat on the far east wing, yet last winter's refit moved it directly to Zone ${s.zones.q1Zone}.`,
          xrayType: "evidence",
          xrayNoteVi: `Cụm 'moved it directly to Zone ${s.zones.q1Zone}' chốt vị trí 1.`,
          questionIds: [`${qPrefix}1`],
        },
        {
          id: "seg-3",
          startSec: 38,
          endSec: 58,
          speaker: "Site Coordinator (AU)",
          accent: "en-AU",
          text: `Walk further along Cross Avenue toward Central Plaza: the ${s.zones.q2Title} now occupies Zone ${s.zones.q2Zone}, clear of construction.`,
          xrayType: "evidence",
          xrayNoteVi: `Chỉ rõ mốc Central Plaza rồi rẽ tới Zone ${s.zones.q2Zone}.`,
          questionIds: [`${qPrefix}2`],
        },
        {
          id: "seg-4",
          startSec: 58,
          endSec: 78,
          speaker: "Site Coordinator (AU)",
          accent: "en-AU",
          text: `Before heading down, look across North Terrace where you'll find the ${s.zones.q3Title} positioned cleanly inside Zone ${s.zones.q3Zone}.`,
          xrayType: "evidence",
          xrayNoteVi: `Vị trí của ${s.zones.q3Title} nằm gọn tại Zone ${s.zones.q3Zone}.`,
          questionIds: [`${qPrefix}3`],
        },
        {
          id: "seg-5",
          startSec: 78,
          endSec: 100,
          speaker: "Site Coordinator (AU)",
          accent: "en-AU",
          text: `Meanwhile, the ${s.zones.q4Title} operates out of Zone ${s.zones.q4Zone}, and volunteers check protective ${s.pluralTarget} at the desk there.`,
          xrayType: "evidence",
          xrayNoteVi: `Vừa chốt Zone ${s.zones.q4Zone}, vừa đọc danh từ số nhiều '${s.pluralTarget}'.`,
          questionIds: [`${qPrefix}4`, `${qPrefix}5`],
        },
        {
          id: "seg-6",
          startSec: 100,
          endSec: 120,
          speaker: "Site Coordinator (AU)",
          accent: "en-AU",
          text: `One safety reminder before setting off: upper galleries stay completely ${s.closingAdj} after five o'clock unless escorted by wardens.`,
          xrayType: "evidence",
          xrayNoteVi: `Chốt tính từ '${s.closingAdj}' sau động từ nối 'stay completely'.`,
          questionIds: [`${qPrefix}6`],
        },
      ],
      dictationDrills: [
        {
          id: `${id}-d1`,
          segmentId: "seg-5",
          promptContextVi: "Nghe danh từ số nhiều không rơi âm đuôi -s.",
          targetText: `volunteers check protective ${s.pluralTarget} at the desk there`,
          focusPhenomenonVi: `Số nhiều (${s.pluralTarget})`,
        },
        {
          id: `${id}-d2`,
          segmentId: "seg-6",
          promptContextVi: "Nghe tính từ chốt cảnh báo an toàn cuối buổi.",
          targetText: `upper galleries stay completely ${s.closingAdj} after five unless escorted by wardens`,
          focusPhenomenonVi: "Nối âm & trọng âm tính từ",
        },
      ],
      questions: [
        {
          id: `${qPrefix}1`,
          number: 1,
          type: "map_labelling",
          promptEn: `Locate ${s.zones.q1Title} on the site map.`,
          instructionVi: "Chọn chữ cái A–F trên bản đồ.",
          options: ["A", "B", "C", "D", "E", "F"].map((c) => ({ value: c, label: `Zone ${c}` })),
          acceptedAnswers: [s.zones.q1Zone],
          anchorKeywords: [s.zones.q1Title],
          expectedPos: "place_code",
          evidenceSegmentId: "seg-2",
          distractorSegmentId: "seg-2",
          distractorTrapNoteVi: "Nhắc hướng đông cũ trước khi chốt chuyển sang vị trí mới.",
          explanationVi: `Chuyển tới Zone ${s.zones.q1Zone}.`,
          recommendedErrorCode: "L_DISTRACTOR_TRAP",
          ksaDimension: "S",
        },
        {
          id: `${qPrefix}2`,
          number: 2,
          type: "map_labelling",
          promptEn: `Locate ${s.zones.q2Title} along Cross Avenue.`,
          instructionVi: "Chọn chữ cái A–F trên bản đồ.",
          options: ["A", "B", "C", "D", "E", "F"].map((c) => ({ value: c, label: `Zone ${c}` })),
          acceptedAnswers: [s.zones.q2Zone],
          anchorKeywords: [s.zones.q2Title],
          expectedPos: "place_code",
          evidenceSegmentId: "seg-3",
          distractorTrapNoteVi: "Bám theo lộ trình Central Plaza từ đoạn 3.",
          explanationVi: `Nằm tại Zone ${s.zones.q2Zone}.`,
          recommendedErrorCode: "L_LOST_TRACK_PANIC",
          ksaDimension: "S",
        },
        {
          id: `${qPrefix}3`,
          number: 3,
          type: "map_labelling",
          promptEn: `Locate ${s.zones.q3Title} across North Terrace.`,
          instructionVi: "Chọn chữ cái A–F trên bản đồ.",
          options: ["A", "B", "C", "D", "E", "F"].map((c) => ({ value: c, label: `Zone ${c}` })),
          acceptedAnswers: [s.zones.q3Zone],
          anchorKeywords: [s.zones.q3Title],
          expectedPos: "place_code",
          evidenceSegmentId: "seg-4",
          distractorTrapNoteVi: "Nghe signpost chỉ hướng từ North Terrace.",
          explanationVi: `Gắn nhãn Zone ${s.zones.q3Zone}.`,
          recommendedErrorCode: "L_LOST_TRACK_PANIC",
          ksaDimension: "A",
        },
        {
          id: `${qPrefix}4`,
          number: 4,
          type: "map_labelling",
          promptEn: `Locate ${s.zones.q4Title} near the inspection desk.`,
          instructionVi: "Chọn chữ cái A–F trên bản đồ.",
          options: ["A", "B", "C", "D", "E", "F"].map((c) => ({ value: c, label: `Zone ${c}` })),
          acceptedAnswers: [s.zones.q4Zone],
          anchorKeywords: [s.zones.q4Title],
          expectedPos: "place_code",
          evidenceSegmentId: "seg-5",
          distractorTrapNoteVi: "Từ chuyển đoạn 'Meanwhile' báo hiệu vị trí thứ tư.",
          explanationVi: `Nằm tại Zone ${s.zones.q4Zone}.`,
          recommendedErrorCode: "L_CONNECTED_SPEECH",
          ksaDimension: "K",
        },
        {
          id: `${qPrefix}5`,
          number: 5,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (có -s số nhiều).",
          wordLimit: 1,
          promptEn: "Volunteers verify protective ______ at the desk.",
          acceptedAnswers: [s.pluralTarget],
          anchorKeywords: ["Volunteers", "protective", "desk"],
          expectedPos: "noun_plural",
          evidenceSegmentId: "seg-5",
          distractorTrapNoteVi: "Đừng quên âm -s ở cuối danh từ.",
          explanationVi: `Chính xác là '${s.pluralTarget}'.`,
          recommendedErrorCode: "L_SPELLING_OR_SUFFIX",
          ksaDimension: "K",
        },
        {
          id: `${qPrefix}6`,
          number: 6,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (tính từ).",
          wordLimit: 1,
          promptEn: "Upper galleries remain ______ after 5 p.m.",
          acceptedAnswers: [s.closingAdj],
          anchorKeywords: ["Upper", "galleries"],
          expectedPos: "adjective",
          evidenceSegmentId: "seg-6",
          distractorTrapNoteVi: "Chú ý paraphrase 'remain' ↔ 'stay'.",
          explanationVi: `Từ điền đúng là '${s.closingAdj}'.`,
          recommendedErrorCode: "L_CONNECTED_SPEECH",
          ksaDimension: "S",
        },
      ],
    });
  }
  return out;
}

interface Part3Seed {
  title: string;
  projectTopic: string;
  agreedReason: string;
  tutorWarning: string;
  taskMaya: string;
  taskLiam: string;
  finalVerb: string;
  pluralEvidence: string;
}

const P3_SEEDS: Part3Seed[] = [
  { title: "Estuary Plastic Sampling Design Review", projectTopic: "microfibre filter placement along harbour tides", agreedReason: "C", tutorWarning: "A", taskMaya: "B", taskLiam: "C", finalVerb: "calibrated", pluralEvidence: "samples" },
  { title: "Campus Acoustic Study Seminar Feedback", projectTopic: "decibel logging inside open-plan reading halls", agreedReason: "B", tutorWarning: "C", taskMaya: "A", taskLiam: "B", finalVerb: "verified", pluralEvidence: "recordings" },
  { title: "Urban Beehive Pollination Fieldwork Review", projectTopic: "pollen pellet sorting across inner-city rooftops", agreedReason: "A", tutorWarning: "B", taskMaya: "C", taskLiam: "A", finalVerb: "weighed", pluralEvidence: "slides" },
  { title: "Solar Desalination Bench Prototype Discussion", projectTopic: "condensation drip recovery on copper baffles", agreedReason: "C", tutorWarning: "A", taskMaya: "B", taskLiam: "C", finalVerb: "sealed", pluralEvidence: "valves" },
  { title: "Bilingual Dyslexia Reading Trial Planning", projectTopic: "font-spacing speed checks among exchange pupils", agreedReason: "B", tutorWarning: "C", taskMaya: "A", taskLiam: "B", finalVerb: "matched", pluralEvidence: "scores" },
  { title: "Soil Mycorrhiza Pot Experiment Evaluation", projectTopic: "root colonisation density under drip irrigation", agreedReason: "A", tutorWarning: "B", taskMaya: "C", taskLiam: "A", finalVerb: "dried", pluralEvidence: "roots" },
  { title: "Historic Mortar Weathering Thesis Planning", projectTopic: "salt crystallisation tests on lime cylinders", agreedReason: "C", tutorWarning: "A", taskMaya: "B", taskLiam: "C", finalVerb: "soaked", pluralEvidence: "cores" },
  { title: "Transit Timetable App Usability Pilot", projectTopic: "high-contrast arrival alerts for older riders", agreedReason: "B", tutorWarning: "C", taskMaya: "A", taskLiam: "B", finalVerb: "tested", pluralEvidence: "screens" },
  { title: "Geothermal Loop Insulation Research Debrief", projectTopic: "borehole thermal loss across clay subsoil", agreedReason: "A", tutorWarning: "B", taskMaya: "C", taskLiam: "A", finalVerb: "logged", pluralEvidence: "sensors" },
];

function buildPart3Listening(): ListeningLessonContent[] {
  const out: ListeningLessonContent[] = [];
  const optionSets = {
    A: "Limited battery autonomy overnight",
    B: "Missing baseline control data",
    C: "Inconsistent field timing logs",
  };
  for (let i = 0; i < 26; i++) {
    const s = P3_SEEDS[i % P3_SEEDS.length];
    const v = Math.floor(i / P3_SEEDS.length);
    const id = `list-bank-p3-${String(i + 1).padStart(3, "0")}`;
    const title = v === 0 ? s.title : `${s.title} · Cohort ${v + 1}`;
    const qPrefix = `${id}-q`;

    out.push({
      id,
      track: "shared",
      partNumber: 3,
      partType: "Part 3 · Academic Discussion",
      title,
      subtitleVi: `Thảo luận học thuật (${s.projectTopic}): bắt bẫy đồng thuận giả và chia nhiệm vụ nhóm.`,
      difficultyBand: i % 2 === 0 ? "7.0" : "7.5",
      durationSec: 120,
      ksaFocus: ["K", "S", "A"],
      segments: [
        {
          id: "seg-1",
          startSec: 0,
          endSec: 18,
          speaker: "Tutor (UK)",
          accent: "en-GB",
          text: `Let's review your draft protocol on ${s.projectTopic} before ethics clearance closes on Friday.`,
          xrayType: "neutral",
        },
        {
          id: "seg-2",
          startSec: 18,
          endSec: 40,
          speaker: "Maya & Liam",
          accent: "en-AU",
          text: `Initially I worried about cost, yet once we checked last week's trial, we both agreed ${optionSets[s.agreedReason as "A" | "B" | "C"].toLowerCase()} was the biggest headache.`,
          xrayType: "evidence",
          xrayNoteVi: `Cả hai chốt ý kiến đồng thuận chung là đáp án ${s.agreedReason} sau khi loại 'cost'.`,
          questionIds: [`${qPrefix}1`],
        },
        {
          id: "seg-3",
          startSec: 40,
          endSec: 62,
          speaker: "Tutor (UK)",
          accent: "en-GB",
          text: `Good catch, though remember examiners will penalise ${optionSets[s.tutorWarning as "A" | "B" | "C"].toLowerCase()} far more strictly than layout flaws.`,
          xrayType: "distractor",
          xrayNoteVi: `Giảng viên nhấn mạnh lỗi bị trừ điểm nặng nhất: ${s.tutorWarning}.`,
          questionIds: [`${qPrefix}2`],
        },
        {
          id: "seg-4",
          startSec: 62,
          endSec: 84,
          speaker: "Maya (US)",
          accent: "en-US",
          text: `In that case, I'll tackle Task ${s.taskMaya} tonight while Liam handles Task ${s.taskLiam} with the clean lab spreadsheet.`,
          xrayType: "evidence",
          xrayNoteVi: `Phân công rõ ràng Maya -> ${s.taskMaya}, Liam -> ${s.taskLiam}.`,
          questionIds: [`${qPrefix}3`, `${qPrefix}4`],
        },
        {
          id: "seg-5",
          startSec: 84,
          endSec: 102,
          speaker: "Liam (UK)",
          accent: "en-GB",
          text: `Sure thing—I'll store all labelled ${s.pluralEvidence} inside the cold locker right after sorting.`,
          xrayType: "evidence",
          xrayNoteVi: `Âm đuôi -s của '${s.pluralEvidence}'.`,
          questionIds: [`${qPrefix}5`],
        },
        {
          id: "seg-6",
          startSec: 102,
          endSec: 120,
          speaker: "Tutor (UK)",
          accent: "en-GB",
          text: `Excellent. Just confirm every bench gauge has been ${s.finalVerb} prior to uploading charts.`,
          xrayType: "evidence",
          xrayNoteVi: `Đuôi -ed bị động '${s.finalVerb}'.`,
          questionIds: [`${qPrefix}6`],
        },
      ],
      dictationDrills: [
        {
          id: `${id}-d1`,
          segmentId: "seg-5",
          promptContextVi: "Nghe rõ âm số nhiều -s sau 'labelled'.",
          targetText: `store all labelled ${s.pluralEvidence} inside the cold locker right after sorting`,
          focusPhenomenonVi: `Đuôi -ed / -s (labelled ${s.pluralEvidence})`,
        },
        {
          id: `${id}-d2`,
          segmentId: "seg-6",
          promptContextVi: "Nghe động từ quá khứ phân từ bị động có đuôi -ed.",
          targetText: `confirm every bench gauge has been ${s.finalVerb} prior to uploading charts`,
          focusPhenomenonVi: `Động từ bị động đuôi -ed (${s.finalVerb})`,
        },
      ],
      questions: [
        {
          id: `${qPrefix}1`,
          number: 1,
          type: "mcq",
          promptEn: "What did both students agree caused the biggest problem in last week's trial?",
          instructionVi: "Chọn A, B hoặc C.",
          options: [
            { value: "A", label: `A. ${optionSets.A}` },
            { value: "B", label: `B. ${optionSets.B}` },
            { value: "C", label: `C. ${optionSets.C}` },
          ],
          acceptedAnswers: [s.agreedReason],
          anchorKeywords: ["both", "agreed", "biggest"],
          expectedPos: "choice",
          evidenceSegmentId: "seg-2",
          distractorSegmentId: "seg-2",
          distractorTrapNoteVi: "Loại yếu tố chi phí ban đầu để bắt ý đồng thuận cuối.",
          explanationVi: `Cả hai đồng ý chọn phương án ${s.agreedReason}.`,
          recommendedErrorCode: "L_DISTRACTOR_TRAP",
          ksaDimension: "S",
        },
        {
          id: `${qPrefix}2`,
          number: 2,
          type: "mcq",
          promptEn: "What weakness does the tutor warn examiners penalise most strictly?",
          instructionVi: "Chọn A, B hoặc C.",
          options: [
            { value: "A", label: `A. ${optionSets.A}` },
            { value: "B", label: `B. ${optionSets.B}` },
            { value: "C", label: `C. ${optionSets.C}` },
          ],
          acceptedAnswers: [s.tutorWarning],
          anchorKeywords: ["examiners", "penalise"],
          expectedPos: "choice",
          evidenceSegmentId: "seg-3",
          distractorTrapNoteVi: "Phân biệt điều giảng viên cảnh báo nặng hơn lỗi trình bày.",
          explanationVi: `Giảng viên cảnh báo phương án ${s.tutorWarning}.`,
          recommendedErrorCode: "L_DISTRACTOR_TRAP",
          ksaDimension: "K",
        },
        {
          id: `${qPrefix}3`,
          number: 3,
          type: "matching",
          promptEn: "Which task will Maya complete tonight?",
          instructionVi: "Chọn phần việc A, B hoặc C cho Maya.",
          options: [
            { value: "A", label: "A. Method Verification" },
            { value: "B", label: "B. Literature Table" },
            { value: "C", label: "C. Error Spreadsheet" },
          ],
          acceptedAnswers: [s.taskMaya],
          anchorKeywords: ["Maya"],
          expectedPos: "choice",
          evidenceSegmentId: "seg-4",
          distractorTrapNoteVi: "Theo dõi đúng tên người nói.",
          explanationVi: `Maya nhận Task ${s.taskMaya}.`,
          recommendedErrorCode: "L_CONNECTED_SPEECH",
          ksaDimension: "S",
        },
        {
          id: `${qPrefix}4`,
          number: 4,
          type: "matching",
          promptEn: "Which task will Liam handle with the clean spreadsheet?",
          instructionVi: "Chọn phần việc A, B hoặc C cho Liam.",
          options: [
            { value: "A", label: "A. Method Verification" },
            { value: "B", label: "B. Literature Table" },
            { value: "C", label: "C. Error Spreadsheet" },
          ],
          acceptedAnswers: [s.taskLiam],
          anchorKeywords: ["Liam"],
          expectedPos: "choice",
          evidenceSegmentId: "seg-4",
          distractorTrapNoteVi: "Đọc lướt nối giữa Maya và Liam.",
          explanationVi: `Liam nhận Task ${s.taskLiam}.`,
          recommendedErrorCode: "L_CONNECTED_SPEECH",
          ksaDimension: "S",
        },
        {
          id: `${qPrefix}5`,
          number: 5,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (số nhiều -s).",
          wordLimit: 1,
          promptEn: "Store labelled ______ in the cold locker.",
          acceptedAnswers: [s.pluralEvidence],
          anchorKeywords: ["Store", "labelled", "locker"],
          expectedPos: "noun_plural",
          evidenceSegmentId: "seg-5",
          distractorTrapNoteVi: "Giữ âm -s số nhiều ở cuối từ.",
          explanationVi: `Chính xác là '${s.pluralEvidence}'.`,
          recommendedErrorCode: "L_SPELLING_OR_SUFFIX",
          ksaDimension: "K",
        },
        {
          id: `${qPrefix}6`,
          number: 6,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (động từ bị động -ed).",
          wordLimit: 1,
          promptEn: "Ensure every bench gauge has been ______.",
          acceptedAnswers: [s.finalVerb],
          anchorKeywords: ["bench", "gauge"],
          expectedPos: "adjective",
          evidenceSegmentId: "seg-6",
          distractorTrapNoteVi: "Chú ý đuôi -ed nối sang 'prior'.",
          explanationVi: `Động từ đúng là '${s.finalVerb}'.`,
          recommendedErrorCode: "L_SPELLING_OR_SUFFIX",
          ksaDimension: "K",
        },
      ],
    });
  }
  return out;
}

interface Part4Seed {
  title: string;
  discipline: string;
  nounOne: string;
  pluralTwo: string;
  edVerb: string;
  adjFour: string;
  materialFive: string;
  hazardSix: string;
}

const P4_SEEDS: Part4Seed[] = [
  { title: "Deep-Ocean Thermal Vent Tube Worms", discipline: "Marine Zoology", nounOne: "sulfur", pluralTwo: "plumes", edVerb: "oxidised", adjFour: "blind", materialFive: "chitin", hazardSix: "collapse" },
  { title: "Inca Rope-Suspension Highland Bridges", discipline: "Structural History", nounOne: "grass", pluralTwo: "cables", edVerb: "braided", adjFour: "elastic", materialFive: "granite", hazardSix: "rot" },
  { title: "Acoustic Bats in Urban Stone Bridges", discipline: "Animal Bioacoustics", nounOne: "echo", pluralTwo: "crevices", edVerb: "sheltered", adjFour: "faint", materialFive: "limestone", hazardSix: "glare" },
  { title: "Medieval Watermarked Rag Papermaking", discipline: "Book Archaeology", nounOne: "linen", pluralTwo: "moulds", edVerb: "soaked", adjFour: "dense", materialFive: "gelatine", hazardSix: "mould" },
  { title: "Glacial Ice-Core Air Bubble Clues", discipline: "Paleoclimatology", nounOne: "dust", pluralTwo: "layers", edVerb: "trapped", adjFour: "brittle", materialFive: "quartz", hazardSix: "melting" },
  { title: "Nomadic Mongolian Felt Yurt Aerodynamics", discipline: "Vernacular Engineering", nounOne: "wool", pluralTwo: "trellises", edVerb: "lashed", adjFour: "stable", materialFive: "willow", hazardSix: "uplift" },
  { title: "Fungal Networks Beneath Boreal Pines", discipline: "Forest Ecology", nounOne: "sugar", pluralTwo: "threads", edVerb: "exchanged", adjFour: "acidic", materialFive: "nitrogen", hazardSix: "drought" },
  { title: "Dryland Fog-Harvesting Mesh Towers", discipline: "Atmospheric Engineering", nounOne: "mist", pluralTwo: "droplets", edVerb: "collected", adjFour: "humid", materialFive: "copper", hazardSix: "tearing" },
  { title: "Early Tide-Predicting Brass Gears", discipline: "History of Computing", nounOne: "lunar", pluralTwo: "pulleys", edVerb: "engraved", adjFour: "smooth", materialFive: "bronze", hazardSix: "friction" },
];

function buildPart4Listening(): ListeningLessonContent[] {
  const out: ListeningLessonContent[] = [];
  for (let i = 0; i < 26; i++) {
    const s = P4_SEEDS[i % P4_SEEDS.length];
    const v = Math.floor(i / P4_SEEDS.length);
    const id = `list-bank-p4-${String(i + 1).padStart(3, "0")}`;
    const title = v === 0 ? s.title : `${s.title} — Lecture ${v + 1}`;
    const qPrefix = `${id}-q`;

    out.push({
      id,
      track: "shared",
      partNumber: 4,
      partType: "Part 4 · Academic Lecture",
      title,
      subtitleVi: `Bài giảng ${s.discipline}: bám cấu trúc signpost học thuật, paraphrase câu bị động và lỗi rơi -s/-ed.`,
      difficultyBand: i % 2 === 0 ? "7.5" : "8.0",
      durationSec: 120,
      ksaFocus: ["K", "S", "A"],
      segments: [
        {
          id: "seg-1",
          startSec: 0,
          endSec: 18,
          speaker: "Lecturer (UK)",
          accent: "en-GB",
          text: `Today in ${s.discipline} we examine ${s.title}, focusing closely on material resilience and failure modes.`,
          xrayType: "signpost",
          xrayNoteVi: "Mở bài giảng giới thiệu bố cục 2 phần: độ bền và cơ chế hỏng.",
        },
        {
          id: "seg-2",
          startSec: 18,
          endSec: 40,
          speaker: "Lecturer (UK)",
          accent: "en-GB",
          text: `First, trace elements rich in ${s.nounOne} react inside microscopic ${s.pluralTwo}, creating an unexpectedly durable outer skin.`,
          xrayType: "evidence",
          xrayNoteVi: `Signpost 'First' đưa liền 2 đáp án danh từ ('${s.nounOne}') và số nhiều ('${s.pluralTwo}').`,
          questionIds: [`${qPrefix}1`, `${qPrefix}2`],
        },
        {
          id: "seg-3",
          startSec: 40,
          endSec: 60,
          speaker: "Lecturer (UK)",
          accent: "en-GB",
          text: `Laboratory specimens previously considered delicate turned out to have been thoroughly ${s.edVerb} across long seasonal cycles.`,
          xrayType: "evidence",
          xrayNoteVi: `Đuôi -ed quá khứ phân từ '${s.edVerb}' nối âm nhanh sang 'across'.`,
          questionIds: [`${qPrefix}3`],
        },
        {
          id: "seg-4",
          startSec: 60,
          endSec: 80,
          speaker: "Lecturer (UK)",
          accent: "en-GB",
          text: `A common misconception assumes the structure stays rigid, whereas in reality it stays remarkably ${s.adjFour} under extreme stress.`,
          xrayType: "distractor",
          xrayNoteVi: "Bẫy tương phản: 'stays rigid' bị phủ nhận ngay sau 'whereas in reality'.",
          questionIds: [`${qPrefix}4`],
        },
        {
          id: "seg-5",
          startSec: 80,
          endSec: 100,
          speaker: "Lecturer (UK)",
          accent: "en-GB",
          text: `Turning to the structural core, thin bands of ${s.materialFive} anchor outer layers tightly.`,
          xrayType: "signpost",
          xrayNoteVi: `Cụm chuyển ý 'Turning to...' báo trước đáp án '${s.materialFive}'.`,
          questionIds: [`${qPrefix}5`],
        },
        {
          id: "seg-6",
          startSec: 100,
          endSec: 120,
          speaker: "Lecturer (UK)",
          accent: "en-GB",
          text: `Without periodic moisture checks, however, long-term stress leaves the entire system vulnerable to sudden ${s.hazardSix}.`,
          xrayType: "evidence",
          xrayNoteVi: `Paraphrase 'at risk of' ↔ 'vulnerable to'.`,
          questionIds: [`${qPrefix}6`],
        },
      ],
      dictationDrills: [
        {
          id: `${id}-d1`,
          segmentId: "seg-2",
          promptContextVi: "Nghe danh từ số nhiều không rơi đuôi -s.",
          targetText: `trace elements rich in ${s.nounOne} react inside microscopic ${s.pluralTwo}`,
          focusPhenomenonVi: `Âm đuôi số nhiều (${s.pluralTwo})`,
        },
        {
          id: `${id}-d2`,
          segmentId: "seg-3",
          promptContextVi: "Nghe động từ phân từ hai đuôi -ed.",
          targetText: `specimens turned out to have been thoroughly ${s.edVerb} across seasonal cycles`,
          focusPhenomenonVi: `Đuôi -ed nối âm (${s.edVerb} across)`,
        },
      ],
      questions: [
        {
          id: `${qPrefix}1`,
          number: 1,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ.",
          wordLimit: 1,
          promptEn: "Outer layers bind trace elements rich in ______.",
          acceptedAnswers: [s.nounOne],
          anchorKeywords: ["trace", "elements", "rich"],
          expectedPos: "noun",
          evidenceSegmentId: "seg-2",
          distractorTrapNoteVi: "Điền danh từ không đếm được ngay sau 'rich in'.",
          explanationVi: `Chính xác là '${s.nounOne}'.`,
          recommendedErrorCode: "L_CONNECTED_SPEECH",
          ksaDimension: "K",
        },
        {
          id: `${qPrefix}2`,
          number: 2,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (số nhiều -s).",
          wordLimit: 1,
          promptEn: "Reactions occur inside tiny ______.",
          acceptedAnswers: [s.pluralTwo],
          anchorKeywords: ["Reactions", "tiny"],
          expectedPos: "noun_plural",
          evidenceSegmentId: "seg-2",
          distractorTrapNoteVi: "Paraphrase 'tiny' ↔ 'microscopic'.",
          explanationVi: `Từ cần điền là '${s.pluralTwo}'.`,
          recommendedErrorCode: "L_SPELLING_OR_SUFFIX",
          ksaDimension: "K",
        },
        {
          id: `${qPrefix}3`,
          number: 3,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (quá khứ phân từ -ed).",
          wordLimit: 1,
          promptEn: "Specimens had been thoroughly ______ over long cycles.",
          acceptedAnswers: [s.edVerb],
          anchorKeywords: ["Specimens", "thoroughly"],
          expectedPos: "adjective",
          evidenceSegmentId: "seg-3",
          distractorTrapNoteVi: "Không đánh rơi âm -ed cuối động từ bị động.",
          explanationVi: `Đáp án là '${s.edVerb}'.`,
          recommendedErrorCode: "L_SPELLING_OR_SUFFIX",
          ksaDimension: "S",
        },
        {
          id: `${qPrefix}4`,
          number: 4,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ (tính từ).",
          wordLimit: 1,
          promptEn: "Contrary to belief, the system remains ______ under stress.",
          acceptedAnswers: [s.adjFour],
          anchorKeywords: ["Contrary", "remains", "stress"],
          expectedPos: "adjective",
          evidenceSegmentId: "seg-4",
          distractorSegmentId: "seg-4",
          distractorTrapNoteVi: "Tránh điền 'rigid' — từ này thuộc quan niệm sai ban đầu.",
          explanationVi: `Sau từ chuyển 'whereas in reality' là '${s.adjFour}'.`,
          recommendedErrorCode: "L_DISTRACTOR_TRAP",
          ksaDimension: "S",
        },
        {
          id: `${qPrefix}5`,
          number: 5,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ.",
          wordLimit: 1,
          promptEn: "Structural core uses thin bands of ______.",
          acceptedAnswers: [s.materialFive],
          anchorKeywords: ["Structural", "core", "bands"],
          expectedPos: "noun",
          evidenceSegmentId: "seg-5",
          distractorTrapNoteVi: "Theo dõi signpost 'Turning to the structural core'.",
          explanationVi: `Chính xác là '${s.materialFive}'.`,
          recommendedErrorCode: "L_LOST_TRACK_PANIC",
          ksaDimension: "A",
        },
        {
          id: `${qPrefix}6`,
          number: 6,
          type: "note_completion",
          instructionVi: "Viết MỘT TỪ.",
          wordLimit: 1,
          promptEn: "Neglecting moisture checks puts the system at risk of ______.",
          acceptedAnswers: [s.hazardSix],
          anchorKeywords: ["moisture", "risk"],
          expectedPos: "noun",
          evidenceSegmentId: "seg-6",
          distractorTrapNoteVi: "Paraphrase 'at risk of' ↔ 'vulnerable to sudden'.",
          explanationVi: `Từ cần điền là '${s.hazardSix}'.`,
          recommendedErrorCode: "L_CONNECTED_SPEECH",
          ksaDimension: "K",
        },
      ],
    });
  }
  return out;
}

export const LISTENING_LOCAL_BANK: ListeningLessonContent[] = [
  ...buildPart1Listening(),
  ...buildPart2Listening(),
  ...buildPart3Listening(),
  ...buildPart4Listening(),
];
