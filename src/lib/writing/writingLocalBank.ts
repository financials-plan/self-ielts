import type { WritingLessonContent } from "./writingEngine";

interface AcademicChartSeed {
  title: string;
  chartTitle: string;
  unit: string;
  categories: string[];
  subjectNoun: string;
  contextLocation: string;
  s1Name: string;
  s1Vals: number[];
  s2Name: string;
  s2Vals: number[];
  s3Name: string;
  s3Vals: number[];
  overallSummaryEn: string;
}

const AT1_SEEDS: AcademicChartSeed[] = [
  {
    title: "Coastal Rail Freight Mode Split (2015–2025)",
    chartTitle: "Regional Port Cargo Share by Transport Mode (%)",
    unit: "% of tonnage",
    categories: ["2015", "2020", "2025"],
    subjectNoun: "cargo tonnage carried across three inland freight corridors",
    contextLocation: "a northern shipping port",
    s1Name: "Diesel Trucks",
    s1Vals: [72, 54, 31],
    s2Name: "Electrified Rail",
    s2Vals: [19, 32, 52],
    s3Name: "Coastal Barges",
    s3Vals: [9, 14, 17],
    overallSummaryEn: "Overall, diesel trucks lost their long-standing majority as electrified rail rose steadily to capture over half of inland port traffic. Meanwhile, coastal barges expanded modestly throughout the period without altering the main rivalry.",
  },
  {
    title: "Household Heating Source Transition in Seaside Towns",
    chartTitle: "Residential Dwelling Heating Systems (%)",
    unit: "% of homes",
    categories: ["2014", "2019", "2024"],
    subjectNoun: "primary space-heating installations across urban apartments",
    contextLocation: "three Baltic coastal towns",
    s1Name: "Oil Boilers",
    s1Vals: [64, 38, 14],
    s2Name: "Air Heat Pumps",
    s2Vals: [12, 34, 58],
    s3Name: "District Steam",
    s3Vals: [24, 28, 28],
    overallSummaryEn: "Overall, domestic heating shifted decisively away from oil boilers toward air-source heat pumps, which became the predominant option by the final year. District steam connections rose slightly before plateauing across the second half of the decade.",
  },
  {
    title: "Civic Library Formats Borrowed by Residents",
    chartTitle: "Annual Lending Share Across Library Formats (%)",
    unit: "% of loans",
    categories: ["2016", "2020", "2024"],
    subjectNoun: "public library loans divided among print editions, e-books, and spoken audio",
    contextLocation: "a metropolitan library network",
    s1Name: "Print Books",
    s1Vals: [76, 52, 41],
    s2Name: "Digital E-Books",
    s2Vals: [15, 29, 31],
    s3Name: "Audiobooks",
    s3Vals: [9, 19, 28],
    overallSummaryEn: "Overall, printed volumes declined markedly from their initial dominance while digital and audio borrowing gained substantial ground. Notably, audiobooks registered the steepest proportional surge, nearly matching e-books by the end of the timeline.",
  },
  {
    title: "Municipal Freshwater Losses and Reuse Recovery",
    chartTitle: "City Water Supply Allocation by Outcome (%)",
    unit: "% of supply",
    categories: ["2012", "2018", "2024"],
    subjectNoun: "treated freshwater distribution, pipe leakage, and industrial reuse",
    contextLocation: "an inland river municipality",
    s1Name: "Pipe Leakage",
    s1Vals: [28, 19, 9],
    s2Name: "Metered Homes",
    s2Vals: [58, 57, 54],
    s3Name: "Recycled Greywater",
    s3Vals: [14, 24, 37],
    overallSummaryEn: "Overall, distribution pipe leakage fell substantially following infrastructure repairs, freeing volume for recycled greywater systems. Direct household consumption changed comparatively little, hovering just above half of total supply across every interval.",
  },
  {
    title: "University Lecture Attendance Modes Across Semesters",
    chartTitle: "Undergraduate Module Engagement Format (%)",
    unit: "% of students",
    categories: ["2019", "2022", "2025"],
    subjectNoun: "weekly seminar participation across live lecture rooms, hybrid streams, and recordings",
    contextLocation: "a science faculty",
    s1Name: "On-Campus Live",
    s1Vals: [82, 34, 49],
    s2Name: "Recorded Replay",
    s2Vals: [14, 42, 33],
    s3Name: "Interactive Hybrid",
    s3Vals: [4, 24, 18],
    overallSummaryEn: "Overall, live campus attendance dropped sharply during the middle survey year before partially rebounding, yet it never regained its original overwhelming majority. Conversely, asynchronous replays and hybrid sessions retained substantial combined shares.",
  },
  {
    title: "Packaged Beverage Container Recovery Rates",
    chartTitle: "Post-Consumer Drink Packaging Disposal Path (%)",
    unit: "% by weight",
    categories: ["2015", "2020", "2025"],
    subjectNoun: "post-consumer beverage containers processed via deposit return, kerbside sorting, or landfill",
    contextLocation: "a regional waste authority",
    s1Name: "Landfill Waste",
    s1Vals: [59, 37, 18],
    s2Name: "Kerbside Recycling",
    s2Vals: [29, 34, 31],
    s3Name: "Deposit Return",
    s3Vals: [12, 29, 51],
    overallSummaryEn: "Overall, landfill disposal contracted dramatically once deposit-return machines expanded across retail sites, propelling deposit schemes into first place. Standard kerbside collection remained relatively stable throughout the observed years.",
  },
  {
    title: "Rural Clinic Telehealth Versus In-Person Visits",
    chartTitle: "Primary Care Appointments by Consultation Channel (%)",
    unit: "% of visits",
    categories: ["2018", "2021", "2024"],
    subjectNoun: "routine outpatient checkups handled face-to-face, via video call, or through nurse phone triage",
    contextLocation: "five highland health clinics",
    s1Name: "In-Clinic Visits",
    s1Vals: [84, 41, 56],
    s2Name: "Video Consults",
    s2Vals: [6, 39, 27],
    s3Name: "Phone Triage",
    s3Vals: [10, 20, 17],
    overallSummaryEn: "Overall, face-to-face examinations rebounded to represent slightly over half of visits after dipping markedly mid-period. Remote video and telephone channels settled permanently above their modest baseline proportions.",
  },
];

const REGION_COHORTS_AT1 = [
  "Northern Region",
  "Harbour District",
  "Alpine Zone",
  "Valley Network",
  "Metro Sector",
];

function buildAcademicTask1Lessons(): WritingLessonContent[] {
  const out: WritingLessonContent[] = [];

  for (let i = 0; i < 35; i++) {
    const s = AT1_SEEDS[i % AT1_SEEDS.length];
    const v = Math.floor(i / AT1_SEEDS.length);
    const id = `writ-bank-at1-${String(i + 1).padStart(3, "0")}`;
    const regionTag = REGION_COHORTS_AT1[v % REGION_COHORTS_AT1.length];
    const title = v === 0 ? s.title : `${s.title} (${regionTag})`;

    const c0 = s.categories[0];
    const c1 = s.categories[1];
    const c2 = s.categories[2];

    const band65Essay = `The bar chart compares the percentages of ${s.subjectNoun} in ${s.contextLocation} (${regionTag}) across ${c0}, ${c1}, and ${c2}.

${s.overallSummaryEn}

In ${c0}, ${s.s1Name} accounted for the biggest share at ${s.s1Vals[0]}%, while ${s.s2Name} stood at ${s.s2Vals[0]}% and ${s.s3Name} made up only ${s.s3Vals[0]}%. By ${c1}, however, ${s.s1Name} had decreased considerably to ${s.s1Vals[1]}%. Over the same span, ${s.s2Name} rose to ${s.s2Vals[1]}%, and ${s.s3Name} moved to ${s.s3Vals[1]}%.

Looking at the final year ${c2}, ${s.s1Name} reached ${s.s1Vals[2]}%, whereas ${s.s2Name} recorded ${s.s2Vals[2]}% and ${s.s3Name} accounted for ${s.s3Vals[2]}%. Consequently, the gap between the top category and the lowest category narrowed significantly compared with ${c0}, reflecting sustained structural changes across ${regionTag}.`;

    const band80Essay = `The chart illustrates how ${s.subjectNoun} evolved in ${s.contextLocation} (${regionTag}) across three benchmark years, namely ${c0}, ${c1}, and ${c2}.

${s.overallSummaryEn}

At the outset in ${c0}, ${s.s1Name} commanded a clear lead at ${s.s1Vals[0]}%, substantially outstripping ${s.s2Name} (${s.s2Vals[0]}%) and leaving ${s.s3Name} as a minor category at just ${s.s3Vals[0]}%. Five years into the timeline in ${c1}, that initial hierarchy softened notably: ${s.s1Name} contracted to ${s.s1Vals[1]}%, whereas ${s.s2Name} climbed to ${s.s2Vals[1]}% and ${s.s3Name} reached ${s.s3Vals[1]}%.

By ${c2}, the balance between competing options had been decisively reshaped across ${regionTag}. Whereas ${s.s1Name} stood at ${s.s1Vals[2]}%, ${s.s2Name} accounted for ${s.s2Vals[2]}% and ${s.s3Name} represented ${s.s3Vals[2]}%, demonstrating both sharper diversification and a lasting shift away from early-period patterns.`;

    out.push({
      id,
      track: "academic",
      taskType: "academic_task1",
      partType: "Academic Task 1 · Chart Comparison",
      title,
      subtitleVi: `Luyện bóc số liệu ${s.categories.join("–")}, viết Overview không số và so sánh tỷ lệ Band 8.0.`,
      difficultyBand: i % 2 === 0 ? "7.0" : "7.5",
      recommendedMinutes: 20,
      minWords: 150,
      ksaFocus: ["K", "S", "A"],
      promptEn: `The chart below compares ${s.subjectNoun} in ${s.contextLocation} (${regionTag}) across ${c0}, ${c1}, and ${c2}. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.`,
      visualDataSpec: {
        chartTitle: `${s.chartTitle} — ${regionTag}`,
        yAxisUnit: s.unit,
        categories: s.categories,
        series: [
          { name: s.s1Name, tone: "warn", values: s.s1Vals },
          { name: s.s2Name, tone: "accent", values: s.s2Vals },
          { name: s.s3Name, tone: "mint", values: s.s3Vals },
        ],
      },
      deconstructPrompts: {
        taskTypeTargetVi: "Academic Task 1: tóm tắt đặc điểm nổi bật và so sánh đối chiếu số liệu, không suy diễn nguyên nhân ngoài biểu đồ.",
        keyRequirementsVi: [
          "Paraphrase đối tượng và đơn vị đo ở câu mở bài.",
          "Viết đoạn 'Overall, ...' tóm tắt 2 xu hướng lớn nhất, KHÔNG chèn con số %.",
          "Gộp nhóm logic theo xu hướng tăng/giảm qua 2 đoạn Body.",
        ],
        ideaSparkQuestionsVi: [
          `Nhóm nào dẫn đầu ở mốc ${c0} và đã thay đổi mạnh nhất vào ${c2}?`,
          `Thứ tự xếp hạng giữa '${s.s1Name}' và '${s.s2Name}' thay đổi ở giai đoạn nào?`,
          `Nhóm '${s.s3Name}' biến động liên tục hay chững lại vào cuối kỳ?`,
        ],
      },
      selfAuditChecklist: [
        { id: "audit-word-150", labelVi: "Đạt tối thiểu 150 từ tiếng Anh.", ksaDimension: "S" },
        { id: "audit-overview-no-data", labelVi: "Đoạn 'Overall,' đứng riêng và hoàn toàn không chứa số liệu.", ksaDimension: "S" },
        { id: "audit-past-tense", labelVi: `Thì quá khứ nhất quán cho các mốc ${c0}–${c2}.`, ksaDimension: "K" },
        { id: "audit-comparisons", labelVi: "Có ít nhất 2 phép so sánh đối chiếu giữa các nhóm.", ksaDimension: "A" },
      ],
      modelComparison: {
        band65: {
          band: 6.5,
          essayEn: band65Essay,
          annotationsVi: [
            { criterion: "TA_TR", noteVi: "Đủ Overview và số liệu nhưng cách chuyển ý còn hơi liệt kê theo từng năm." },
            { criterion: "LR", noteVi: "Từ miêu tả xu hướng còn an toàn ('increased', 'decreased', 'biggest')." },
            { criterion: "GRA", noteVi: "Ngữ pháp chuẩn xác nhưng chưa dùng đa dạng cụm phân từ hay đảo cấu trúc so sánh." },
          ],
        },
        band80: {
          band: 8.0,
          essayEn: band80Essay,
          annotationsVi: [
            { criterion: "TA_TR", noteVi: "Overview sắc nét ('decisively shifted', 'predominant option'), zero số liệu." },
            { criterion: "LR", noteVi: "Collocation học thuật đắt giá: 'commanded a clear lead', 'outstripping', 'decisively reshaped'." },
            { criterion: "GRA", noteVi: "Kết hợp nhuần nhuyễn mệnh đề 'Whereas...', phân từ hiện tại 'leaving...' và dấu hai chấm giải thích." },
          ],
          upgradeCollocations: [
            { basicEn: "had the biggest share", upgradedEn: "commanded a clear lead / outstripped peers", usageVi: "Thay thế 'largest percentage' trong câu mở Body 1." },
            { basicEn: "fell a lot / changed completely", upgradedEn: "contracted markedly / decisively reshaped", usageVi: "Nâng Band LR miêu tả xu hướng đảo chiều." },
          ],
        },
      },
    });
  }

  return out;
}

interface GtLetterSeed {
  title: string;
  tone: "formal" | "semi_formal" | "informal";
  recipientVi: string;
  prompt: string;
  bullets: [string, string, string];
  greeting: string;
  signoff: string;
  p1Formal: string;
  p2Body: string;
  p3Close: string;
}

const GT_LETTER_SEEDS: GtLetterSeed[] = [
  {
    title: "Reporting Faulty Streetlamps Outside Commuter Station",
    tone: "formal",
    recipientVi: "Ban Quản lý Hạ tầng Đô thị (Chưa biết tên)",
    prompt: "Several overhead streetlamps outside your local commuter rail walkway have stayed unlit for two weeks. Write a formal letter to the municipal infrastructure office.",
    bullets: [
      "Identify the exact walkway location and describe the fault",
      "Explain why poor visibility creates safety hazards for commuters",
      "Request a clear repair timeline and temporary lighting",
    ],
    greeting: "Dear Sir or Madam,",
    signoff: "Yours faithfully,\nMinh Nguyen",
    p1Formal: "I am writing to formally report a recurring electrical failure affecting four overhead streetlamps along the pedestrian footbridge linking Oakridge Lane with Platform Two at Northgate Rail Station.",
    p2Body: "Since the fifth of this month, all four fixtures have remained completely dark after dusk despite nearby main roads operating normally. Because shift workers and elderly passengers cross those wet timber steps between six and nine every evening, the sudden absence of overhead illumination poses an acute tripping hazard and obstructs visibility near oncoming cycle paths. Several residents have already stumbled over uneven kerbs while carrying groceries.",
    p3Close: "Consequently, I would appreciate an urgent electrical inspection alongside temporary battery floodlights mounted along the handrail until permanent cabling is restored. Could your department confirm an expected repair date by email within three working days? Thank you for your prompt attention to this public safety matter.",
  },
  {
    title: "Requesting Flexible Shift Swap for Study Exam Day",
    tone: "semi_formal",
    recipientVi: "Quản lý trực tiếp (Đã quen biết — Semi-formal)",
    prompt: "You work part-time at a logistics reception desk and need to adjust next Thursday's afternoon shift to attend an official language examination. Write to your supervisor.",
    bullets: [
      "State the shift date and exact reason for your request",
      "Explain the handover arrangement already agreed with a colleague",
      "Confirm how you will make up any remaining hours next week",
    ],
    greeting: "Dear Ms. Carter,",
    signoff: "Yours sincerely,\nLinh Tran",
    p1Formal: "I am writing to kindly request a temporary schedule adjustment for my Thursday afternoon reception shift next week, as my external IELTS speaking and writing assessment has been confirmed for two o'clock in the city centre.",
    p2Body: "To ensure our dispatch telephone desk remains fully staffed during the afternoon peak, I have already spoken with Daniel Patel from the Tuesday rota, who is happy to cover my four-hour slot on Thursday from one to five. In exchange, I have offered to take over his Sunday morning inventory check. Both of us have reviewed this week's incoming supplier calendar together so nothing will be missed.",
    p3Close: "If you approve this swap, I will log the updated hours on the shared roster sheet before Friday noon and finish Wednesday's filing backlog ahead of schedule. Please let me know whether this arrangement suits the team's coverage plan.",
  },
  {
    title: "Inviting a Friend to Borrow Your Countryside Cabin",
    tone: "informal",
    recipientVi: "Bạn thân (Văn phong thân mật tự nhiên)",
    prompt: "A close friend has been working overtime for months and needs a quiet break. Write an informal letter offering your family's small lakeside cottage for a long weekend.",
    bullets: [
      "Say why you thought they could use a peaceful getaway",
      "Describe practical features and nearby walks at the cottage",
      "Explain how they can pick up the keys and what to bring",
    ],
    greeting: "Dear Sam,",
    signoff: "Warmly,\nHuy",
    p1Formal: "I hope this week hasn't been quite as hectic as your last project launch! Since you mentioned how exhausted you've been feeling after three straight months of weekend overtime, I wanted to offer you our little timber cottage beside Cedar Lake from Friday morning until Monday evening.",
    p2Body: "Nobody in my family is heading up there next week, so you'd have the entire porch and cedar fireplace to yourself with zero noisy traffic anywhere nearby. There's a lovely five-kilometre pine trail right behind the garden fence, plus a small bakery ten minutes down the lane that sells warm sourdough loaves every morning. The kitchen is already stocked with coffee beans and dry firewood.",
    p3Close: "I've left the brass spare key with my neighbour Mrs. Reed next door, so just text me whenever you plan to set off and I'll give her a quick heads-up. All you need to pack are walking boots and a thick jumper because nights turn brisk near the water!",
  },
  {
    title: "Formal Complaint About Repeated Parcel Delivery Misrouting",
    tone: "formal",
    recipientVi: "Phòng Chăm sóc Khách hàng Công ty Giao nhận",
    prompt: "Three consecutive work parcels addressed to your office suite were left outdoors near an adjacent warehouse. Write a formal complaint letter to the courier company.",
    bullets: [
      "Provide delivery dates and explain the repeated misrouting error",
      "Describe the inconvenience or weather damage caused",
      "State the corrective action you expect from the depot manager",
    ],
    greeting: "Dear Customer Relations Manager,",
    signoff: "Yours faithfully,\nKhai Pham",
    p1Formal: "I am writing to lodge a formal complaint regarding three consecutive commercial parcel deliveries addressed to Suite Four of our design office that were misdelivered to an unlocked loading dock behind Building Nine on the second, ninth, and sixteenth of this month.",
    p2Body: "Although each parcel clearly displayed our reception telephone extension and entry intercom code, drivers bypassed our front lobby entirely and marked items as signed by reception without obtaining a signature. During last Thursday's heavy downpour, two cardboard cartons containing architectural paper samples absorbed rainwater before our staff located them, resulting in warped reference sheets and a missed client deadline.",
    p3Close: "Accordingly, I request a full refund of the priority courier charges totalling forty-eight pounds alongside written confirmation that route drivers have updated our suite pin on their handheld scanners. Please respond with your resolution summary within five working days.",
  },
  {
    title: "Suggesting Quieter Acoustic Dividers to Apartment Committee",
    tone: "semi_formal",
    recipientVi: "Ban Quản trị Chung cư (Đã biết tên)",
    prompt: "You live in an apartment block whose shared study lounge has become too noisy for evening work. Write to the building committee proposing practical improvements.",
    bullets: [
      "Describe the acoustic problems noticed in the shared lounge",
      "Suggest two affordable solutions for residents",
      "Offer to help test or coordinate the changes",
    ],
    greeting: "Dear Mr. Brooks,",
    signoff: "Kind regards,\nThao Le",
    p1Formal: "I am writing as a third-floor resident to share a constructive suggestion regarding acoustics inside our ground-floor communal study lounge, which has become noticeably echoing during evening hours as more neighbours use it for remote calls.",
    p2Body: "Because the room currently features bare plaster walls and tiled flooring, even quiet voice conversations bounce clearly across every table, making concentrated reading difficult for students preparing for upcoming examinations. Installing two movable felt acoustic partitions alongside heavy woven curtains beside the courtyard glass would dampen mid-frequency chatter markedly at modest cost. A clear desk sign reserving two corner booths strictly for silent study would also prevent awkward friction.",
    p3Close: "Having helped set up similar study pods at my university library last year, I would be glad to gather supplier quotes and volunteer on a Saturday morning to assemble the dividers. I look forward to hearing the committee's thoughts.",
  },
];

const GT_COHORTS = ["Cycle 1", "Cycle 2", "Cycle 3", "Cycle 4", "Cycle 5", "Cycle 6", "Cycle 7"];

function buildGtLetterLessons(): WritingLessonContent[] {
  const out: WritingLessonContent[] = [];

  for (let i = 0; i < 35; i++) {
    const s = GT_LETTER_SEEDS[i % GT_LETTER_SEEDS.length];
    const v = Math.floor(i / GT_LETTER_SEEDS.length);
    const id = `writ-bank-gt1-${String(i + 1).padStart(3, "0")}`;
    const title = v === 0 ? s.title : `${s.title} (${GT_COHORTS[v % GT_COHORTS.length]})`;

    const band65Letter = `${s.greeting}

${s.p1Formal}

${s.p2Body}

${s.p3Close} I remain grateful for your assistance and look forward to a prompt update once these practical steps are reviewed.

${s.signoff}`;

    const band80Letter = `${s.greeting}

${s.p1Formal} As a regular user affected directly by this situation, I felt it necessary to outline the practical details promptly.

${s.p2Body} Beyond the immediate disruption described above, resolving this issue promptly would restore predictable reliability for everyone sharing the facility each week.

${s.p3Close} I appreciate your time and cooperation in addressing every point raised here efficiently.

${s.signoff}`;

    out.push({
      id,
      track: "general",
      taskType: "gt_task1_letter",
      partType: "GT Task 1 · Letter Writing",
      title,
      subtitleVi: `(${s.recipientVi}) Luyện đủ 3 gạch đầu dòng và kiểm soát văn phong ${s.tone === "formal" ? "Trang trọng (0 viết tắt)" : s.tone === "semi_formal" ? "Bán trang trọng" : "Thân mật"}.`,
      difficultyBand: i % 2 === 0 ? "6.5" : "7.0",
      recommendedMinutes: 20,
      minWords: 150,
      ksaFocus: ["K", "S", "A"],
      promptEn: `${s.prompt}\nWrite a letter covering the three bullet points below. Write at least 150 words.`,
      letterTone: s.tone,
      threeBullets: s.bullets,
      deconstructPrompts: {
        taskTypeTargetVi: `General Training Task 1 (${s.recipientVi}): trả lời trọn vẹn cả 3 bullet points và giữ đồng nhất văn phong ${s.tone}.`,
        keyRequirementsVi: [
          `Mở thư đúng ngữ điệu ('${s.greeting}') và kết thư đúng chuẩn ('${s.signoff.split("\n")[0]}').`,
          "Mỗi bullet point nên thành một đoạn hoặc cụm ý rõ ràng để không bị sót Task Achievement.",
          s.tone === "formal"
            ? "Văn phong Formal tuyệt đối KHÔNG dùng viết tắt (don't, I'm, can't...)."
            : "Giữ ngữ điệu tự nhiên, tôn trọng đúng mức độ thân quen với người nhận.",
        ],
        ideaSparkQuestionsVi: [
          `Bullet 1: ${s.bullets[0]}`,
          `Bullet 2: ${s.bullets[1]}`,
          `Bullet 3: ${s.bullets[2]}`,
        ],
      },
      selfAuditChecklist: [
        { id: "audit-word-150", labelVi: "Đạt tối thiểu 150 từ tiếng Anh.", ksaDimension: "S" },
        { id: "audit-all-3-bullets", labelVi: "Đã phủ đủ và tách rõ cả 3 gạch đầu dòng đề bài.", ksaDimension: "S" },
        { id: "audit-tone-consistency", labelVi: s.tone === "formal" ? "Không dính từ viết tắt (don't/I'm) trong thư Formal." : "Giọng văn tự nhiên, nhất quán từ mở đến kết thư.", ksaDimension: "K" },
        { id: "audit-purpose-first", labelVi: "Câu đầu tiên nêu ngay mục đích viết thư thay vì chào hỏi dài dòng.", ksaDimension: "A" },
      ],
      modelComparison: {
        band65: {
          band: 6.5,
          essayEn: band65Letter,
          annotationsVi: [
            { criterion: "TA_TR", noteVi: "Đủ 3 bullet points rõ ràng nhưng câu chuyển đoạn hơi đơn giản." },
            { criterion: "LR", noteVi: "Dùng đúng ngữ điệu cơ bản, thiếu vài từ nối nguyên nhân–hệ quả tự nhiên." },
            { criterion: "GRA", noteVi: "Câu đúng ngữ pháp nhưng nhịp câu khá đều." },
          ],
        },
        band80: {
          band: 8.0,
          essayEn: band80Letter,
          annotationsVi: [
            { criterion: "TA_TR", noteVi: "Phủ trọn 3 bullet points với chi tiết thực tế thuyết phục, giữ chuẩn văn phong 100%." },
            { criterion: "LR", noteVi: "Từ vựng chuẩn xác ngữ cảnh ('acute hazard', 'prompt attention', 'practical details')." },
            { criterion: "GRA", noteVi: "Kết hợp câu phức điều kiện, cụm phân từ và cấu trúc đề nghị lịch sự mượt mà." },
          ],
          upgradeCollocations: [
            { basicEn: "please fix this fast", upgradedEn: "I would appreciate an urgent inspection / prompt attention", usageVi: "Đề nghị hành động lịch sự nhưng dứt khoát trong thư Formal/Semi-formal." },
            { basicEn: "very dangerous for people", upgradedEn: "poses an acute tripping / safety hazard", usageVi: "Diễn đạt mức độ nghiêm trọng thuyết phục giám khảo." },
          ],
        },
      },
    });
  }

  return out;
}

interface Task2Seed {
  title: string;
  questionType: string;
  promptEn: string;
  thesisNoteVi: string;
  b65Body: string;
  b80Body: string;
  colloc1: [string, string, string];
  colloc2: [string, string, string];
}

const TASK2_SEEDS: Task2Seed[] = [
  {
    title: "Free Public Transit Versus Expanding Suburban Highways",
    questionType: "Discussion + Opinion",
    promptEn: "Some planners argue that cities should make buses and trains free for all residents to cut congestion, whereas others maintain that expanding road capacity matters more. Discuss both views and give your own opinion.",
    thesisNoteVi: "Cân bằng cả 2 luồng quan điểm trong 2 đoạn Body trước khi khẳng định quan điểm ưu tiên vận tải công cộng gắn độ đúng giờ.",
    b65Body: `On the one hand, widening arterial roads and adding suburban bypasses can temporarily relieve bottlenecks for commercial delivery vans and tradespeople hauling heavy equipment that cannot fit onto commuter trains. When industrial estates sit far outside ring roads, smooth highway freight links lower shop supply costs.

On the other hand, decades of urban transport studies show that new highway lanes rapidly fill up with extra private cars—a cycle known as induced demand. By contrast, making public rail and express buses affordable or zero-fare encourages daily commuters to leave cars at home, provided service frequency remains reliable during peak hours. In fact, several European municipalities saw measurable drops in inner-city nitrogen emissions once tram fares were reduced alongside dedicated bus lanes.

In my view, abolishing or heavily discounting transit fares while reallocating kerb space toward express bus corridors delivers far greater long-term relief than paving fresh lanes.`,
    b80Body: `Proponents of highway expansion reasonably emphasize that commercial freight vehicles and tradespeople carrying bulky equipment cannot practically rely on commuter rail lines. Where outer logistics parks sit poorly connected to city ring networks, widening bottlenecked junctions trims delivery delays and curbs wholesale retail costs.

Nevertheless, evidence across fast-growing metropolitan corridors demonstrates that additional tarmac rarely cures passenger congestion for long, since smoother lanes swiftly entice more motorists onto the road through induced demand. Conversely, eliminating or heavily subsidising transit fares removes financial friction for routine commuters, shifting high volumes of single-occupancy cars into shared carriages. Crucially, however, fare cuts alone falter if trains remain overcrowded or late; investing saved highway capital into reliable five-minute headways multiplies mode switching dramatically, as witnessed in coastal towns pairing modest fares with strict priority signals.

On balance, while freight corridors require targeted maintenance, prioritising zero-fare or deeply subsidised public transit anchored by dependable service frequencies offers a markedly more durable remedy for urban gridlock.`,
    colloc1: ["more roads cause more cars", "additional tarmac induces fresh motoring demand", "Khái niệm giao thông đô thị chuẩn Band 8.0."],
    colloc2: ["buses come on time often", "dependable service frequencies / priority corridors", "Cụm từ chuyên ngành quy hoạch mạch lạc."],
  },
  {
    title: "Practical Home Maintenance Courses in Secondary Schools",
    questionType: "Agree / Disagree",
    promptEn: "Secondary schools spend too much time on abstract theory and should make practical life skills—such as budgeting, cooking, and household repairs—compulsory for every teenager. To what extent do you agree or disagree?",
    thesisNoteVi: "Thể hiện quan điểm rõ ràng (Partly Agree): bảo vệ nền tảng khoa học cốt lõi nhưng bổ sung mô-đun kỹ năng ứng dụng thực tế.",
    b65Body: `To begin with, core academic subjects such as mathematics, literacy, and natural sciences equip teenagers with analytical reasoning that cannot be improvised later without guided classroom practice. Understanding percentages, compound interest, and reading comprehension forms the necessary base before young adults can compare mortgage contracts or evaluate health claims online.

At the same time, dedicating one weekly double period to practical living skills—covering basic nutritious meal preparation, monthly cashflow spreadsheets, and simple electrical plug safety—bridges an obvious gap left when busy parents commute long hours. Students who practise reading utility bills or repairing loose door hinges gain genuine independence before moving away for college or apprenticeships.

Therefore, while academic rigour must remain central, weaving structured practical workshops into upper-secondary timetables creates more resilient and self-reliant graduates.`,
    b80Body: `Admittedly, stripping away rigorous theoretical subjects would undermine the analytical foundations adolescents rely upon across university study and modern technical trades. Mastery of core numeracy, critical reading, and scientific method is scarcely redundant; rather, grasping compound interest or experimental evidence equips teenagers to spot predatory loan agreements and misleading nutrition claims throughout adulthood.

That said, treating classrooms purely as exam preparation halls leaves many school-leavers surprisingly unprepared for everyday self-management once they rent their first flat. Integrating one dedicated weekly studio covering low-cost balanced cooking, household budgeting, and basic home repairs transforms abstract arithmetic into concrete confidence. Rather than crowding out academic priorities, well-designed practical modules reinforce them directly: weighing seasonal grocery ratios applies proportional reasoning, while wiring a lamp plug illustrates electrical circuits tangibly.

Consequently, I partly agree with the proposition: schools should preserve demanding intellectual standards while embedding compulsory hands-on workshops that translate classroom knowledge into durable adult competence.`,
    colloc1: ["helps teenagers handle daily adult life", "equips school-leavers for everyday self-management", "Từ vựng chính xác thay cho 'good for life'."],
    colloc2: ["makes hard subjects feel useful", "translates abstract knowledge into tangible competence", "Cụm đối xứng 'abstract vs tangible' giàu sức thuyết phục."],
  },
  {
    title: "Preventing Rural Youth Out-Migration to Coastal Megacities",
    questionType: "Causes & Solutions",
    promptEn: "In many countries, young professionals are leaving small agricultural towns to work in coastal megacities, leaving rural communities with ageing populations. What are the main causes of this trend, and what measures can reverse it?",
    thesisNoteVi: "Phân tích rõ 2 nguyên nhân (thu nhập + dịch vụ y tế/văn hóa) ở Body 1 và 2 giải pháp đồng bộ ở Body 2.",
    b65Body: `The primary driver behind youth migration is the wide gap in starting salaries and specialised career ladders between provincial towns and sprawling coastal hubs. Even energetic graduates willing to stay close to extended family often discover few roles matching university degrees outside seasonal retail or primary farming. Compounding this economic pull, thin evening bus routes, slower fibre internet, and fewer specialist medical clinics make rural towns appear restrictive to young couples raising children.

Reversing this hollowing-out requires coordinated investment rather than emotional appeals to stay. First, provincial governments can extend high-speed optical fibre and subsidise shared coworking studios inside restored railway stations so remote engineers and designers earn metropolitan wages without leaving home towns. Second, upgrading regional technical colleges and community hospitals directly improves everyday livability for multi-generational households.

In summary, narrow job markets and scarce civic infrastructure push young adults away, yet pairing digital remote infrastructure with stronger local public services can restore balanced regional vitality.`,
    b80Body: `Two structural imbalances largely explain why ambitious young adults gravitate toward coastal megacities. Economically, provincial labour markets frequently offer narrow occupational ladders skewed heavily toward low-margin retail or seasonal agriculture, forcing technically trained graduates to relocate simply to find roles suited to their qualifications. Socially, sparse evening transit, sluggish broadband, and distant specialist hospitals compound the sense that remaining in a small town entails forfeiting lifelong mobility and cultural stimulation.

Addressing this demographic drain demands tangible economic and civic incentives rather than nostalgic rhetoric. To begin with, national authorities can accelerate universal fibre-optic deployment alongside low-rent regional innovation hubs converted from underused civic buildings, enabling software analysts, accountants, and remote consultants to draw metropolitan salaries while preserving family roots locally. Equally vital, strengthening accredited provincial polytechnics and co-located maternity clinics removes the practical anxieties deterring young parents from settling outside capital cities.

Ultimately, stemming rural depopulation hinges upon bridging both digital employment access and essential local healthcare simultaneously.`,
    colloc1: ["few good jobs in small towns", "narrow occupational ladders skewed toward seasonal work", "Diễn đạt sâu sắc về thị trường lao động."],
    colloc2: ["stops young people from leaving", "stems demographic drain / retains multi-generational vitality", "Collocation chuẩn Band 8.0 cho chủ đề đô thị hóa."],
  },
  {
    title: "Packaging Reduction Responsibility: Regulators Versus Shoppers",
    questionType: "Discussion + Opinion",
    promptEn: "Some citizens believe individual shoppers should reduce plastic waste by refusing over-packaged goods, while others contend that governments and corporations hold primary responsibility. Discuss both views and give your own opinion.",
    thesisNoteVi: "Đối chiếu sức mua cá nhân (Body 1) với đòn bẩy luật chuẩn hóa từ trên xuống (Body 2), chốt nghiêng về quy định bắt buộc kèm lựa chọn hợp túi tiền.",
    b65Body: `Supporters of consumer-led change argue that everyday purchasing choices send immediate price signals across supermarket aisles. When shoppers carry reusable cloth totes, select loose produce over shrink-wrapped trays, and favour refill stations, retail buyers notice shifting shelf demand and trim wasteful stock lines voluntarily. Consumer boycotts have indeed pushed several beverage chains to replace disposable lids rapidly.

On the other hand, relying mainly on individual willpower places an unfair burden on time-pressed working families, particularly when loose organic goods cost considerably more than sealed multipacks. Only strict government rules—such as Extended Producer Responsibility taxes and standardised deposit-return bottles—compel global manufacturers to redesign lightweight packaging at the factory gate before waste ever reaches checkout lanes.

In my view, while thoughtful personal habits cultivate environmental awareness, binding corporate packaging mandates yield vastly faster and fairer reductions across whole supply chains.`,
    b80Body: `Advocates of individual consumer responsibility rightly observe that cumulative everyday choices alter retail incentives visibly. Whenever significant numbers of households carry refillable jars, spurn double-wrapped snacks, and support zero-waste grocers, supermarket procurement teams swiftly adjust shelf contracts to avoid unsold inventory. Moreover, visible grassroots habits normalize thrift and waste consciousness across younger generations.

Nevertheless, expecting busy shoppers to police complex industrial supply chains at the checkout lane remains structurally inequitable. Low-income workers juggling long shifts rarely possess the spare time or disposable budget to seek unpackaged specialty outlets when discount chains wrap single vegetables in cheap polymer film. Consequently, binding legislation—most notably Extended Producer Responsibility fees tied directly to packaging recyclability and mandatory deposit-return systems—strikes upstream at the manufacturing source, transforming sustainable design from an optional niche premium into the universal commercial baseline.

All things considered, while conscious consumer habits remain praiseworthy, statutory corporate mandates represent the decisive lever required to curb packaging waste at national scale.`,
    colloc1: ["people buying things carefully", "cumulative everyday purchasing choices", "Phát triển câu chủ đề sắc nét."],
    colloc2: ["laws force companies to change", "binding legislation strikes upstream at the manufacturing source", "Hình ảnh hóa cơ chế chính sách rất chuẩn xác."],
  },
  {
    title: "Evaluating Digital Medical Consultations for Non-Urgent Care",
    questionType: "Advantages & Disadvantages",
    promptEn: "An increasing number of routine medical checkups are now conducted via video calls instead of face-to-face clinic appointments. Do the advantages of this development outweigh the disadvantages?",
    thesisNoteVi: "Phân tích cả lợi ích (giảm lây chéo + tiếp cận vùng xa) lẫn rủi ro (bỏ sót dấu hiệu lâm sàng + rào cản người cao tuổi), chốt ưu thế vượt trội khi kết hợp đúng ngưỡng.",
    b65Body: `Video consultations bring unmistakable practical advantages for patients managing routine prescription renewals or living in remote agricultural districts miles away from specialist clinics. Cutting two-hour bus journeys down to a focused fifteen-minute home call saves lost workday wages while sparing frail elderly visitors exposure to crowded waiting-room viruses during winter flu peaks.

Conversely, remote screens carry genuine clinical drawbacks whenever physical examination is indispensable. A camera lens cannot palpate abdominal tenderness, listen clearly for subtle lung wheezes, or pick up non-verbal distress signals hidden off-screen. Furthermore, elderly patients lacking reliable broadband or smartphone literacy risk slipping quietly through administrative cracks if clinics abolish walk-in booking windows altogether.

Overall, provided health services deploy video calls selectively for follow-ups while retaining swift in-person triage for fresh physical symptoms, the conveniences clearly outweigh the limitations.`,
    b80Body: `Remote video consultations deliver compelling efficiency gains across both rural geographies and congested city clinics. Eliminating arduous commuter journeys for straightforward medication reviews or blood-test debriefs preserves vital working hours for caregivers while insulating recovering outpatients from infectious waiting-room cross-contamination. Equally important, specialist physicians stationed at central teaching hospitals can supervise diagnostic clinics in isolated island villages within minutes rather than months.

Nonetheless, over-reliance on screen-mediated care introduces tangible clinical and equity hazards. Digital cameras cannot replace hands-on palpation, accurate lung auscultation, or subtle visual cues such as faint skin pallor distorted by poor home lighting. Compounding this diagnostic blind spot, mandatory portal check-ins risk alienating elderly citizens or low-income households without stable fibre connections, inadvertently widening preventive health inequalities.

On balance, the benefits decidedly outweigh the drawbacks so long as health authorities treat telehealth as an agile triage and follow-up complement rather than an indiscriminate replacement for physical examination rooms.`,
    colloc1: ["save patients from travel time", "insulates outpatients from waiting-room cross-contamination", "Từ vựng y tế công cộng chính xác tuyệt đối."],
    colloc2: ["doctors still need to touch and check", "hands-on palpation and accurate auscultation", "Thể hiện vốn từ chuyên sâu ngữ cảnh y khoa."],
  },
];

const TASK2_LENSES = [
  "National Context",
  "Comparative Policy",
  "Economic Framing",
  "Social Impact",
  "Long-Term Strategy",
  "Urban Case",
  "Global Perspective",
];

function buildTask2Lessons(): WritingLessonContent[] {
  const out: WritingLessonContent[] = [];

  for (let i = 0; i < 35; i++) {
    const s = TASK2_SEEDS[i % TASK2_SEEDS.length];
    const v = Math.floor(i / TASK2_SEEDS.length);
    const id = `writ-bank-t2-${String(i + 1).padStart(3, "0")}`;
    const title = v === 0 ? s.title : `${s.title} · ${TASK2_LENSES[v % TASK2_LENSES.length]}`;

    const lensLabel = TASK2_LENSES[v % TASK2_LENSES.length].toLowerCase();
    const intro65 = `In recent years, public debate surrounding ${s.title.toLowerCase()} from a ${lensLabel} angle has intensified steadily across many modern societies as municipal budgets and household expectations continue to evolve rapidly. Before determining the most effective long-term policy path for families and public agencies alike, it is essential to weigh both sides carefully using concrete everyday examples rather than broad assumptions.`;
    const intro80 = `Across contemporary civic debates viewed through a ${lensLabel} lens, few practical issues provoke sharper scrutiny than ${s.title.toLowerCase()}, given how directly administrative trade-offs touch household budgets and daily routines. Although competing commentators stress distinct immediate priorities, examining underlying institutional and behavioural incentives on both sides clarifies where durable, equitable reform genuinely belongs.`;

    const closing65 = `To bring these arguments together for local decision-makers, short-term fixes rarely reshape long-standing daily habits whenever practical economic incentives pull ordinary citizens in the opposite direction. Only when authorities pair clear, consistent everyday regulations with accessible, affordable public alternatives can busy working households sustain steady progress without carrying unfair financial or time burdens across diverse regional communities over the coming decade.`;
    const closing80 = `Viewed from a practical implementation standpoint across ${lensLabel} settings, enduring public progress seldom stems from isolated policy slogans or temporary one-off pilot subsidies alone. Instead, durable outcomes depend on coupling transparent, measurable statutory benchmarks with seamless everyday reliability so that both ordinary residents and institutional operators face well-aligned long-term incentives across changing economic cycles.`;

    const band65Essay = `${intro65}\n\n${s.b65Body}\n\n${closing65}`;
    const band80Essay = `${intro80}\n\n${s.b80Body}\n\n${closing80}`;

    out.push({
      id,
      track: "shared",
      taskType: "task2_essay",
      partType: `Task 2 · ${s.questionType}`,
      title,
      subtitleVi: `Dạng ${s.questionType}: viết tối thiểu 250 từ, giữ vững luận điểm PEEL (Point → Explain → Example → Link) và tránh lạc đề.`,
      difficultyBand: i % 2 === 0 ? "7.0" : "7.5",
      recommendedMinutes: 40,
      minWords: 250,
      ksaFocus: ["K", "S", "A"],
      promptEn: `${s.promptEn} Write at least 250 words.`,
      deconstructPrompts: {
        taskTypeTargetVi: `${s.questionType}: ${s.thesisNoteVi}`,
        keyRequirementsVi: [
          "Đoạn mở bài paraphrase đề + nêu lập trường (Thesis) nhất quán từ đầu tới kết bài.",
          "Hai đoạn Body phát triển luận điểm rõ bằng câu chủ đề (Topic Sentence) và giải thích nhân quả sâu, không liệt kê gạch ý rời rạc.",
          "Đoạn kết bài tổng hợp lại lập trường, tuyệt đối không mở thêm ý tưởng mới.",
        ],
        ideaSparkQuestionsVi: [
          "Đối tượng chịu tác động trực tiếp nhất của chính sách này trong ngắn hạn là ai?",
          "Có phản ví dụ hoặc điều kiện ngoại lệ nào chứng minh giải pháp còn hạn chế?",
          "Ví dụ thực tiễn nào ở đô thị hoặc trường học giúp lập luận đỡ chung chung?",
        ],
      },
      selfAuditChecklist: [
        { id: "audit-t2-word-250", labelVi: "Đạt tối thiểu 250 từ (mục tiêu lý tưởng 270–310 từ).", ksaDimension: "S" },
        { id: "audit-t2-both-views", labelVi: "Giải quyết trọn vẹn mọi vế câu hỏi đề bài không bỏ sót vế nào.", ksaDimension: "S" },
        { id: "audit-t2-4paras", labelVi: "Bố cục 4 đoạn tách bạch: Intro → Body 1 → Body 2 → Conclusion.", ksaDimension: "K" },
        { id: "audit-t2-hedging", labelVi: "Tránh khẳng định cực đoan ('all/always/never'); dùng ngôn ngữ rào chắn ('frequently/tends to').", ksaDimension: "A" },
      ],
      modelComparison: {
        band65: {
          band: 6.5,
          essayEn: band65Essay,
          annotationsVi: [
            { criterion: "TA_TR", noteVi: "Trả lời đủ các vế yêu cầu nhưng phần chuyển lập luận còn hơi trực diện." },
            { criterion: "CC", noteVi: "Dùng liên từ quen thuộc ('On the one hand', 'Conversely', 'In my view')." },
            { criterion: "LR", noteVi: "Diễn đạt rõ ràng song từ vựng phân tích chưa thật sắc nét ở mức học thuật cao." },
          ],
        },
        band80: {
          band: 8.0,
          essayEn: band80Essay,
          annotationsVi: [
            { criterion: "TA_TR", noteVi: "Phân tích hai mặt có chiều sâu cơ chế ('induced demand', 'structural equities'), lập trường nhất quán từ đầu tới cuối." },
            { criterion: "CC", noteVi: "Liên kết ý tự nhiên bằng chuỗi logic quy nạp và từ chuyển ngữ nghĩa ('Nevertheless', 'Compounding this')." },
            { criterion: "LR", noteVi: "Dùng collocation chuyên ngành chuẩn xác không gượng ép, giữ nhịp câu đa dạng." },
          ],
          upgradeCollocations: [
            { basicEn: s.colloc1[0], upgradedEn: s.colloc1[1], usageVi: s.colloc1[2] },
            { basicEn: s.colloc2[0], upgradedEn: s.colloc2[1], usageVi: s.colloc2[2] },
          ],
        },
      },
    });
  }

  return out;
}

export const WRITING_LOCAL_BANK: WritingLessonContent[] = [
  ...buildAcademicTask1Lessons(),
  ...buildGtLetterLessons(),
  ...buildTask2Lessons(),
];
