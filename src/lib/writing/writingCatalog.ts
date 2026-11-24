import type { WritingLessonContent } from "./writingEngine";
import { WRITING_LOCAL_BANK } from "./writingLocalBank";

export const WRITING_LESSONS_CATALOG: WritingLessonContent[] = [
  // ==========================================================
  // 1. ACADEMIC TASK 1 · CHARTS (Bar Data + Overview Check)
  // ==========================================================
  {
    id: "writ-acad-t1-transit-energy",
    track: "academic",
    taskType: "academic_task1",
    partType: "Academic Task 1 · Chart Comparison",
    title: "Municipal Bus Electrification & Energy Share (2015–2025)",
    subtitleVi:
      "Luyện viết Academic Task 1 miêu tả biểu đồ kép: bắt buộc có Overview không dính số liệu và dùng ngôn ngữ xu hướng/so sánh Band 8.0.",
    difficultyBand: "7.0",
    recommendedMinutes: 20,
    minWords: 150,
    ksaFocus: ["K", "S", "A"],
    promptEn:
      "The chart below compares the percentage of public buses powered by diesel, hybrid engines, and full electric batteries in a coastal city across 2015, 2020, and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    visualDataSpec: {
      chartTitle: "Share of City Bus Fleet by Powertrain (%)",
      yAxisUnit: "% of fleet",
      categories: ["2015", "2020", "2025"],
      series: [
        { name: "Diesel", tone: "warn", values: [78, 49, 16] },
        { name: "Hybrid", tone: "mint", values: [18, 33, 28] },
        { name: "Battery Electric", tone: "accent", values: [4, 18, 56] },
      ],
    },
    deconstructPrompts: {
      taskTypeTargetVi:
        "IELTS Academic Task 1: tóm tắt xu hướng chính và đối chiếu số liệu, tuyệt đối không nêu ý kiến cá nhân hay nguyên nhân suy đoán ngoài biểu đồ.",
      keyRequirementsVi: [
        "Paraphrase đề bài ở câu mở đầu (1–2 câu).",
        "Viết đoạn Overview riêng ('Overall, ...') chỉ nêu 2 xu hướng nổi bật nhất — KHÔNG chèn số liệu %.",
        "Chia 2 đoạn Body theo nhóm xu hướng (VD: Body 1 phân tích Diesel giảm mạnh; Body 2 đối chiếu Electric vượt trội & Hybrid biến động nhẹ).",
      ],
      ideaSparkQuestionsVi: [
        "Loại nhiên liệu nào chiếm ưu thế năm 2015 và đã giảm bao nhiêu điểm phần trăm đến 2025?",
        "Ở mốc 2020, thứ tự xếp hạng giữa Diesel, Hybrid và Battery Electric có thay đổi chưa?",
        "Hybrid đi theo quỹ đạo tăng liên tục hay tăng lên đỉnh rồi hạ nhẹ vào năm 2025?",
      ],
    },
    selfAuditChecklist: [
      {
        id: "audit-word-150",
        labelVi: "Đã đạt tối thiểu 150 từ tiếng Anh.",
        ksaDimension: "S",
      },
      {
        id: "audit-overview-no-data",
        labelVi: "Có đoạn 'Overall, ...' và không nhét số liệu cụ thể vào Overview.",
        ksaDimension: "S",
      },
      {
        id: "audit-past-present-tense",
        labelVi: "Kiểm tra nhất quán thì quá khứ cho giai đoạn 2015–2025.",
        ksaDimension: "K",
      },
      {
        id: "audit-no-copy-prompt",
        labelVi: "Đã paraphrase từ khóa đề bài thay vì chép nguyên văn.",
        ksaDimension: "A",
      },
    ],
    modelComparison: {
      band65: {
        band: 6.5,
        essayEn: `The bar chart illustrates the percentages of public city buses running on diesel, hybrid, and electric battery power in a coastal town in 2015, 2020, and 2025.

Overall, diesel buses decreased significantly over the ten-year period while battery electric buses increased a lot to become the largest group. Meanwhile, hybrid buses went up during the first half before falling slightly in the final year.

In 2015, diesel was by far the main fuel at 78%, whereas hybrid vehicles accounted for 18% and battery electric buses represented only a tiny 4% share of the municipal fleet. Five years later in 2020, diesel usage dropped noticeably to 49%, while hybrid adoption increased to a peak of 33% and electric models grew steadily to 18%.

By 2025, the ranking of all three power sources had changed completely. Battery electric buses reached 56%, which made them considerably more common than the other two categories combined with diesel alone. Diesel fell further to just 16%, and in contrast, hybrid vehicles declined slightly from their 2020 high to end the period at 28%.`,
        annotationsVi: [
          {
            criterion: "TA_TR",
            noteVi: "Có Overview rõ ràng nhưng phần báo cáo số liệu hơi liệt kê tuyến tính theo năm.",
          },
          {
            criterion: "LR",
            noteVi: "Từ vựng còn lặp 'increased', 'fell', 'slightly', 'a lot' (khá phổ thông).",
          },
          {
            criterion: "GRA",
            noteVi: "Cấu trúc câu đúng ngữ pháp nhưng thiếu mệnh đề phân từ và so sánh bội số (fourteenfold, more than threefold).",
          },
        ],
      },
      band80: {
        band: 8.0,
        essayEn: `The chart illustrates how a coastal municipality's public bus fleet shifted across three propulsion types—diesel, hybrid, and battery electric—between 2015 and 2025.

Overall, the fleet underwent a decisive transition away from diesel, which ceded dominance to battery electric vehicles by the final year. In contrast, hybrid buses followed a moderate rise-and-fall trajectory without ever taking the lead.

At the beginning of the period, diesel buses comprised nearly four-fifths of the network at 78%, dwarfing both hybrids (18%) and battery electric units (4%). Over the next five years, however, reliance on diesel contracted sharply to 49%, allowing hybrid adoption to climb to its decade peak of 33%, while electric models expanded more than fourfold to 18%.

By 2025, full electrification had decisively reshaped the fleet. Battery electric buses surged to 56%, accounting for over half of all vehicles—roughly double the share of hybrids (28%) and more than triple that of diesel, which shrank to a minor 16%.`,
        annotationsVi: [
          {
            criterion: "TA_TR",
            noteVi: "Overview ngắn gọn, sắc nét ('ceded dominance', 'rise-and-fall trajectory'), hoàn toàn không dính số liệu.",
          },
          {
            criterion: "LR",
            noteVi: "Dùng collocation chuẩn học thuật: 'underwent a decisive transition', 'ceded dominance', 'contracted sharply', 'fourfold'.",
          },
          {
            criterion: "GRA",
            noteVi: "Kết hợp mượt mệnh đề quan hệ không xác định, cụm phân từ ('allowing...', 'accounting for...') và so sánh tỉ lệ.",
          },
        ],
        upgradeCollocations: [
          {
            basicEn: "changed completely / became the biggest",
            upgradedEn: "underwent a decisive transition / ceded dominance to",
            usageVi: "Dùng trong Overview Task 1 khi một nhóm nhường ngôi dẫn đầu cho nhóm khác.",
          },
          {
            basicEn: "much smaller than",
            upgradedEn: "dwarfing both X and Y",
            usageVi: "Phân từ hiện tại nhấn mạnh sự chênh lệch áp đảo giữa 2 số liệu.",
          },
          {
            basicEn: "went up four times",
            upgradedEn: "expanded more than fourfold",
            usageVi: "Diễn đạt mức tăng theo lần gọn và tự nhiên ở Band 8.0.",
          },
        ],
      },
    },
  },

  // ==========================================================
  // 2. GT TASK 1 · FORMAL LETTER (Register Check)
  // ==========================================================
  {
    id: "writ-gt-t1-formal-library",
    track: "general",
    taskType: "gt_task1_letter",
    partType: "General Training · Formal Letter",
    title: "Formal Letter: Requesting Extended Library Evening Hours",
    subtitleVi:
      "Thư trang trọng gửi Giám đốc Thư viện Hội đồng: kiểm soát văn phong Formal (tuyệt đối tránh viết tắt) và đủ cả 3 gạch đầu dòng.",
    difficultyBand: "7.0",
    recommendedMinutes: 20,
    minWords: 150,
    ksaFocus: ["K", "S", "A"],
    letterTone: "formal",
    threeBullets: [
      "Explain how you and other residents currently use the quiet study rooms",
      "Describe the difficulties caused by closing the building at 6:00 p.m. on weekdays",
      "Suggest a practical, low-cost way to keep the study wing open until 9:00 p.m.",
    ],
    promptEn:
      "Your local public library recently moved its weekday closing time to 6:00 p.m., which makes it difficult for working adults to study there. Write a formal letter to the Municipal Library Director. In your letter: (1) explain how you and other residents use the quiet study rooms; (2) describe the problems caused by the 6:00 p.m. closing time; (3) suggest a practical solution to keep the study wing open until 9:00 p.m. Write at least 150 words. Begin with 'Dear Sir or Madam,'.",
    deconstructPrompts: {
      taskTypeTargetVi:
        "General Training Formal Letter: người nhận chưa biết tên -> mở bằng 'Dear Sir or Madam,' và kết bằng 'Yours faithfully,'. Tuyệt đối tránh viết tắt (don't, I'm, can't).",
      keyRequirementsVi: [
        "Mở thư nêu rõ mục đích viết thư ngay câu đầu tiên ('I am writing to formally request...').",
        "Mỗi gạch đầu dòng (Bullet) triển khai thành 1 đoạn văn rõ ràng, đầy đủ chi tiết cụ thể.",
        "Giữ giọng điệu lịch sự, mang tính xây dựng ở đề xuất cuối thư.",
      ],
      ideaSparkQuestionsVi: [
        "Bạn thường ôn thi / đọc tài liệu kỹ thuật hoặc làm việc từ xa tại phòng yên tĩnh lúc mấy giờ?",
        "Đóng cửa lúc 18:00 khiến người đi làm tan ca lúc 17:30 gặp bất tiện cụ thể gì?",
        "Làm sao mở thêm tới 21:00 mà thư viện không tốn thêm ngân sách lớn (VD: khóa khu mượn sách, chỉ mở 1 tầng tự học với thẻ từ + tình nguyện viên)?",
      ],
    },
    selfAuditChecklist: [
      {
        id: "audit-gt-3bullets",
        labelVi: "Đã trả lời đầy đủ cả 3 gạch đầu dòng của đề bài.",
        ksaDimension: "S",
      },
      {
        id: "audit-gt-no-contractions",
        labelVi: "Không dùng chữ viết tắt (don't, I'm, can't) trong thư Formal.",
        ksaDimension: "K",
      },
      {
        id: "audit-gt-salutation",
        labelVi: "Đúng cặp mở – kết: 'Dear Sir or Madam,' ↔ 'Yours faithfully,'.",
        ksaDimension: "K",
      },
      {
        id: "audit-gt-words",
        labelVi: "Đạt tối thiểu 150 từ tiếng Anh.",
        ksaDimension: "A",
      },
    ],
    modelComparison: {
      band65: {
        band: 6.5,
        essayEn: `Dear Sir or Madam,

I am writing to ask if the library can stay open later during the week. Many local people need a quiet place to study after work.

I am a regular library member and use the second-floor study room three evenings a week to prepare for my professional exam. Many students and remote workers also sit there because home can be noisy.

Since the library started closing at 6:00 p.m., working adults do not have enough time to study. By the time I finish work at 5:30 p.m. and catch the bus, there are only twenty minutes left before staff ask us to leave.

I would like to suggest keeping only the study wing open until 9:00 p.m. Users could tap their membership card at the door, and one security officer or trained volunteer could lock up at night. I hope you will consider this idea.

Yours faithfully,
Minh Nguyen`,
        annotationsVi: [
          {
            criterion: "TA_TR",
            noteVi: "Đủ 3 gạch đầu dòng, đúng lời chào/kết thư và giữ không viết tắt.",
          },
          {
            criterion: "LR",
            noteVi: "Diễn đạt tự nhiên nhưng còn đơn giản ('ask if', 'many local people', 'this idea').",
          },
          {
            criterion: "GRA",
            noteVi: "Chưa có câu đảo ngữ lịch sự hay câu điều kiện trang trọng (Should the council adopt...).",
          },
        ],
      },
      band80: {
        band: 8.0,
        essayEn: `Dear Sir or Madam,

I am writing as a long-standing library member to express concern regarding the recent decision to close the Municipal Library at 6:00 p.m. on weekdays, and to propose a cost-effective extension for the study wing.

Together with dozens of local residents preparing for licensing exams or completing distance courses, I rely heavily on the second-floor quiet rooms three nights a week. Unlike noisy households or crowded cafes, this dedicated workspace offers dependable Wi-Fi and reference manuals essential for focused study.

Unfortunately, the earlier closing schedule effectively excludes full-time commuters. Finishing work at 5:30 p.m. leaves barely fifteen minutes to settle in before the final bell rings, forcing many adult learners either to abandon their study routine or pay for expensive commercial co-working spaces.

Rather than staffing the entire building after hours, the council could restrict evening access solely to the second-floor study wing until 9:00 p.m. Validated membership swipe-cards would ensure security at minimal staffing cost, supported by a rotating roster of trained community volunteers. I would be grateful if you could review this proposal at your next committee meeting.

Yours faithfully,
Minh Nguyen`,
        annotationsVi: [
          {
            criterion: "TA_TR",
            noteVi: "Mỗi bullet phát triển sâu, giải pháp khả thi và thuyết phục đúng vai công dân viết thư góp ý.",
          },
          {
            criterion: "LR",
            noteVi: "Từ vựng chuẩn văn phong hành chính: 'express concern regarding', 'effectively excludes full-time commuters', 'rotating roster'.",
          },
          {
            criterion: "GRA",
            noteVi: "Mở đầu đa dạng bằng cụm danh động từ ('Finishing work...', 'Rather than staffing...').",
          },
        ],
        upgradeCollocations: [
          {
            basicEn: "write to ask about the closing time",
            upgradedEn: "write to express concern regarding the revised schedule",
            usageVi: "Câu mở đầu chuẩn Band 8.0 cho Formal Letter phàn nàn / kiến nghị.",
          },
          {
            basicEn: "cheap way to fix it",
            upgradedEn: "cost-effective extension at minimal staffing cost",
            usageVi: "Nhấn mạnh tính kinh tế khi đề xuất giải pháp cho tổ chức/hội đồng.",
          },
        ],
      },
    },
  },

  // ==========================================================
  // 3. GT TASK 1 · INFORMAL LETTER
  // ==========================================================
  {
    id: "writ-gt-t1-informal-relocation",
    track: "general",
    taskType: "gt_task1_letter",
    partType: "General Training · Informal Letter",
    title: "Informal Letter: Hosting an Overseas Friend in Your City",
    subtitleVi:
      "Thư thân mật gửi bạn cũ: giữ giọng điệu tự nhiên, ấm áp (dùng được contractions tự nhiên) và đủ cả 3 ý hỏi thăm.",
    difficultyBand: "6.5",
    recommendedMinutes: 20,
    minWords: 150,
    ksaFocus: ["K", "S", "A"],
    letterTone: "informal",
    threeBullets: [
      "Suggest the best month of the year to visit your city and explain why",
      "Recommend one local neighbourhood or market you want to show them",
      "Explain your weekday work hours and how you will spend the weekend together",
    ],
    promptEn:
      "An English-speaking friend who lives abroad plans to visit your city for four days later this year and wants your advice. Write a letter to your friend. In your letter: (1) suggest the best month to visit and explain why; (2) recommend a local neighbourhood or market you would like to explore together; (3) explain your weekday work schedule and your plan for the weekend. Write at least 150 words. Begin with 'Hi Alex,' (or another first name).",
    deconstructPrompts: {
      taskTypeTargetVi:
        "General Training Informal Letter: dùng giọng văn gần gũi, tự nhiên với bạn bè (dùng được contractions như 'I'm', 'you'll', 'don't'), tránh lối viết cứng nhắc như thư công sở ('With reference to...').",
      keyRequirementsVi: [
        "Mở thư hỏi thăm tự nhiên trước khi trả lời 3 gạch đầu dòng.",
        "Nêu lý do khí hậu/lễ hội cho tháng đẹp nhất, miêu tả sinh động khu phố/chợ địa phương.",
        "Kết thư thân mật ('Catch up soon,', 'Warmly,', 'Best,').",
      ],
      ideaSparkQuestionsVi: [
        "Tháng nào thời tiết mát khô dễ đi bộ nhất ở thành phố bạn (VD: tháng 10 hoặc tháng 11)?",
        "Khu phố/chợ nào vừa có đồ ăn đường phố vừa có quán cà phê yên tĩnh nhìn ra sông/phố cổ?",
        "Ban ngày bạn làm việc tới mấy giờ và cuối tuần sẽ đưa bạn đi đâu?",
      ],
    },
    selfAuditChecklist: [
      {
        id: "audit-inf-tone",
        labelVi: "Giữ giọng văn thân mật tự nhiên (không dùng cụm sáo rỗng Formal).",
        ksaDimension: "K",
      },
      {
        id: "audit-inf-bullets",
        labelVi: "Bao phủ đủ cả 3 gạch đầu dòng của đề bài.",
        ksaDimension: "S",
      },
      {
        id: "audit-inf-words",
        labelVi: "Đạt tối thiểu 150 từ tiếng Anh.",
        ksaDimension: "A",
      },
    ],
    modelComparison: {
      band65: {
        band: 6.5,
        essayEn: `Hi Alex,

It's great to hear you're thinking of coming to visit me for four days! I can't wait to catch up in person.

If you can choose your dates, late October is definitely the best time to come. The heavy summer rain has usually stopped by then, and the afternoons stay cool and sunny, which makes walking around much nicer.

When you get here, I'd love to take you to the Old Riverside Market. It's full of tiny noodle stalls and handmade ceramic shops, and there's a lovely rooftop cafe overlooking the bridge where we can chat for hours.

Just a heads-up about my routine: I work at the office from nine to five on Thursday and Friday, so you can explore the museums nearby during the day and we'll grab dinner together at six. Then my entire Saturday and Sunday are completely free for a day trip to the coastal cliffs.

Let me know once you book your flights!

Warm wishes,
Linh`,
        annotationsVi: [
          {
            criterion: "TA_TR",
            noteVi: "Đủ 3 ý rõ ràng, văn phong bạn bè tự nhiên và có chuyển ý mượt.",
          },
          {
            criterion: "LR",
            noteVi: "Dùng tự nhiên các phrasal verbs/idioms thân mật ('catch up in person', 'just a heads-up', 'grab dinner').",
          },
        ],
      },
      band80: {
        band: 8.0,
        essayEn: `Hi Alex,

What brilliant news! It feels like ages since we last caught up, so knowing you're planning a four-day stopover here has already made my month.

If your dates are still flexible, aim for the second half of October. By then, the humid monsoon season has cleared out, leaving crisp mornings and golden afternoons—ideal weather for wandering on foot without melting in the midday heat.

Top of my list for us is the Old Riverside Market. Tucked behind rows of shophouses, it comes alive at dusk with sizzling street-food stalls, independent pottery studios, and a tucked-away terrace cafe overlooking the lantern-lit bridge.

One quick heads-up on logistics: I'll be tied up at work until 5:30 p.m. on Thursday and Friday, though my flat is a five-minute walk from two fantastic art galleries you can browse while I wrap up. Come Saturday morning, though, my calendar is wide open—we can rent bikes early and spend the whole weekend exploring the peninsula trails.

Drop me a message as soon as your flights are locked in!

Warmly,
Linh`,
        annotationsVi: [
          {
            criterion: "TA_TR",
            noteVi: "Sống động, đúng chất thư bạn thân và gợi hình ảnh cụ thể cho cả 3 yêu cầu.",
          },
          {
            criterion: "LR",
            noteVi: "Idiomatic expressions rất tự nhiên: 'has already made my month', 'tied up at work', 'my calendar is wide open', 'locked in'.",
          },
        ],
        upgradeCollocations: [
          {
            basicEn: "I will be busy at work until 5:30",
            upgradedEn: "I'll be tied up at work until 5:30 p.m.",
            usageVi: "Cụm Informal rất tự nhiên khi nói lịch bận trong GT Letter.",
          },
          {
            basicEn: "tell me when your flight is booked",
            upgradedEn: "drop me a message as soon as your flights are locked in",
            usageVi: "Câu kết thư bạn bè Band 8.0 tự nhiên.",
          },
        ],
      },
    },
  },

  // ==========================================================
  // 4. SHARED TASK 2 · DISCUSSION + OPINION ESSAY
  // ==========================================================
  {
    id: "writ-shared-t2-remote-urban",
    track: "shared",
    taskType: "task2_essay",
    partType: "Task 2 Essay · Discussion & Opinion",
    title: "Remote Work & Secondary Towns vs. Major Cities",
    subtitleVi:
      "Essay Task 2 chuẩn cho cả Academic & General Training: lập dàn ý theo khung PEEL, kiểm tra lặp từ và viết lại Draft 2.",
    difficultyBand: "7.5",
    recommendedMinutes: 40,
    minWords: 250,
    ksaFocus: ["K", "S", "A"],
    promptEn:
      "More companies now allow office employees to work remotely from smaller towns rather than commuting to crowded capital cities. Some people believe this trend revitalises regional communities, while others argue it damages city-centre businesses and workplace collaboration. Discuss both views and give your own opinion. Write at least 250 words.",
    deconstructPrompts: {
      taskTypeTargetVi:
        "Task 2 'Discuss both views and give your own opinion': bắt buộc phân tích công bằng cả hai luồng quan điểm trong 2 đoạn Body và nêu rõ lập trường cá nhân từ Mở bài đến Kết bài.",
      keyRequirementsVi: [
        "Introduction: Paraphrase hiện tượng + nêu rõ quan điểm cá nhân (Thesis Statement).",
        "Body 1 (View A — Lợi ích cho địa phương nhỏ): Point → Explain → Example → Link.",
        "Body 2 (View B — Rủi ro cho trung tâm thành phố & cộng tác): phân tích phản biện rồi chốt lập trường cân bằng.",
        "Conclusion: Tóm lại 2 vế và khẳng định lại quan điểm (không đưa ý mới).",
      ],
      ideaSparkQuestionsVi: [
        "Khi nhân sự thu nhập cao chuyển về thị trấn nhỏ, chi tiêu hàng ngày và nhu cầu nhà ở ở đó thay đổi ra sao?",
        "Ngược lại, các quán ăn trưa, giao thông công cộng ở trung tâm tài chính và nhân viên mới vào nghề mất đi cơ hội học hỏi trực tiếp nào?",
        "Mô hình kết hợp (hybrid 2–3 ngày tại văn phòng) có dung hòa được cả hai lợi ích không?",
      ],
    },
    selfAuditChecklist: [
      {
        id: "audit-t2-word-250",
        labelVi: "Đã viết đủ tối thiểu 250 từ tiếng Anh.",
        ksaDimension: "S",
      },
      {
        id: "audit-t2-both-views",
        labelVi: "Đã phân tích đủ cả 2 quan điểm VÀ nêu rõ ý kiến riêng ở Mở & Kết.",
        ksaDimension: "S",
      },
      {
        id: "audit-t2-4paras",
        labelVi: "Chia rõ 4 đoạn văn tách biệt bằng xuống dòng kép.",
        ksaDimension: "K",
      },
      {
        id: "audit-t2-no-repeat",
        labelVi: "Đã thay các từ lặp nhiều (VD: 'city', 'people', 'work') bằng collocation đa dạng.",
        ksaDimension: "A",
      },
    ],
    modelComparison: {
      band65: {
        band: 6.5,
        essayEn: `Nowadays, many office staff can work from home in small towns instead of living in big cities. Some people think this helps local areas grow, while others worry about downtown shops and teamwork. In my opinion, this trend brings more benefits overall if companies manage team communication carefully.

On the one hand, remote workers bring fresh income to smaller communities across the country. Because they earn city salaries while paying lower monthly rent, they spend more money in local cafes, markets, and neighbourhood stores. In addition, young parents who leave crowded capitals often enrol their children in village schools, which encourages town councils to improve high-speed internet connections, public parks, and local libraries for everyone.

On the other hand, empty city-centre offices can seriously hurt service workers who depend on daily office commuters. Sandwich shops, cleaners, and bus drivers lose many regular customers when large office buildings sit half-empty throughout the week. Furthermore, junior staff may learn workplace habits more slowly when they cannot ask senior colleagues quick practical questions face to face during busy project deadlines.

In conclusion, although moving white-collar work outside capital cities creates real challenges for downtown businesses and informal mentoring, its ability to reduce urban overcrowding and spread economic opportunity across regions makes it a positive shift when paired with regular in-person team meetups.`,
        annotationsVi: [
          {
            criterion: "TA_TR",
            noteVi: "Trả lời đủ cả 2 vế và có lập trường rõ ràng ngay câu cuối Mở bài.",
          },
          {
            criterion: "LR",
            noteVi: "Từ vựng rõ ý nhưng còn phổ thông ('big cities', 'more money', 'lose many regular customers').",
          },
          {
            criterion: "GRA",
            noteVi: "Có câu phức với 'Because', 'when', 'although', phù hợp Band 6.5 vững chắc.",
          },
        ],
      },
      band80: {
        band: 8.0,
        essayEn: `The widespread adoption of remote work has enabled white-collar employees to relocate from congested metropolitan hubs to smaller regional towns. While critics warn that this shift hollows out downtown commerce and weakens team cohesion, I believe its broader potential to rebalance regional prosperity outweighs those manageable drawbacks when structured thoughtfully.

Proponents rightly note that dispersing salaried professionals injects sustained purchasing power into underfunded provinces. Rather than concentrating tax revenue, skilled consumers, and young families within a single capital, remote workers support independent retailers, revive rural schools, and generate demand for upgraded digital infrastructure; once local cafés and clinics thrive, nearby towns retain young graduates instead of losing them to metropolitan migration. Concurrently, alleviating urban housing pressure allows municipal budgets to shift from emergency highway expansion toward long-term environmental restoration and affordable transit networks.

Nevertheless, the anxieties surrounding urban centres and workplace mentoring merit serious attention. Central business districts rely heavily on weekday footfall to sustain hospitality venues, transit operators, and maintenance crews, because an abrupt drop in office occupancy can trigger localised unemployment across low-margin service trades. Equally, early-career staff often struggle to absorb tacit workplace habits over scheduled video calls, which deprives them of the spontaneous problem-solving and informal feedback that occur naturally around shared desks.

In conclusion, although unconstrained remote work risks eroding downtown hospitality sectors and informal apprenticeship, adopting structured hybrid schedules—combining regional living with periodic in-person collaboration days—captures the economic resilience of smaller towns without sacrificing team vitality.`,
        annotationsVi: [
          {
            criterion: "TA_TR",
            noteVi: "Lập luận sâu sắc, giải thích cơ chế kinh tế rõ ràng ('tacit workplace habits', 'weekday footfall') và đưa ra giải pháp hybrid ở kết luận.",
          },
          {
            criterion: "CC",
            noteVi: "Mạch nối tự nhiên không máy móc ('Proponents rightly note', 'Concurrently', 'Nevertheless', 'Equally').",
          },
          {
            criterion: "LR",
            noteVi: "Collocation học thuật đắt giá: 'hollows out downtown commerce', 'injects sustained purchasing power', 'tacit workplace habits'.",
          },
        ],
        upgradeCollocations: [
          {
            basicEn: "helps small towns get more money",
            upgradedEn: "injects sustained purchasing power into regional economies",
            usageVi: "Cụm nâng Band LR cực mạnh cho các đề Task 2 về kinh tế / việc làm / đô thị hóa.",
          },
          {
            basicEn: "learn small skills at the office",
            upgradedEn: "absorb tacit workplace habits through spontaneous collaboration",
            usageVi: "Diễn đạt sâu về giá trị học hỏi trực tiếp tại nơi làm việc.",
          },
          {
            basicEn: "harms downtown shops",
            upgradedEn: "hollows out downtown commerce / erodes weekday footfall",
            usageVi: "Động từ hình ảnh chính xác thay thế cho 'hurts' hoặc 'damages'.",
          },
        ],
      },
    },
  },
  ...WRITING_LOCAL_BANK,
];
