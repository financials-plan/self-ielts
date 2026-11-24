import type { ReadingLessonContent } from "./readingEngine";
import { READING_LOCAL_BANK } from "./readingLocalBank";

export const READING_LESSONS_CATALOG: ReadingLessonContent[] = [
  // ==========================================================
  // 1. IELTS ACADEMIC · PASSAGE 1 (T/F/NG + Summary Completion)
  // ==========================================================
  {
    id: "acad-p1-urban-sponge",
    track: "academic",
    partType: "Academic Passage 1",
    title: "Permeable Cities and Bio-Retention Architecture",
    subtitleVi:
      "Luyện T/F/NG (bẫy từ giới hạn thời gian & quy mô) kết hợp Summary Completion điền 1 từ duy nhất.",
    difficultyBand: "6.5",
    recommendedMinutes: 14,
    ksaFocus: ["K", "S", "A"],
    paragraphs: [
      {
        id: "para-a",
        label: "A",
        sentences: [
          {
            id: "a1",
            text: "For most of the twentieth century, municipal flood engineers relied on buried concrete storm drains designed to expel rainwater from city streets as rapidly as possible.",
          },
          {
            id: "a2",
            text: "While effective during moderate showers, these sealed networks become overwhelmed during cloudbursts, sending polluted runoff directly into urban rivers within minutes.",
          },
          {
            id: "a3",
            text: "In response, planners across Singapore, Rotterdam, and Melbourne have shifted toward sponge-city design, an approach that treats rainfall as a local resource to be absorbed where it lands rather than a nuisance to flush away.",
          },
        ],
      },
      {
        id: "para-b",
        label: "B",
        sentences: [
          {
            id: "b1",
            text: "A cornerstone of this model is permeable paving, where traditional asphalt is replaced with porous concrete blocks laid over crushed gravel reservoirs.",
          },
          {
            id: "b2",
            text: "Field trials conducted in Rotterdam between 2018 and 2022 showed that porous walkways cut peak surface runoff by nearly sixty percent compared with neighbouring conventional streets.",
          },
          {
            id: "b3",
            text: "However, city maintenance logs revealed that fine silt washed down from construction sites can clog surface pores within eighteen months unless high-pressure vacuum sweepers clean the slabs twice a year.",
          },
        ],
      },
      {
        id: "para-c",
        label: "C",
        sentences: [
          {
            id: "c1",
            text: "Alongside porous pavements, bio-retention swales—shallow, vegetated channels filled with sandy soil and deep-rooted sedges—capture and filter street water before it reaches municipal pipes.",
          },
          {
            id: "c2",
            text: "Microbes living around the plant roots break down motor oil and heavy-metal residues, while excess moisture feeds street-tree canopies during dry spells.",
          },
          {
            id: "c3",
            text: "Although developers initially feared that bio-swales would consume valuable parking space, several retail districts reported higher foot traffic along newly planted walkways once shade increased.",
          },
        ],
      },
      {
        id: "para-d",
        label: "D",
        sentences: [
          {
            id: "d1",
            text: "Critics nonetheless caution that surface greenery alone cannot protect dense historic centres where underground utilities leave minimal room for deep soil trenches.",
          },
          {
            id: "d2",
            text: "For those districts, engineers advocate a hybrid blueprint combining rooftop detention cisterns with smart-valve sensors that release stored water hours before a forecast storm.",
          },
          {
            id: "d3",
            text: "Yet city-wide adoption remains uneven because upfront capital costs fall on municipal transport budgets while financial savings accrue later to regional flood insurers.",
          },
        ],
      },
    ],
    contextualVocab: [
      {
        id: "voc-expel",
        term: "expel",
        sentenceId: "a1",
        pos: "verb",
        contextClueVi:
          "Hệ thống cống bê tông kín được thiết kế để làm gì với nước mưa càng nhanh càng tốt khỏi đường phố? Chú ý cụm đối lập ở câu a3 ('nuisance to flush away' vs 'resource to be absorbed').",
        definitionVi: "Đẩy ra, thoát bỏ ra ngoài nhanh chóng",
        collocationEn: "expel rainwater rapidly",
      },
      {
        id: "voc-clog",
        term: "clog",
        sentenceId: "b3",
        pos: "verb",
        contextClueVi:
          "Bùn mịn từ công trường có thể gây tác động xấu gì lên các khe hở (pores) của mặt đường thấm nếu không có xe hút bụi rửa 2 lần/năm?",
        definitionVi: "Làm tắc nghẽn, bít kín",
        collocationEn: "clog surface pores",
      },
      {
        id: "voc-accrue",
        term: "accrue",
        sentenceId: "d3",
        pos: "verb",
        contextClueVi:
          "Chi phí ban đầu thì ngân sách giao thông phải chịu, còn khoản tiết kiệm tài chính về sau lại thuộc về / tích lũy cho bên bảo hiểm lũ lụt vùng.",
        definitionVi: "Tích lũy, dồn lại hoặc chuyển lợi ích về cho ai",
        collocationEn: "savings accrue to insurers",
      },
    ],
    questions: [
      {
        id: "acad-p1-q1",
        number: 1,
        type: "tfng",
        promptEn:
          "Twentieth-century concrete drains prevented dirty street water from entering city rivers during heavy downpours.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["FALSE"],
        evidenceSentenceIds: ["a2"],
        explanationVi:
          "Câu a2 nêu rõ khi mưa lớn (cloudbursts), mạng lưới cống kín bị quá tải và xả thẳng dòng nước chảy tràn ô nhiễm vào sông đô thị chỉ trong vài phút -> trái ngược hoàn toàn với 'prevented'.",
        recommendedErrorCode: "R_TFNG_LOGIC",
        ksaDimension: "S",
        decomposer: {
          subjectEn: "Twentieth-century concrete drains",
          relationEn: "prevented polluted runoff from entering city rivers",
          qualifierEn: "during heavy downpours (cloudbursts)",
          trapNoteVi:
            "Đề gài từ 'prevented' (ngăn chặn), trong khi bài nói cống chỉ hiệu quả khi mưa vừa (moderate showers) còn mưa lớn thì xả thẳng ra sông.",
        },
        paraphraseBridge: {
          questionPhrase: "heavy downpours / dirty street water",
          passagePhrase: "cloudbursts / polluted runoff",
          techniqueVi: "Đồng nghĩa học thuật (Synonym Substitution)",
        },
      },
      {
        id: "acad-p1-q2",
        number: 2,
        type: "tfng",
        promptEn:
          "Porous walkways in Rotterdam only needed maintenance every three years to remain unblocked.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["FALSE"],
        evidenceSentenceIds: ["b3"],
        explanationVi:
          "Câu b3 chỉ ra bùn mịn có thể làm tắc khe hở trong vòng 18 tháng nếu không có xe hút áp suất cao vệ sinh hai lần mỗi năm (twice a year) -> không phải 'every three years'.",
        recommendedErrorCode: "R_TFNG_LOGIC",
        ksaDimension: "S",
        decomposer: {
          subjectEn: "Porous walkways in Rotterdam",
          relationEn: "needed maintenance to remain unblocked",
          qualifierEn: "only every three years",
          trapNoteVi:
            "Từ giới hạn 'only every three years' mâu thuẫn với 'within eighteen months' và 'twice a year' trong câu b3.",
        },
        paraphraseBridge: {
          questionPhrase: "remain unblocked",
          passagePhrase: "unless ... clean the slabs (prevent clogging pores)",
          techniqueVi: "Phủ định điều kiện (Conditional Negation)",
        },
      },
      {
        id: "acad-p1-q3",
        number: 3,
        type: "tfng",
        promptEn:
          "Singapore spent more public funding on porous concrete blocks than Rotterdam did.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["NOT GIVEN"],
        evidenceSentenceIds: ["a3", "b2"],
        explanationVi:
          "Bài đọc nhắc Singapore, Rotterdam, Melbourne đều hướng tới sponge-city (a3) và thử nghiệm ở Rotterdam (b2), nhưng hoàn toàn không so sánh mức chi ngân sách công giữa Singapore và Rotterdam -> NOT GIVEN.",
        recommendedErrorCode: "R_ASSUMPTION_BIAS",
        ksaDimension: "A",
        decomposer: {
          subjectEn: "Singapore vs. Rotterdam",
          relationEn: "spent more public funding on porous concrete",
          qualifierEn: "comparative 'more ... than'",
          trapNoteVi:
            "Cảnh giác bẫy so sánh (Comparative Trap): hai thành phố đều xuất hiện trong bài nhưng không hề có phép so sánh chi phí giữa hai nơi.",
        },
        paraphraseBridge: {
          questionPhrase: "spent more public funding",
          passagePhrase: "No funding comparison between cities mentioned",
          techniqueVi: "Phát hiện thông tin so sánh không tồn tại (NOT GIVEN)",
        },
      },
      {
        id: "acad-p1-q4",
        number: 4,
        type: "tfng",
        promptEn:
          "Some shopping areas saw an increase in pedestrian visitors after shaded bio-swales were installed.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["TRUE"],
        evidenceSentenceIds: ["c3"],
        explanationVi:
          "Câu c3 xác nhận nhiều khu thương mại bán lẻ (several retail districts) ghi nhận lượng người đi bộ (foot traffic) cao hơn khi bóng mát tăng lên -> khớp hoàn toàn với TRUE.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        decomposer: {
          subjectEn: "Some shopping areas (several retail districts)",
          relationEn: "saw higher pedestrian visitors (foot traffic)",
          qualifierEn: "once shade increased along planted walkways",
          trapNoteVi:
            "Cẩn thận bỏ sót cụm 'retail districts' = shopping areas và 'foot traffic' = pedestrian visitors.",
        },
        paraphraseBridge: {
          questionPhrase: "increase in pedestrian visitors",
          passagePhrase: "higher foot traffic",
          techniqueVi: "Paraphrase danh từ ghép (foot traffic ↔ pedestrian visitors)",
        },
      },
      {
        id: "acad-p1-q5",
        number: 5,
        type: "summary_completion",
        instructionVi: "Điền đúng MỘT TỪ (ONE WORD ONLY) lấy trực tiếp từ bài đọc.",
        wordLimit: 1,
        promptEn:
          "Underneath permeable concrete blocks, crushed ______ acts as a temporary reservoir for stormwater.",
        acceptedAnswers: ["gravel"],
        evidenceSentenceIds: ["b1"],
        explanationVi:
          "Câu b1 viết: 'porous concrete blocks laid over crushed gravel reservoirs' -> từ loại cần điền sau tính từ 'crushed' là danh từ 'gravel'.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "temporary reservoir underneath concrete blocks",
          passagePhrase: "laid over crushed gravel reservoirs",
          techniqueVi: "Đọc cấu trúc bổ nghĩa trước danh từ (crushed gravel)",
        },
      },
      {
        id: "acad-p1-q6",
        number: 6,
        type: "summary_completion",
        instructionVi: "Điền đúng MỘT TỪ (ONE WORD ONLY) lấy trực tiếp từ bài đọc.",
        wordLimit: 1,
        promptEn:
          "Constructed channels known as bio-retention swales clean street runoff using ______ living near plant roots.",
        acceptedAnswers: ["microbes"],
        evidenceSentenceIds: ["c2"],
        explanationVi:
          "Câu c2 viết: 'Microbes living around the plant roots break down motor oil and heavy-metal residues' -> đáp án là 'microbes'.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "clean street runoff using",
          passagePhrase: "Microbes ... break down motor oil and heavy-metal residues",
          techniqueVi: "Khái quát hóa hành động (clean ↔ break down pollutants)",
        },
      },
      {
        id: "acad-p1-q7",
        number: 7,
        type: "summary_completion",
        instructionVi: "Điền đúng MỘT TỪ (ONE WORD ONLY) lấy trực tiếp từ bài đọc.",
        wordLimit: 1,
        promptEn:
          "In cramped historic neighbourhoods, smart-valve ______ help rooftop cisterns empty stored rainwater ahead of incoming storms.",
        acceptedAnswers: ["sensors"],
        evidenceSentenceIds: ["d2"],
        explanationVi:
          "Câu d2 nêu rõ: 'smart-valve sensors that release stored water hours before a forecast storm' -> đáp án là 'sensors'.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "S",
        paraphraseBridge: {
          questionPhrase: "ahead of incoming storms",
          passagePhrase: "hours before a forecast storm",
          techniqueVi: "Paraphrase trạng ngữ thời gian",
        },
      },
      {
        id: "acad-p1-q8",
        number: 8,
        type: "summary_completion",
        instructionVi: "Điền đúng MỘT TỪ (ONE WORD ONLY) lấy trực tiếp từ bài đọc.",
        wordLimit: 1,
        promptEn:
          "Large-scale rollout is slowed because transport departments carry initial costs while flood ______ capture the long-term savings.",
        acceptedAnswers: ["insurers"],
        evidenceSentenceIds: ["d3"],
        explanationVi:
          "Câu d3 viết: 'while financial savings accrue later to regional flood insurers' -> từ cần điền là 'insurers'.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "capture the long-term savings",
          passagePhrase: "financial savings accrue later to regional flood insurers",
          techniqueVi: "Chuyển đổi vai chủ động / bị động nhận lợi ích",
        },
      },
    ],
  },

  // ==========================================================
  // 2. IELTS ACADEMIC · PASSAGE 2 (Matching Headings + Y/N/NG + MCQ)
  // ==========================================================
  {
    id: "acad-p2-circadian-lighting",
    track: "academic",
    partType: "Academic Passage 2",
    title: "Circadian Photobiology and Shift-Work Cognition",
    subtitleVi:
      "Luyện Matching Headings, YES/NO/NOT GIVEN (quan điểm tác giả) và Multiple Choice ở band 7.0–8.0.",
    difficultyBand: "7.5",
    recommendedMinutes: 16,
    ksaFocus: ["K", "S", "A"],
    headingBank: [
      { value: "i", label: "i. Why non-visual eye cells dictate daily alertness" },
      { value: "ii", label: "ii. The commercial failure of early hospital lamps" },
      { value: "iii", label: "iii. Conflicting effects when blue-rich light boosts night focus" },
      { value: "iv", label: "iv. Adaptive lighting schedules that align with sleep recovery" },
      { value: "v", label: "v. Structural damage to human corneas from office LEDs" },
    ],
    paragraphs: [
      {
        id: "para-a",
        label: "A",
        sentences: [
          {
            id: "a1",
            text: "For decades, architectural lighting standards evaluated indoor spaces almost exclusively by visual brightness—how cleanly light allowed human eyes to read print or inspect machinery.",
          },
          {
            id: "a2",
            text: "The discovery of intrinsically photosensitive retinal ganglion cells (ipRGCs) in the late 1990s upended that narrow assumption.",
          },
          {
            id: "a3",
            text: "Unlike rods and cones, these specialised receptors bypass the visual cortex altogether, transmitting signals about short-wavelength blue sky light directly to the brain's master circadian clock.",
          },
        ],
      },
      {
        id: "para-b",
        label: "B",
        sentences: [
          {
            id: "b1",
            text: "In control rooms and neonatal wards staffed around the clock, employers initially installed static high-intensity blue-enriched panels to keep night crews alert.",
          },
          {
            id: "b2",
            text: "Reaction-time tests confirmed that workers under cooler 6,500-kelvin overhead arrays committed noticeably fewer monitoring lapses at 3 a.m. than peers under standard warm bulbs.",
          },
          {
            id: "b3",
            text: "Yet actigraphy bracelets worn after shifts uncovered an unwelcome trade-off: suppressing melatonin in the early hours delayed daytime sleep onset and fragmented deep recovery sleep once workers returned home.",
          },
        ],
      },
      {
        id: "para-c",
        label: "C",
        sentences: [
          {
            id: "c1",
            text: "To resolve this tension, chronobiologists at Aarhus University tested dynamic spectral tuning across a fourteen-week manufacturing trial.",
          },
          {
            id: "c2",
            text: "Rather than flooding the entire night with glare, automated fixtures delivered brief blue-enriched pulses between midnight and 2 a.m., then gradually shifted toward amber wavelengths before dawn.",
          },
          {
            id: "c3",
            text: "Staff under the stepped curve preserved their error-detection gains during critical handover hours while falling asleep an average of thirty-eight minutes faster in morning daylight.",
          },
        ],
      },
      {
        id: "para-d",
        label: "D",
        sentences: [
          {
            id: "d1",
            text: "Even the sharpest spectral algorithm, however, struggles when employees commute home beneath bright morning sunlight without amber-tinted eyewear.",
          },
          {
            id: "d2",
            text: "Consequently, lighting researchers stress that tuneable fixtures cannot substitute for humane shift-rotation limits or quiet blackout bedrooms.",
          },
        ],
      },
    ],
    contextualVocab: [
      {
        id: "voc-upended",
        term: "upended",
        sentenceId: "a2",
        pos: "verb",
        contextClueVi:
          "Phát hiện tế bào thụ cảm ipRGC đã làm gì với giả định hạn hẹp lâu nay về cách đo tiêu chuẩn ánh sáng?",
        definitionVi: "Đảo lộn hoàn toàn, lật ngược (giả định cũ)",
        collocationEn: "upend a narrow assumption",
      },
      {
        id: "voc-fragmented",
        term: "fragmented",
        sentenceId: "b3",
        pos: "verb / adj",
        contextClueVi:
          "Việc ức chế melatonin vào ban đêm khiến giấc ngủ phục hồi ban ngày của nhân viên bị ảnh hưởng ra sao?",
        definitionVi: "Làm gián đoạn, chia vụn, mất liền mạch",
        collocationEn: "fragmented deep recovery sleep",
      },
    ],
    questions: [
      {
        id: "acad-p2-q1",
        number: 1,
        type: "matching_headings",
        promptEn: "Choose the most suitable heading for Paragraph A.",
        options: [
          { value: "i", label: "i. Why non-visual eye cells dictate daily alertness" },
          { value: "ii", label: "ii. The commercial failure of early hospital lamps" },
          { value: "iii", label: "iii. Conflicting effects when blue-rich light boosts night focus" },
          { value: "iv", label: "iv. Adaptive lighting schedules that align with sleep recovery" },
          { value: "v", label: "v. Structural damage to human corneas from office LEDs" },
        ],
        acceptedAnswers: ["i"],
        evidenceSentenceIds: ["a3"],
        explanationVi:
          "Đoạn A tập trung giải thích tế bào ipRGC đi thẳng qua vỏ não thị giác ('bypass the visual cortex') để báo hiệu cho đồng hồ sinh học -> khớp tiêu đề i.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "non-visual eye cells",
          passagePhrase: "specialised receptors bypass the visual cortex",
          techniqueVi: "Khái quát ý chính toàn đoạn (Paragraph Gist)",
        },
      },
      {
        id: "acad-p2-q2",
        number: 2,
        type: "matching_headings",
        promptEn: "Choose the most suitable heading for Paragraph B.",
        options: [
          { value: "i", label: "i. Why non-visual eye cells dictate daily alertness" },
          { value: "ii", label: "ii. The commercial failure of early hospital lamps" },
          { value: "iii", label: "iii. Conflicting effects when blue-rich light boosts night focus" },
          { value: "iv", label: "iv. Adaptive lighting schedules that align with sleep recovery" },
          { value: "v", label: "v. Structural damage to human corneas from office LEDs" },
        ],
        acceptedAnswers: ["iii"],
        evidenceSentenceIds: ["b2", "b3"],
        explanationVi:
          "Đoạn B vừa cho thấy lợi ích giảm sai sót lúc 3 giờ sáng (b2), vừa phơi bày mặt trái ('unwelcome trade-off') làm rối loạn giấc ngủ ban ngày (b3) -> khớp với 'Conflicting effects' (iii).",
        recommendedErrorCode: "R_TFNG_LOGIC",
        ksaDimension: "S",
        paraphraseBridge: {
          questionPhrase: "Conflicting effects / trade-off",
          passagePhrase: "fewer monitoring lapses ... Yet ... unwelcome trade-off",
          techniqueVi: "Nhận diện cấu trúc tương phản (Contrast Pivot 'Yet')",
        },
      },
      {
        id: "acad-p2-q3",
        number: 3,
        type: "matching_headings",
        promptEn: "Choose the most suitable heading for Paragraph C.",
        options: [
          { value: "i", label: "i. Why non-visual eye cells dictate daily alertness" },
          { value: "ii", label: "ii. The commercial failure of early hospital lamps" },
          { value: "iii", label: "iii. Conflicting effects when blue-rich light boosts night focus" },
          { value: "iv", label: "iv. Adaptive lighting schedules that align with sleep recovery" },
          { value: "v", label: "v. Structural damage to human corneas from office LEDs" },
        ],
        acceptedAnswers: ["iv"],
        evidenceSentenceIds: ["c2", "c3"],
        explanationVi:
          "Đoạn C mô tả lộ trình ánh sáng thay đổi theo thời điểm ('blue-enriched pulses ... gradually shifted toward amber') giúp vừa giữ tập trung vừa ngủ nhanh hơn vào buổi sáng -> khớp tiêu đề iv.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "Adaptive lighting schedules",
          passagePhrase: "dynamic spectral tuning / stepped curve",
          techniqueVi: "Đồng nghĩa chuyên ngành (Adaptive ↔ Dynamic Tuning)",
        },
      },
      {
        id: "acad-p2-q4",
        number: 4,
        type: "ynng",
        promptEn:
          "In the late 1990s, building lighting guidelines were already prioritising circadian health alongside visual clarity.",
        options: [
          { value: "YES", label: "YES" },
          { value: "NO", label: "NO" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["NO"],
        evidenceSentenceIds: ["a1", "a2"],
        explanationVi:
          "Câu a1 nói các tiêu chuẩn cũ đánh giá không gian gần như hoàn toàn dựa vào độ sáng thị giác ('almost exclusively by visual brightness'), và khám phá ipRGC cuối thập niên 1990 mới đảo lộn giả định đó -> mâu thuẫn với 'already prioritising circadian health' => NO.",
        recommendedErrorCode: "R_TFNG_LOGIC",
        ksaDimension: "S",
        decomposer: {
          subjectEn: "Building lighting guidelines (pre-discovery)",
          relationEn: "were already prioritising circadian health",
          qualifierEn: "alongside visual clarity",
          trapNoteVi:
            "Chú ý trạng từ 'almost exclusively' (gần như duy nhất) trong bài phủ định hoàn toàn việc ưu tiên song song nhịp sinh học.",
        },
        paraphraseBridge: {
          questionPhrase: "already prioritising circadian health alongside visual clarity",
          passagePhrase: "evaluated ... almost exclusively by visual brightness",
          techniqueVi: "Phủ định bởi trạng từ giới hạn ('exclusively')",
        },
      },
      {
        id: "acad-p2-q5",
        number: 5,
        type: "ynng",
        promptEn:
          "The Aarhus University trial lasted longer than any previous circadian experiment in Europe.",
        options: [
          { value: "YES", label: "YES" },
          { value: "NO", label: "NO" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["NOT GIVEN"],
        evidenceSentenceIds: ["c1"],
        explanationVi:
          "Câu c1 chỉ nêu thử nghiệm tại Đại học Aarhus kéo dài 14 tuần ('fourteen-week manufacturing trial'), không hề so sánh độ dài này với bất kỳ thí nghiệm nào khác tại châu Âu -> NOT GIVEN.",
        recommendedErrorCode: "R_ASSUMPTION_BIAS",
        ksaDimension: "A",
        decomposer: {
          subjectEn: "The Aarhus University trial",
          relationEn: "lasted longer than any previous experiment in Europe",
          qualifierEn: "superlative 'longer than any'",
          trapNoteVi:
            "Bẫy so sánh nhất: bài có số liệu 'fourteen-week' để đánh lạc hướng, nhưng không đối chiếu với thí nghiệm châu Âu nào khác.",
        },
        paraphraseBridge: {
          questionPhrase: "lasted longer than any previous experiment",
          passagePhrase: "fourteen-week trial (no comparison)",
          techniqueVi: "Bẫy suy diễn số liệu (Data Presence ≠ Comparison)",
        },
      },
      {
        id: "acad-p2-q6",
        number: 6,
        type: "ynng",
        promptEn:
          "Smart spectral lighting by itself is insufficient to protect night workers' health.",
        options: [
          { value: "YES", label: "YES" },
          { value: "NO", label: "NO" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["YES"],
        evidenceSentenceIds: ["d1", "d2"],
        explanationVi:
          "Câu d2 khẳng định các nhà nghiên cứu nhấn mạnh đèn điều chỉnh quang phổ không thể thay thế giới hạn xoay ca hợp lý hoặc phòng ngủ tối yên tĩnh ('cannot substitute for...') -> đồng nghĩa 'by itself is insufficient' => YES.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        decomposer: {
          subjectEn: "Smart spectral lighting by itself",
          relationEn: "is insufficient to protect workers' health",
          qualifierEn: "'by itself' (without rotation limits / dark bedrooms)",
          trapNoteVi:
            "'Cannot substitute for X' là cách tác giả diễn đạt rằng công nghệ đó tự nó không đủ.",
        },
        paraphraseBridge: {
          questionPhrase: "by itself is insufficient",
          passagePhrase: "cannot substitute for humane shift-rotation limits",
          techniqueVi: "Diễn giải khẳng định ý kiến tác giả (Stance Matching)",
        },
      },
      {
        id: "acad-p2-q7",
        number: 7,
        type: "mcq",
        promptEn:
          "What drawback was identified in workers exposed to continuous 6,500-kelvin lighting throughout their night shift?",
        options: [
          { value: "A", label: "A. They made more errors during 3 a.m. monitoring tasks." },
          { value: "B", label: "B. They struggled to fall asleep and slept less soundly after work." },
          { value: "C", label: "C. Their ipRGC cells stopped responding to natural sky light." },
          { value: "D", label: "D. They experienced eye strain when reading equipment dials." },
        ],
        acceptedAnswers: ["B"],
        evidenceSentenceIds: ["b3"],
        explanationVi:
          "Câu b3 ghi rõ: vòng đeo tay actigraphy phát hiện 'delayed daytime sleep onset and fragmented deep recovery sleep' -> khớp đáp án B.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "S",
        paraphraseBridge: {
          questionPhrase: "struggled to fall asleep and slept less soundly",
          passagePhrase: "delayed daytime sleep onset and fragmented deep recovery sleep",
          techniqueVi: "Paraphrase cụm danh từ học thuật sang ngôn ngữ phổ thông",
        },
      },
      {
        id: "acad-p2-q8",
        number: 8,
        type: "mcq",
        promptEn:
          "Why does exposure to bright morning sunlight on the commute home undermine dynamic lighting?",
        options: [
          { value: "A", label: "A. It damages the automated sensors installed on factory ceilings." },
          { value: "B", label: "B. It forces workers to arrive late for their morning handover." },
          { value: "C", label: "C. Unfiltered daylight disrupts the biological wind-down triggered before dawn." },
          { value: "D", label: "D. Amber-tinted glasses prevent drivers from seeing traffic signals." },
        ],
        acceptedAnswers: ["C"],
        evidenceSentenceIds: ["c2", "d1"],
        explanationVi:
          "Đoạn C dùng ánh sáng vàng ấm trước bình minh để giúp công nhân dễ ngủ, nhưng câu d1 nêu ánh nắng sáng sớm không qua kính lọc vàng làm hỏng thuật toán điều chỉnh đó -> đáp án C.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "S",
        paraphraseBridge: {
          questionPhrase: "Unfiltered daylight",
          passagePhrase: "bright morning sunlight without amber-tinted eyewear",
          techniqueVi: "Suy luận trực tiếp từ mệnh đề điều kiện ('without...')",
        },
      },
    ],
  },

  // ==========================================================
  // 3. IELTS GENERAL TRAINING · SECTIONS 1 & 2 (Workplace & Everyday)
  // ==========================================================
  {
    id: "gt-s12-community-workplace",
    track: "general",
    partType: "GT Sections 1 & 2 · Notices & Workplace Policy",
    title: "Harbourview Tool Library & Hybrid Equipment Policy",
    subtitleVi:
      "Bài đọc chuẩn General Training gồm thông báo cộng đồng + quy định thiết bị nơi làm việc (Matching Info + T/F/NG + Note Completion).",
    difficultyBand: "6.5",
    recommendedMinutes: 14,
    ksaFocus: ["K", "S", "A"],
    paragraphs: [
      {
        id: "para-a",
        label: "A",
        heading: "Harbourview Tool Library — Membership Tiers",
        sentences: [
          {
            id: "a1",
            text: "Standard annual membership ($45) entitles local residents to borrow up to four hand or corded power tools at a time for seven calendar days without additional hire fees.",
          },
          {
            id: "a2",
            text: "Battery-operated garden equipment may be reserved online no more than forty-eight hours before collection and must be returned with battery packs charged to at least half capacity.",
          },
        ],
      },
      {
        id: "para-b",
        label: "B",
        heading: "Late Returns and Repair Responsibilities",
        sentences: [
          {
            id: "b1",
            text: "Items returned after the 5 p.m. closing bell incur a $3 daily overdue fee per tool, capped at the item's replacement value.",
          },
          {
            id: "b2",
            text: "Members are never billed for normal wear on saw blades or sanding belts, yet volunteers will decline future loans if equipment comes back caked in wet concrete or damp sawdust.",
          },
        ],
      },
      {
        id: "para-c",
        label: "C",
        heading: "TechBridge Staff Handbook — Ergonomic Stipend",
        sentences: [
          {
            id: "c1",
            text: "Full-time and part-time permanent staff working at least two days weekly from home may claim a one-off reimbursement of up to $350 toward a height-adjustable desk or supportive task chair.",
          },
          {
            id: "c2",
            text: "Fixed-term interns and external contractors are excluded from the furniture stipend, although all staff may request an ergonomic wrist rest free of charge through the IT portal.",
          },
        ],
      },
      {
        id: "para-d",
        label: "D",
        heading: "IT Asset Return and Screen Privacy",
        sentences: [
          {
            id: "d1",
            text: "Laptops and portable monitors issued by TechBridge remain company property and must undergo security inspection before employees take them across international borders.",
          },
          {
            id: "d2",
            text: "When connecting from trains, cafes, or airport lounges, staff are required to attach a magnetic privacy filter to prevent bystanders from viewing confidential client spreadsheets.",
          },
        ],
      },
      {
        id: "para-e",
        label: "E",
        heading: "Fault Reporting Desk",
        sentences: [
          {
            id: "e1",
            text: "Employees noticing battery swelling, cracked power adapters, or loose charging ports must power off the machine immediately and deliver it to the fourth-floor IT service desk within twenty-four hours.",
          },
        ],
      },
    ],
    contextualVocab: [
      {
        id: "voc-reimbursement",
        term: "reimbursement",
        sentenceId: "c1",
        pos: "noun",
        contextClueVi:
          "Nhân viên mua bàn nâng hạ hoặc ghế công thái học xong có thể nộp hóa đơn để công ty hoàn trả lại tối đa $350 — từ này nghĩa là gì?",
        definitionVi: "Khoản tiền được công ty hoàn trả lại cho chi phí đã ứng mua",
        collocationEn: "one-off reimbursement of up to $350",
      },
      {
        id: "voc-bystanders",
        term: "bystanders",
        sentenceId: "d2",
        pos: "noun",
        contextClueVi:
          "Khi làm việc trên tàu, quán cà phê hay sân bay, tấm lọc chống nhìn trộm ngăn đối tượng nào xung quanh liếc thấy bảng tính khách hàng?",
        definitionVi: "Người ngoài đứng/ngồi gần xung quanh",
        collocationEn: "prevent bystanders from viewing",
      },
    ],
    questions: [
      {
        id: "gt-s12-q1",
        number: 1,
        type: "tfng",
        promptEn:
          "Standard tool-library members must pay extra hire fees whenever they borrow electric drills.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["FALSE"],
        evidenceSentenceIds: ["a1"],
        explanationVi:
          "Câu a1 nêu rõ phí thành viên $45 cho phép mượn tối đa 4 dụng cụ cầm tay hoặc dụng cụ điện có dây trong 7 ngày 'without additional hire fees' -> mâu thuẫn với 'must pay extra hire fees' => FALSE.",
        recommendedErrorCode: "R_TFNG_LOGIC",
        ksaDimension: "S",
        decomposer: {
          subjectEn: "Standard tool-library members",
          relationEn: "must pay extra hire fees for power tools",
          qualifierEn: "extra / whenever",
          trapNoteVi:
            "Để ý cụm 'without additional hire fees' phủ định hoàn toàn 'must pay extra hire fees'.",
        },
        paraphraseBridge: {
          questionPhrase: "without paying extra hire fees vs must pay extra",
          passagePhrase: "without additional hire fees",
          techniqueVi: "Đối chiếu cụm phủ định 'without additional'",
        },
      },
      {
        id: "gt-s12-q2",
        number: 2,
        type: "tfng",
        promptEn:
          "Members are charged to replace saw blades that naturally wear down through ordinary use.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["FALSE"],
        evidenceSentenceIds: ["b2"],
        explanationVi:
          "Câu b2 khẳng định: 'Members are never billed for normal wear on saw blades or sanding belts' -> FALSE.",
        recommendedErrorCode: "R_TFNG_LOGIC",
        ksaDimension: "S",
        decomposer: {
          subjectEn: "Members",
          relationEn: "are charged for worn saw blades",
          qualifierEn: "never billed vs are charged",
          trapNoteVi: "Cẩn thận bỏ qua chữ 'never' ở đầu câu b2.",
        },
        paraphraseBridge: {
          questionPhrase: "are charged ... naturally wear down",
          passagePhrase: "never billed for normal wear",
          techniqueVi: "Trái nghĩa trực tiếp (charged ↔ never billed)",
        },
      },
      {
        id: "gt-s12-q3",
        number: 3,
        type: "tfng",
        promptEn:
          "All TechBridge employees, regardless of contract status, can apply for the $350 home-office desk stipend.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["FALSE"],
        evidenceSentenceIds: ["c2"],
        explanationVi:
          "Câu c2 loại trừ rõ thực tập sinh có thời hạn và cộng tác viên ngoài ('Fixed-term interns and external contractors are excluded from the furniture stipend') -> trái với 'All ... regardless of contract status' => FALSE.",
        recommendedErrorCode: "R_TFNG_LOGIC",
        ksaDimension: "S",
        decomposer: {
          subjectEn: "All TechBridge employees",
          relationEn: "can apply for the $350 desk stipend",
          qualifierEn: "All / regardless of contract status",
          trapNoteVi:
            "Bẫy 'All' cực phổ biến trong GT Section 2: chỉ nhân viên chính thức làm >= 2 ngày/tuần mới được nhận, thực tập sinh chỉ được xin kê tay (wrist rest).",
        },
        paraphraseBridge: {
          questionPhrase: "regardless of contract status",
          passagePhrase: "Fixed-term interns and external contractors are excluded",
          techniqueVi: "Bẫy ngoại lệ trong quy định nhân sự (Exclusion Clause)",
        },
      },
      {
        id: "gt-s12-q4",
        number: 4,
        type: "tfng",
        promptEn:
          "TechBridge laptops must pass a security check before any overseas trip.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["TRUE"],
        evidenceSentenceIds: ["d1"],
        explanationVi:
          "Câu d1 viết: laptop và màn hình di động 'must undergo security inspection before employees take them across international borders' -> khớp TRUE.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        decomposer: {
          subjectEn: "TechBridge laptops",
          relationEn: "must pass a security check",
          qualifierEn: "before any overseas trip",
          trapNoteVi: "'across international borders' = overseas trip.",
        },
        paraphraseBridge: {
          questionPhrase: "before any overseas trip",
          passagePhrase: "before employees take them across international borders",
          techniqueVi: "Paraphrase hành động đi công tác nước ngoài",
        },
      },
      {
        id: "gt-s12-q5",
        number: 5,
        type: "matching_info",
        promptEn:
          "Which section mentions conditions under which a borrower can lose access to future rentals?",
        options: [
          { value: "A", label: "Section A" },
          { value: "B", label: "Section B" },
          { value: "C", label: "Section C" },
          { value: "D", label: "Section D" },
          { value: "E", label: "Section E" },
        ],
        acceptedAnswers: ["B"],
        evidenceSentenceIds: ["b2"],
        explanationVi:
          "Câu b2 trong Section B viết tình nguyện viên sẽ từ chối cho mượn tiếp ('will decline future loans') nếu dụng cụ bị dính bê tông ướt hoặc mùn cưa ẩm -> Section B.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "S",
        paraphraseBridge: {
          questionPhrase: "lose access to future rentals",
          passagePhrase: "decline future loans",
          techniqueVi: "Matching Information paraphrase",
        },
      },
      {
        id: "gt-s12-q6",
        number: 6,
        type: "matching_info",
        promptEn:
          "Which section sets out an urgent deadline for bringing damaged hardware to support technicians?",
        options: [
          { value: "A", label: "Section A" },
          { value: "B", label: "Section B" },
          { value: "C", label: "Section C" },
          { value: "D", label: "Section D" },
          { value: "E", label: "Section E" },
        ],
        acceptedAnswers: ["E"],
        evidenceSentenceIds: ["e1"],
        explanationVi:
          "Section E quy định khi phát hiện pin phồng hoặc cổng sạc lỏng, phải tắt máy ngay và mang tới bàn IT tầng 4 trong vòng 24 giờ -> Section E.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "S",
        paraphraseBridge: {
          questionPhrase: "urgent deadline for bringing damaged hardware",
          passagePhrase: "deliver it to the fourth-floor IT service desk within twenty-four hours",
          techniqueVi: "Khớp mốc thời gian khẩn cấp trong Section E",
        },
      },
      {
        id: "gt-s12-q7",
        number: 7,
        type: "summary_completion",
        instructionVi: "Điền TỐI ĐA HAI TỪ (NO MORE THAN TWO WORDS) từ bài đọc.",
        wordLimit: 2,
        promptEn:
          "Cordless garden tools must come back with batteries charged to at least ______ capacity.",
        acceptedAnswers: ["half"],
        evidenceSentenceIds: ["a2"],
        explanationVi:
          "Câu a2 ghi rõ: 'returned with battery packs charged to at least half capacity' -> đáp án: 'half'.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "Cordless garden tools",
          passagePhrase: "Battery-operated garden equipment",
          techniqueVi: "Đồng nghĩa thiết bị dùng pin (Cordless ↔ Battery-operated)",
        },
      },
      {
        id: "gt-s12-q8",
        number: 8,
        type: "summary_completion",
        instructionVi: "Điền TỐI ĐA HAI TỪ (NO MORE THAN TWO WORDS) từ bài đọc.",
        wordLimit: 2,
        promptEn:
          "When working in public venues such as cafes, staff must use a magnetic ______ on their laptop display.",
        acceptedAnswers: ["privacy filter"],
        evidenceSentenceIds: ["d2"],
        explanationVi:
          "Câu d2 nêu: 'attach a magnetic privacy filter to prevent bystanders from viewing...' -> điền 'privacy filter'.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "working in public venues",
          passagePhrase: "connecting from trains, cafes, or airport lounges",
          techniqueVi: "Khái quát danh sách địa điểm công cộng",
        },
      },
    ],
  },

  // ==========================================================
  // 4. IELTS GENERAL TRAINING · SECTION 3 (Long Feature Article)
  // ==========================================================
  {
    id: "gt-s3-maritime-wayfinding",
    track: "general",
    partType: "GT Section 3 · Feature Article",
    title: "Polynesian Wayfinding and Modern Ocean Sensors",
    subtitleVi:
      "Bài đọc dài chuẩn General Training Section 3 (độ khó tương đương Academic) luyện Matching Headings, MCQ & T/F/NG.",
    difficultyBand: "7.5",
    recommendedMinutes: 16,
    ksaFocus: ["K", "S", "A"],
    headingBank: [
      { value: "i", label: "i. Reading ocean swells beneath overcast skies" },
      { value: "ii", label: "ii. How twentieth-century sails disproved accidental-drift theories" },
      { value: "iii", label: "iii. Combining ancestral observation with floating robotics" },
      { value: "iv", label: "iv. Why wooden hulls outlasted fibreglass vessels" },
    ],
    paragraphs: [
      {
        id: "para-a",
        label: "A",
        sentences: [
          {
            id: "a1",
            text: "Long before magnetic compasses reached the Pacific, Micronesian and Polynesian navigators crossed thousands of kilometres of open ocean in double-hulled canoes without charts or metal instruments.",
          },
          {
            id: "a2",
            text: "When several mid-twentieth-century commentators suggested that remote islands had only been settled by sailors blown accidentally off course, experimental voyages answered with decisive evidence.",
          },
          {
            id: "a3",
            text: "In 1976, the reconstructed voyaging canoe Hokule'a sailed cleanly from Hawai'i to Tahiti under master navigator Mau Piailug, relying strictly on celestial cues and ocean rhythm.",
          },
        ],
      },
      {
        id: "para-b",
        label: "B",
        sentences: [
          {
            id: "b1",
            text: "During clear nights, wayfinders steered by a memorised star compass, tracking constellations as they rose and set along fixed points of the horizon.",
          },
          {
            id: "b2",
            text: "Yet cloud banks often hid the sky for days at a time, forcing navigators to crouch inside the hull and sense how distant islands bent or bounced long-period ocean swells.",
          },
          {
            id: "b3",
            text: "Because each atoll generates a distinct interference pattern where refracted waves meet, an experienced crew could identify an unseen landmass well before seabirds or palm silhouettes appeared.",
          },
        ],
      },
      {
        id: "para-c",
        label: "C",
        sentences: [
          {
            id: "c1",
            text: "Today, Pacific marine institutes are pairing apprentice wayfinders with oceanographers who deploy autonomous wave buoys along traditional voyaging corridors.",
          },
          {
            id: "c2",
            text: "When researchers compared the buoys' accelerometer logs against apprentices' hand-drawn swell maps, both records pinpointed identical refraction zones behind low-lying reefs.",
          },
        ],
      },
      {
        id: "para-d",
        label: "D",
        sentences: [
          {
            id: "d1",
            text: "Far from replacing traditional training, real-time sensor telemetry helps young navigators build sensory confidence while alerting coastal communities to subtle shifts in warm-current boundaries.",
          },
        ],
      },
    ],
    contextualVocab: [
      {
        id: "voc-refracted",
        term: "refracted",
        sentenceId: "b3",
        pos: "adj / verb (past participle)",
        contextClueVi:
          "Khi sóng đại dương dài gặp các đảo san hô (atoll), chúng bị đổi hướng/uốn cong tạo nên giao thoa riêng biệt — từ 'refracted' diễn tả hiện tượng gì?",
        definitionVi: "Bị khúc xạ / bẻ cong hướng truyền khi gặp vật cản (đảo)",
        collocationEn: "refracted waves meet",
      },
      {
        id: "voc-telemetry",
        term: "telemetry",
        sentenceId: "d1",
        pos: "noun",
        contextClueVi:
          "Các cảm biến đặt trên phao ngoài khơi truyền dữ liệu đo sóng từ xa về thời gian thực — danh từ 'telemetry' chỉ loại dữ liệu nào?",
        definitionVi: "Dữ liệu đo đạc truyền từ xa theo thời gian thực",
        collocationEn: "real-time sensor telemetry",
      },
    ],
    questions: [
      {
        id: "gt-s3-q1",
        number: 1,
        type: "matching_headings",
        promptEn: "Choose the most suitable heading for Paragraph A.",
        options: [
          { value: "i", label: "i. Reading ocean swells beneath overcast skies" },
          { value: "ii", label: "ii. How twentieth-century sails disproved accidental-drift theories" },
          { value: "iii", label: "iii. Combining ancestral observation with floating robotics" },
          { value: "iv", label: "iv. Why wooden hulls outlasted fibreglass vessels" },
        ],
        acceptedAnswers: ["ii"],
        evidenceSentenceIds: ["a2", "a3"],
        explanationVi:
          "Đoạn A nhắc giả thuyết cho rằng cư dân đảo chỉ trôi dạt tình cờ ('blown accidentally off course') và chuyến hải trình năm 1976 của thuyền Hokule'a đã bác bỏ giả thuyết đó -> heading ii.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "disproved accidental-drift theories",
          passagePhrase: "blown accidentally off course, experimental voyages answered with decisive evidence",
          techniqueVi: "Tóm tắt ý chính đoạn mở đầu (Problem ↔ Experimental Refutation)",
        },
      },
      {
        id: "gt-s3-q2",
        number: 2,
        type: "matching_headings",
        promptEn: "Choose the most suitable heading for Paragraph B.",
        options: [
          { value: "i", label: "i. Reading ocean swells beneath overcast skies" },
          { value: "ii", label: "ii. How twentieth-century sails disproved accidental-drift theories" },
          { value: "iii", label: "iii. Combining ancestral observation with floating robotics" },
          { value: "iv", label: "iv. Why wooden hulls outlasted fibreglass vessels" },
        ],
        acceptedAnswers: ["i"],
        evidenceSentenceIds: ["b2"],
        explanationVi:
          "Đoạn B giải thích khi mây che kín bầu trời nhiều ngày ('cloud banks often hid the sky'), hoa tiêu dựa vào cảm nhận sóng dài ('long-period ocean swells') để tìm đảo -> heading i.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "beneath overcast skies",
          passagePhrase: "cloud banks often hid the sky for days at a time",
          techniqueVi: "Paraphrase hình ảnh thời tiết",
        },
      },
      {
        id: "gt-s3-q3",
        number: 3,
        type: "matching_headings",
        promptEn: "Choose the most suitable heading for Paragraph C.",
        options: [
          { value: "i", label: "i. Reading ocean swells beneath overcast skies" },
          { value: "ii", label: "ii. How twentieth-century sails disproved accidental-drift theories" },
          { value: "iii", label: "iii. Combining ancestral observation with floating robotics" },
          { value: "iv", label: "iv. Why wooden hulls outlasted fibreglass vessels" },
        ],
        acceptedAnswers: ["iii"],
        evidenceSentenceIds: ["c1", "c2"],
        explanationVi:
          "Đoạn C mô tả sự kết hợp giữa người học nghề định hướng truyền thống ('apprentice wayfinders') và phao cảm biến tự hành ('autonomous wave buoys') -> heading iii.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        paraphraseBridge: {
          questionPhrase: "floating robotics",
          passagePhrase: "autonomous wave buoys",
          techniqueVi: "Paraphrase thiết bị hải dương học",
        },
      },
      {
        id: "gt-s3-q4",
        number: 4,
        type: "mcq",
        promptEn:
          "Why did the 1976 voyage of the canoe Hokule'a attract international attention?",
        options: [
          { value: "A", label: "A. It carried the first magnetic compasses across the Pacific." },
          { value: "B", label: "B. It proved long-distance navigation worked accurately without modern instruments." },
          { value: "C", label: "C. It lasted shorter than any previous motorboat journey." },
          { value: "D", label: "D. It used autonomous buoys to map coastal reefs." },
        ],
        acceptedAnswers: ["B"],
        evidenceSentenceIds: ["a1", "a2", "a3"],
        explanationVi:
          "Chuyến đi năm 1976 từ Hawai'i tới Tahiti không dùng hải đồ hay thiết bị kim loại, chỉ dựa vào tín hiệu thiên văn và sóng biển để chứng minh sự định hướng có chủ đích -> đáp án B.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "S",
        paraphraseBridge: {
          questionPhrase: "without modern instruments",
          passagePhrase: "without charts or metal instruments, relying strictly on celestial cues",
          techniqueVi: "Tổng hợp thông tin câu trước và câu sau",
        },
      },
      {
        id: "gt-s3-q5",
        number: 5,
        type: "mcq",
        promptEn:
          "What happened when scientists checked wave buoy logs alongside hand-drawn apprentice maps?",
        options: [
          { value: "A", label: "A. The robotic buoys missed small reefs detected by apprentices." },
          { value: "B", label: "B. Apprentices struggled to read digital accelerometer charts." },
          { value: "C", label: "C. Both methods located the exact same wave-refraction areas." },
          { value: "D", label: "D. Wave patterns changed too quickly to draw accurate maps." },
        ],
        acceptedAnswers: ["C"],
        evidenceSentenceIds: ["c2"],
        explanationVi:
          "Câu c2 viết rõ: cả hai nguồn dữ liệu đều xác định chính xác cùng một vùng khúc xạ ('both records pinpointed identical refraction zones') -> đáp án C.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "S",
        paraphraseBridge: {
          questionPhrase: "exact same wave-refraction areas",
          passagePhrase: "identical refraction zones",
          techniqueVi: "Đồng nghĩa trực tiếp (exact same ↔ identical)",
        },
      },
      {
        id: "gt-s3-q6",
        number: 6,
        type: "tfng",
        promptEn:
          "Each small Pacific atoll produces its own recognisable pattern when refracted waves intersect.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["TRUE"],
        evidenceSentenceIds: ["b3"],
        explanationVi:
          "Câu b3 viết: 'each atoll generates a distinct interference pattern where refracted waves meet' -> khớp chính xác với TRUE.",
        recommendedErrorCode: "R_PARAPHRASE_MISS",
        ksaDimension: "K",
        decomposer: {
          subjectEn: "Each small Pacific atoll",
          relationEn: "produces its own recognisable pattern",
          qualifierEn: "when refracted waves intersect (meet)",
          trapNoteVi: "'recognisable' = distinct; 'intersect' = meet.",
        },
        paraphraseBridge: {
          questionPhrase: "own recognisable pattern / intersect",
          passagePhrase: "distinct interference pattern / meet",
          techniqueVi: "Synonym Pairing",
        },
      },
      {
        id: "gt-s3-q7",
        number: 7,
        type: "tfng",
        promptEn:
          "Mau Piailug helped build the autonomous wave buoys tested in Pacific institutes.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["NOT GIVEN"],
        evidenceSentenceIds: ["a3", "c1"],
        explanationVi:
          "Mau Piailug dẫn đường chuyến Hokule'a năm 1976 (a3), còn phao tự hành là công trình ngày nay của viện hải dương học (c1) — không hề nói Mau Piailug tham gia chế tạo phao -> NOT GIVEN.",
        recommendedErrorCode: "R_ASSUMPTION_BIAS",
        ksaDimension: "A",
        decomposer: {
          subjectEn: "Mau Piailug",
          relationEn: "helped build autonomous wave buoys",
          qualifierEn: "link between 1976 navigator and modern buoys",
          trapNoteVi:
            "Không tự ghép nhân vật nổi tiếng ở đoạn A vào công nghệ hiện đại ở đoạn C nếu bài không nhắc tới.",
        },
        paraphraseBridge: {
          questionPhrase: "helped build wave buoys",
          passagePhrase: "No link between Mau Piailug and buoy construction",
          techniqueVi: "Bẫy ghép nối thông tin xuyên đoạn (Cross-Paragraph Fabrication)",
        },
      },
      {
        id: "gt-s3-q8",
        number: 8,
        type: "tfng",
        promptEn:
          "Marine institutes expect sensor buoys to completely end traditional wayfinding apprenticeships.",
        options: [
          { value: "TRUE", label: "TRUE" },
          { value: "FALSE", label: "FALSE" },
          { value: "NOT GIVEN", label: "NOT GIVEN" },
        ],
        acceptedAnswers: ["FALSE"],
        evidenceSentenceIds: ["d1"],
        explanationVi:
          "Câu d1 khẳng định hoàn toàn ngược lại: 'Far from replacing traditional training, real-time sensor telemetry helps young navigators build sensory confidence' -> FALSE.",
        recommendedErrorCode: "R_TFNG_LOGIC",
        ksaDimension: "S",
        decomposer: {
          subjectEn: "Sensor buoys",
          relationEn: "will completely end traditional training",
          qualifierEn: "Far from replacing vs completely end",
          trapNoteVi:
            "Cấu trúc 'Far from replacing...' = Hoàn toàn không thay thế (mang nghĩa phủ định mạnh).",
        },
        paraphraseBridge: {
          questionPhrase: "completely end traditional apprenticeships",
          passagePhrase: "Far from replacing traditional training",
          techniqueVi: "Cụm phủ định nhấn mạnh ('Far from + V-ing')",
        },
      },
    ],
  },
  ...READING_LOCAL_BANK,
];
