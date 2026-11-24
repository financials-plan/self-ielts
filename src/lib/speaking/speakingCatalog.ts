import type { SpeakingLessonContent } from "./speakingEngine";
import { SPEAKING_LOCAL_BANK } from "./speakingLocalBank";

export const SPEAKING_LESSONS_CATALOG: SpeakingLessonContent[] = [
  // ==========================================================
  // PART 1: PERSONAL & EVERYDAY (A.R.E Framework)
  // ==========================================================
  {
    id: "speak-p1-daily-rhythm",
    track: "shared",
    partNumber: 1,
    partType: "Part 1 · Interview & Everyday Topics",
    title: "Morning Routines, Cycling & Quiet Neighbourhoods",
    subtitleVi:
      "Luyện trả lời Part 1 tự nhiên theo khung A.R.E (Answer → Reason → Example), bỏ thói quen trả lời cụt hoặc 'um, uh'.",
    difficultyBand: "7.0",
    ksaFocus: ["K", "S", "A"],
    shadowingLines: [
      {
        id: "sh-p1-1",
        speaker: "Examiner Model (UK)",
        accent: "en-GB",
        rawText:
          "Actually, I'm quite keen on cycling along the canal mainly because it helps me unwind after work.",
        stressMarkedText:
          "ACTUALLY, / I'm quite KEEN on CYCLING / along the caNAL / MAINLY beCAUSE it helps me unWIND / after WORK.",
        ipaChunkNoteVi:
          "Nhấn mạnh 'ACTUALLY' và 'unWIND'; giữ nối âm 'keen_on', 'helps me' mượt.",
      },
      {
        id: "sh-p1-2",
        speaker: "Examiner Model (AU)",
        accent: "en-AU",
        rawText:
          "For instance, I usually set off around six-thirty before traffic builds up near the main junction.",
        stressMarkedText:
          "For INstance, / I USUALLY set OFF / around SIX-THIRTY / beFORE TRAFFIC builds UP / near the MAIN JUNCtion.",
        ipaChunkNoteVi:
          "Bật rõ âm cuối /t/ ở 'set_off' và đọc gọn cụm thời gian 'six-thirty'.",
      },
      {
        id: "sh-p1-3",
        speaker: "Examiner Model (UK)",
        accent: "en-GB",
        rawText:
          "To be honest, mornings feel rather rushed on Mondays, yet a quick black coffee keeps me focused.",
        stressMarkedText:
          "To be HONest, / MORNings feel RAther RUSHED / on MONdays, / YET a quick black COFfee / keeps me FOcused.",
        ipaChunkNoteVi:
          "Ngắt nhịp nhẹ sau 'HONest' và 'MONdays' để tránh đọc đều một tông (monotone).",
      },
    ],
    prompts: [
      {
        id: "sp-p1-q1",
        partNumber: 1,
        promptEn:
          "Do you prefer starting your mornings slowly or getting straight into work?",
        prepSeconds: 10,
        speakSeconds: 45,
        frameworkTag: "A.R.E",
        rescuePromptsVi: [
          "To be completely honest, I lean toward [Answer] primarily because...",
          "For instance, on a typical weekday I usually...",
          "Nếu bí từ miêu tả thói quen: hãy diễn giải vòng bằng hành động ('grab a quick tea and check my tasks').",
        ],
        modelBand80En:
          "To be honest, I prefer ease-in mornings rather than diving straight into emails, mainly because twenty quiet minutes helps me prioritise properly. For instance, I brew coffee without checking my phone before starting deep work at eight.",
        upgradePhrases: [
          {
            basicEn: "I like relaxing after work",
            naturalEn: "it helps me unwind after a hectic shift",
            noteVi: "Dùng động từ 'unwind' tự nhiên hơn 'relax' rất nhiều ở Band 7.5+.",
          },
          {
            basicEn: "usually on Monday",
            naturalEn: "on a typical weekday morning",
            noteVi: "Cụm mở đầu ví dụ (E) mượt mà trong Part 1.",
          },
        ],
      },
      {
        id: "sp-p1-q2",
        partNumber: 1,
        promptEn:
          "Is the neighbourhood you live in mostly quiet or lively?",
        prepSeconds: 10,
        speakSeconds: 45,
        frameworkTag: "A.R.E",
        rescuePromptsVi: [
          "On the whole, I'd say it's a mix of both—quiet in the evenings yet...",
          "A good example of that is...",
        ],
        modelBand80En:
          "Actually, it strikes a nice balance between peaceful and lively. During weekdays it's remarkably calm since there's little through-traffic, though on Sunday mornings the corner market gets buzzing with families.",
        upgradePhrases: [
          {
            basicEn: "has both quiet and noisy parts",
            naturalEn: "strikes a nice balance between peaceful and lively",
            noteVi: "Collocation đắt giá cho câu hỏi miêu tả địa điểm Part 1.",
          },
        ],
      },
    ],
  },

  // ==========================================================
  // PART 2: CUE CARD 60s SCRATCHPAD + 2-MIN PACING
  // ==========================================================
  {
    id: "speak-p2-cuecard-skill",
    track: "shared",
    partNumber: 2,
    partType: "Part 2 · Individual Long Turn Cue Card",
    title: "Practical Skill Learned Outside Formal Schooling",
    subtitleVi:
      "Luyện 60 giây ghi từ khóa Cue Card + thanh chia 3 vùng nói 2 phút (PPF: Past Context → Core Experience → Reflection).",
    difficultyBand: "7.5",
    ksaFocus: ["K", "S", "A"],
    shadowingLines: [
      {
        id: "sh-p2-1",
        speaker: "Examiner Model (UK)",
        accent: "en-GB",
        rawText:
          "I'd like to talk about learning basic bicycle repair, which I picked up completely outside school two summers ago.",
        stressMarkedText:
          "I'd LIKE to talk aBOUT / learning BAsic BIcycle rePAIR, / which I PICKED UP / comPLETEly outSIDE SCHOOL / two SUMmers aGO.",
        ipaChunkNoteVi:
          "Lên giọng nhẹ ở mệnh đề chính rồi hạ nhịp mượt vào mệnh đề quan hệ 'which I picked up'.",
      },
      {
        id: "sh-p2-2",
        speaker: "Examiner Model (AU)",
        accent: "en-AU",
        rawText:
          "Looking back, what struck me most wasn't the technical jargon, but how patient the workshop mentor remained.",
        stressMarkedText:
          "LOOKing BACK, / what STRUCK me MOST / WASn't the TECHnical JARgon, / but how PAtient the WORKshop MENtor reMAINED.",
        ipaChunkNoteVi:
          "Câu chuyển sang vùng số 3 (Reflection) tạo chiều sâu mạch lạc ở phút 1:30–2:00.",
      },
    ],
    prompts: [
      {
        id: "sp-p2-cue1",
        partNumber: 2,
        promptEn:
          "Describe a practical skill you learned outside school or university.",
        bulletPointsEn: [
          "What the skill was and when you learned it",
          "Who or what helped you learn it",
          "What challenge you faced at the start",
          "And explain why this skill remains useful to you today",
        ],
        prepSeconds: 60,
        speakSeconds: 120,
        frameworkTag: "PPF (Past-Present-Future)",
        rescuePromptsVi: [
          "0–30s (Bối cảnh): 'I'd like to talk about..., which I picked up back in...'",
          "30–90s (Câu chuyện chính): 'At first it felt quite daunting because...; however, after practising...'",
          "90–120s (Cảm nhận & Tương lai): 'Looking back, the biggest takeaway is... / Going forward, I plan to...'",
          "Nếu hụt hơi ở 1:20: mở rộng thêm cảm xúc ('What surprised me most was...') hoặc so sánh trước–sau!",
        ],
        modelBand80En:
          "I'd like to talk about learning basic bicycle maintenance, a practical skill I picked up two summers ago completely outside formal schooling. After snapping a chain miles from home, I joined a weekend community bike-kitchen led by a retired mechanic named Mr. Tan. At first, tuning rear gears felt intimidating because tiny adjustments threw off the alignment; however, watching him demonstrate twice made the logic click. Looking back, what makes this skill genuinely rewarding today isn't just saving repair fees—it gave me calm confidence whenever small mechanical faults pop up.",
        upgradePhrases: [
          {
            basicEn: "I learned it by myself outside school",
            naturalEn: "a skill I picked up completely outside formal schooling",
            noteVi: "'pick up a skill' tự nhiên hơn 'learn a skill' trong ngữ cảnh đời sống.",
          },
          {
            basicEn: "the most important lesson for me",
            naturalEn: "the biggest takeaway for me today",
            noteVi: "Dùng để kết bài Part 2 ở 30 giây cuối.",
          },
        ],
      },
    ],
  },

  // ==========================================================
  // PART 3: ABSTRACT TWO-WAY DISCUSSION (P.E.E.C Framework)
  // ==========================================================
  {
    id: "speak-p3-automation-society",
    track: "shared",
    partNumber: 3,
    partType: "Part 3 · Abstract Discussion",
    title: "Workplace Automation & Lifelong Retraining",
    subtitleVi:
      "Luyện Part 3 theo khung P.E.E.C (Point → Explain → Example → Counter-balance) kèm cụm câu giờ tự nhiên tránh ậm ừ.",
    difficultyBand: "8.0",
    ksaFocus: ["K", "S", "A"],
    shadowingLines: [
      {
        id: "sh-p3-1",
        speaker: "Examiner Model (UK)",
        accent: "en-GB",
        rawText:
          "That's a multifaceted question; broadly speaking, automation eliminates repetitive tasks rather than entire professions.",
        stressMarkedText:
          "That's a multiFAceted QUEStion; / BROADly SPEAKing, / autoMAtion eLIminates rePEtitive TASKS / RAther than enTIRE proFESsions.",
        ipaChunkNoteVi:
          "Cụm câu giờ tự nhiên giúp não kịp sắp xếp 2 ý P.E.E.C trước khi trả lời chính.",
      },
      {
        id: "sh-p3-2",
        speaker: "Examiner Model (US)",
        accent: "en-US",
        rawText:
          "That said, mid-career workers still need accessible retraining grants so technological shifts do not widen inequality.",
        stressMarkedText:
          "THAT SAID, / mid-caREER WORKers / still NEED acCESsible reTRAINing GRANTS / so shifts don't WIDen ineQUALity.",
        ipaChunkNoteVi:
          "Cụm chuyển 'THAT SAID' mở ra vế phản biện (Counter-balance) — đặc trưng Band 8.0 Part 3.",
      },
    ],
    prompts: [
      {
        id: "sp-p3-q1",
        partNumber: 3,
        promptEn:
          "Do you think automation makes people's work more fulfilling, or does it mostly create anxiety about job security?",
        prepSeconds: 15,
        speakSeconds: 60,
        frameworkTag: "P.E.E.C",
        rescuePromptsVi: [
          "Buying-time (Mở đầu): 'That's an intriguing question—off the top of my head, I'd say it largely depends on...'",
          "Explain + Example: 'Take administrative staff, for instance: when software handles invoices...'",
          "Counter-balance: 'That said, without clear retraining support, older employees may feel...'",
        ],
        modelBand80En:
          "That's a multifaceted question—broadly speaking, automation makes roles more fulfilling when it removes tedious data entry, freeing staff for client judgment. Take hospital coordinators, for instance: automated scheduling cuts paperwork so they can focus on patient care. That said, without funded mid-career retraining, rapid automation inevitably fuels anxiety among workers in routine roles.",
        upgradePhrases: [
          {
            basicEn: "Let me think, it is hard to say yes or no",
            naturalEn: "That's a multifaceted question—broadly speaking, it depends on...",
            noteVi: "Câu giờ tự nhiên đạt chuẩn Fluency Band 8.0, thay thế hoàn toàn 'um, uh'.",
          },
          {
            basicEn: "on the other hand, there is a problem",
            naturalEn: "That said, without funded retraining...",
            noteVi: "Cụm phản biện tự nhiên trong văn nói (hiệu quả hơn 'On the other hand' sách vở).",
          },
        ],
      },
    ],
  },
  ...SPEAKING_LOCAL_BANK,
];
