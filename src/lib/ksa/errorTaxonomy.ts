export type IeltsSkill = "listening" | "reading" | "writing" | "speaking";
export type KsaDimension = "K" | "S" | "A";
export type CardType =
  | "vocab"
  | "paraphrase"
  | "audio_clip"
  | "collocation"
  | "phrase";

export interface ErrorTaxonomyEntry {
  code: string;
  skill: IeltsSkill;
  ksaDimension: KsaDimension;
  labelVi: string;
  remediationVi: string;
}

export const SKILL_LABELS_VI: Record<IeltsSkill, string> = {
  listening: "Listening (Nghe)",
  reading: "Reading (Đọc)",
  writing: "Writing (Viết)",
  speaking: "Speaking (Nói)",
};

export const CARD_TYPE_LABELS_VI: Record<CardType, string> = {
  vocab: "Từ vựng ngữ cảnh",
  paraphrase: "Cặp Paraphrase",
  audio_clip: "Âm thanh / Nối âm",
  collocation: "Collocation nâng Band",
  phrase: "Cụm diễn đạt tự nhiên",
};

export const ERROR_TAXONOMY: ErrorTaxonomyEntry[] = [
  // LISTENING
  {
    code: "L_CONNECTED_SPEECH",
    skill: "listening",
    ksaDimension: "K",
    labelVi: "Không nhận ra từ quen do nối âm / nuốt âm / giọng Úc–Anh",
    remediationVi:
      "Lưu đoạn audio vào SRS và nghe chép phân đoạn (Dictation Lab) 5–10 giây.",
  },
  {
    code: "L_SPELLING_OR_SUFFIX",
    skill: "listening",
    ksaDimension: "K",
    labelVi: "Mất đuôi -s/-ed hoặc sai chính tả / số đếm",
    remediationVi:
      "Ôn lại dấu hiệu số nhiều trước ô trống và đọc to kiểm tra danh từ đếm được.",
  },
  {
    code: "L_DISTRACTOR_TRAP",
    skill: "listening",
    ksaDimension: "S",
    labelVi: "Dính bẫy Distractor (người nói tự sửa thông tin)",
    remediationVi:
      "Chú ý từ chuyển ý (actually, wait, rather than) và giữ bút chờ hết cụm mới chốt.",
  },
  {
    code: "L_LOST_TRACK_PANIC",
    skill: "listening",
    ksaDimension: "A",
    labelVi: "Hoảng loạn khi lỡ 1 câu dẫn tới mất sạch 2–3 câu sau",
    remediationVi:
      "Thực hành phản xạ Let-go & Re-anchor: bỏ ngay câu đã lỡ, nhìn thẳng từ khóa câu kế.",
  },
  // READING
  {
    code: "R_PARAPHRASE_MISS",
    skill: "reading",
    ksaDimension: "K",
    labelVi: "Định vị đúng đoạn nhưng không nhận ra Paraphrase / Qualifiers",
    remediationVi:
      "Lưu cặp từ gốc ↔ từ đề bài vào SRS Paraphrase Deck và chú ý từ giới hạn (only, rarely).",
  },
  {
    code: "R_TFNG_LOGIC",
    skill: "reading",
    ksaDimension: "S",
    labelVi: "Nhầm lẫn giữa FALSE (đối nghịch) và NOT GIVEN (không đề cập)",
    remediationVi:
      "Tách phát biểu thành [Chủ thể] – [Quan hệ] – [Mức độ] để đối chiếu từng mảnh.",
  },
  {
    code: "R_TIME_SINK",
    skill: "reading",
    ksaDimension: "S",
    labelVi: "Sa lầy > 2 phút vào một câu khó gây thiếu giờ đoạn cuối",
    remediationVi:
      "Đặt giới hạn 90 giây/câu: bấm Flag bỏ qua ngay khi quá giờ để cứu điểm dễ.",
  },
  {
    code: "R_ASSUMPTION_BIAS",
    skill: "reading",
    ksaDimension: "A",
    labelVi: "Suy diễn theo kiến thức ngoài đời hoặc chọn mò không ghim bằng chứng",
    remediationVi:
      "Chỉ chọn đáp án khi bôi đen được câu gốc chứng minh trong bài đọc.",
  },
  // WRITING
  {
    code: "W_RUBRIC_GAP",
    skill: "writing",
    ksaDimension: "K",
    labelVi: "Thiếu Collocation học thuật, lặp từ hoặc sai văn phong Formal/Informal",
    remediationVi:
      "Đối chiếu bài mẫu Band 8.0 cùng dạng và nạp 3 collocation nâng Band vào SRS.",
  },
  {
    code: "W_NO_OVERVIEW_OR_BULLET",
    skill: "writing",
    ksaDimension: "S",
    labelVi: "Thiếu Overview (Academic T1), thiếu 1 trong 3 bullet (GT T1) hoặc luận điểm mỏng (T2)",
    remediationVi:
      "Bắt buộc lập dàn ý 3–5 phút và kiểm tra checklist trước khi bấm nộp bài.",
  },
  {
    code: "W_SKIPPED_REVISION",
    skill: "writing",
    ksaDimension: "A",
    labelVi: "Viết xong bỏ qua bước Self-Audit hoặc không viết lại Draft 2",
    remediationVi:
      "Dành 60 giây cuối kiểm tra thì động từ, số từ và luôn viết lại đoạn yếu nhất ở Draft 2.",
  },
  // SPEAKING
  {
    code: "S_ENDING_SOUNDS",
    skill: "speaking",
    ksaDimension: "K",
    labelVi: "Rơi âm cuối (ending sounds) hoặc ngữ điệu đều thiếu trọng âm",
    remediationVi:
      "Luyện Shadowing 5 phút mỗi ngày theo bản đánh dấu trọng âm và ngắt cụm (/).",
  },
  {
    code: "S_VOCAB_FREEZE",
    skill: "speaking",
    ksaDimension: "S",
    labelVi: "Bí 1 từ khóa dẫn đến đứng hình hoặc trả lời Part 1/3 quá ngắn",
    remediationVi:
      "Dùng kỹ thuật diễn giải vòng (Circumlocution) + khung A.R.E / P.E.E.C để kéo dài tự nhiên.",
  },
  {
    code: "S_SPEAKING_ANXIETY",
    skill: "speaking",
    ksaDimension: "A",
    labelVi: "Hồi hộp, ngập ngừng nhiều (um, uh) hoặc ngại nghe lại giọng mình",
    remediationVi:
      "Tập 3 chu kỳ thở 4–2–4s trước khi thu âm và dùng cụm câu giờ tự nhiên thay vì im lặng.",
  },
];

export interface StarterCardSeed {
  skill: IeltsSkill;
  cardType: CardType;
  front: string;
  back: string;
}

export const STARTER_KNOWLEDGE_CARDS: StarterCardSeed[] = [
  {
    skill: "listening",
    cardType: "phrase",
    front: "Signpost báo bẫy đổi ý (Listening Section 1–2): \"Actually, scratch that — let's make it...\"",
    back: "Cảnh báo Distractor kinh điển: đáp án trước đó đã bị hủy, đáp án thật nằm ngay phía sau.",
  },
  {
    skill: "listening",
    cardType: "vocab",
    front: "Nối âm hay gặp trong IELTS: \"sort of\" / \"a wide range of\"",
    back: "Thường đọc lướt thành /ˈsɔːtəv/ và /ə waɪd reɪndʒəv/; chú ý danh từ số nhiều đứng sau 'a wide range of'.",
  },
  {
    skill: "reading",
    cardType: "paraphrase",
    front: "Question: \"few residents supported the proposal\" ↔ Passage: ?",
    back: "Passage thường viết: \"opposition to the plan was widespread among locals\" (ít người ủng hộ = đa số phản đối — kỹ thuật Antonym Negation).",
  },
  {
    skill: "reading",
    cardType: "paraphrase",
    front: "Qualifier Trap: \"exclusively\" / \"solely\" vs \"primarily\" / \"predominantly\"",
    back: "exclusively/solely = duy nhất 100% (hay biến câu thành FALSE nếu bài chỉ nói 'chủ yếu' = primarily).",
  },
  {
    skill: "writing",
    cardType: "collocation",
    front: "Nâng Band Writing Task 2 thay cho \"solve the problem\": ?",
    back: "\"alleviate / mitigate the issue\", \"address the root causes of\", \"implement targeted measures to curb...\"",
  },
  {
    skill: "writing",
    cardType: "phrase",
    front: "Academic Task 1 Overview vs GT Task 1 Opening (Formal Letter)",
    back: "Acad T1: \"Overall, it is evident that...\" (tuyệt đối không ghi số liệu). GT Formal Letter: \"I am writing to express my concern regarding...\"",
  },
  {
    skill: "speaking",
    cardType: "phrase",
    front: "Buying-time phrase khi gặp câu Part 3 khó (tránh đứng hình 'um, uh')",
    back: "\"That's an intriguing question—off the top of my head, I'd say it largely depends on...\"",
  },
  {
    skill: "speaking",
    cardType: "collocation",
    front: "Mở rộng ý Part 1 theo khung A.R.E (Answer → Reason → Example)",
    back: "Ví dụ: \"Actually, I'm quite keen on cycling [A] mainly because it helps me unwind after work [R]; for instance, I usually ride along the river on Sundays [E].\"",
  },
];
