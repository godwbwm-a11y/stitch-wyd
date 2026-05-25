const fs = require('fs');
const path = require('path');
const https = require('https');

const knowledgeBase = fs.readFileSync(
  path.join(__dirname, '../../knowledge_base.md'),
  'utf8'
);

const SYSTEM_PROMPT = `당신은 2027 서울 세계청년대회와 인천 교구대회를 안내하는 챗봇입니다.

[말투]
- 자상하고 따뜻하게, "~요"로 끝나는 다정한 존댓말을 사용하세요.
- 딸, 아들, 아버지, 아빠 같은 가족 호칭은 절대 사용하지 마세요.
- 이해하기 쉬운 말로 친절하게 설명하세요.
- 목록은 보기 좋게 줄바꿈하여 정리해 주세요.

[답변 구조 — 모든 질문에 아래 세 단계로 정확히 이 형식대로 답변하세요]

형식 규칙:
- 각 단계의 제목은 아래 굵은 글씨 그대로 사용하세요.
- 제목과 내용 사이에 반드시 빈 줄 하나를 넣으세요.
- 각 단계 사이에도 빈 줄 하나를 넣으세요.
- 답변 전체에 걸쳐 문맥에 맞는 이모티콘을 자연스럽게 적절히 사용하세요.

---

인천교구 WYD 사무국 문서 검색 결과

(여기에 지식문서에서 찾은 방침을 소개하고, 그 의미를 한두 문장으로 짧게 설명해 주세요.)
지식문서에 관련 방침이 없으면 다음 문장만 쓰고 2단계로 넘어가지 마세요:
"아직 준비 중에 있습니다. 준비가 끝나면 알려드리겠습니다."

AI의 설명

(여기에 위 방침을 누구나 알기 쉽게 풀어서 설명해 주세요.
실제로 어떻게 적용하면 되는지 구체적인 방법을 알려주세요.
성당, 신부님, 수녀님, 신자분들이 부담 없이 참여할 수 있도록 따뜻하게 안내해 주세요.
어렵거나 낯선 부분은 인천교구 WYD 사무국이 함께 도와드릴 것임을 자연스럽게 알려 주세요.
필요하다면 구체적인 예시나 다른 곳의 사례를 들어 이해를 도와주세요.
지식문서에 없는 내용을 사례로 들 때는 일반적으로 알려진 사실 범위에서만 활용하세요.)

비고

혹시 더 궁금하신 점이 있으시면 인천교구 WYD 사무국(qna.wyd.doc.icn@gmail.com)으로 편하게 문의해 주세요. 😊

[지식문서]

[지식문서]
${knowledgeBase}`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { message, history = [], lang = 'ko', mode = 'chat' } = body;
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No message provided' }) };
  }

  // 번역 모드: 한국어 원문을 선택된 언어로 그대로 번역
  if (mode === 'translate') {
    const langNames = {
      en: 'English', 'zh-CN': 'Simplified Chinese (Mandarin)', 'zh-HK': 'Traditional Chinese (Cantonese)',
      'zh-TW': 'Traditional Chinese (Taiwan Mandarin)', ja: 'Japanese', th: 'Thai', vi: 'Vietnamese',
      my: 'Burmese (Myanmar)', pl: 'Polish', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
    };
    const targetLang = langNames[lang] || 'English';
    const translatePrompt = `You are a professional translator for a Catholic youth event app aimed at Gen-Z and Gen-Alpha (MZ generation tone).\nTranslate the following Korean text into ${targetLang}.\n\nSTRICT RULES:\n- Preserve EVERY emoji exactly as-is and in the same positions.\n- Preserve markdown formatting (**bold**, line breaks, bullet points "•", separator lines like "━━━").\n- Preserve ALL URLs (https://...), email addresses, and Instagram handles (@username) EXACTLY without translating.\n- Preserve all dates, times, prices, and numbers exactly.\n- Match the casual, friendly, youthful tone (MZ/Gen-Z vibe) of the original.\n- Output ONLY the translated text. No preamble, no explanation, no quotation marks around the result.`;
    const tRequestBody = JSON.stringify({
      system_instruction: { parts: [{ text: translatePrompt }] },
      contents: [{ role: 'user', parts: [{ text: message }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    });
    const tRes = await callGemini(apiKey, tRequestBody);
    if (tRes.error) {
      return { statusCode: 500, body: JSON.stringify({ error: tRes.error }) };
    }
    const tText = tRes?.candidates?.[0]?.content?.parts?.[0]?.text || message;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: tText }),
    };
  }

  const LANG_INSTRUCTIONS = {
    ko:      { inst: '반드시 한국어로 답변하세요.', h1: '인천교구 WYD 사무국 문서 검색 결과', h2: 'AI의 설명', h3: '비고', closing: '혹시 더 궁금하신 점이 있으시면 인천교구 WYD 사무국(qna.wyd.doc.icn@gmail.com)으로 편하게 문의해 주세요. 😊', na: '아직 준비 중에 있습니다. 준비가 끝나면 알려드리겠습니다.' },
    en:      { inst: 'You must respond entirely in English.', h1: 'Incheon Diocese WYD Office: Document Search Results', h2: 'AI Explanation', h3: 'Note', closing: 'If you have any further questions, please feel free to contact the Incheon Diocese WYD Office (qna.wyd.doc.icn@gmail.com). 😊', na: 'This information is not yet available. We will let you know when it is ready.' },
    'zh-CN': { inst: '必须用简体中文（普通话）回答。', h1: '仁川教区WYD事务局文件检索结果', h2: 'AI说明', h3: '备注', closing: '如有更多问题，请随时联系仁川教区WYD事务局（qna.wyd.doc.icn@gmail.com）。😊', na: '相关内容尚在准备中，准备完毕后将及时通知您。' },
    'zh-HK': { inst: '必須用繁體中文（廣東話）回答。', h1: '仁川教區WYD辦事處文件檢索結果', h2: 'AI解說', h3: '備註', closing: '如有更多問題，請隨時聯絡仁川教區WYD辦事處（qna.wyd.doc.icn@gmail.com）。😊', na: '相關內容尚在籌備中，籌備完成後將及時通知您。' },
    'zh-TW': { inst: '必須用繁體中文（台灣華語）回答。', h1: '仁川教區WYD辦公室文件檢索結果', h2: 'AI說明', h3: '備註', closing: '如有任何問題，歡迎隨時聯繫仁川教區WYD辦公室（qna.wyd.doc.icn@gmail.com）。😊', na: '相關資訊尚在準備中，準備完成後將盡快通知您。' },
    ja:      { inst: '必ず日本語で回答してください。', h1: '仁川教区WYD事務局資料検索結果', h2: 'AIの説明', h3: '備考', closing: 'ご不明な点がございましたら、仁川教区WYD事務局（qna.wyd.doc.icn@gmail.com）へお気軽にお問い合わせください。😊', na: 'ただいま準備中です。準備が整い次第お知らせします。' },
    th:      { inst: 'ตอบเป็นภาษาไทยเท่านั้น', h1: 'ผลการค้นหาเอกสารสำนักงาน WYD สังฆมณฑลอินชอน', h2: 'คำอธิบายจาก AI', h3: 'หมายเหตุ', closing: 'หากมีคำถามเพิ่มเติม สามารถติดต่อสำนักงาน WYD สังฆมณฑลอินชอน (qna.wyd.doc.icn@gmail.com) ได้เลย 😊', na: 'ข้อมูลนี้ยังอยู่ระหว่างการเตรียมการ จะแจ้งให้ทราบเมื่อพร้อม' },
    vi:      { inst: 'Chỉ trả lời bằng tiếng Việt.', h1: 'Kết quả tìm kiếm tài liệu Văn phòng WYD Giáo phận Incheon', h2: 'Giải thích của AI', h3: 'Ghi chú', closing: 'Nếu bạn có thêm câu hỏi, hãy liên hệ Văn phòng WYD Giáo phận Incheon (qna.wyd.doc.icn@gmail.com) nhé. 😊', na: 'Thông tin này đang được chuẩn bị. Chúng tôi sẽ thông báo khi sẵn sàng.' },
    my:      { inst: 'မြန်မာဘာသာဖြင့်သာ ဖြေဆိုပါ။', h1: 'Incheon Diocese WYD ရုံး စာရွက်စာတမ်း ရှာဖွေရလဒ်', h2: 'AI ၏ ရှင်းလင်းချက်', h3: 'မှတ်ချက်', closing: 'နောက်ထပ်မေးမြန်းလိုပါက Incheon Diocese WYD ရုံး (qna.wyd.doc.icn@gmail.com) သို့ ဆက်သွယ်နိုင်ပါသည်။ 😊', na: 'ဤအချက်အလက်ကို ယခုမျှ မပြင်ဆင်ရသေးပါ။ အဆင်သင့်ဖြစ်သောအခါ အကြောင်းကြားပါမည်။' },
    pl:      { inst: 'Odpowiadaj wyłącznie po polsku.', h1: 'Wyniki wyszukiwania dokumentów Biura WYD Diecezji Incheon', h2: 'Wyjaśnienie AI', h3: 'Uwaga', closing: 'Jeśli masz pytania, skontaktuj się z Biurem WYD Diecezji Incheon (qna.wyd.doc.icn@gmail.com). 😊', na: 'Te informacje są jeszcze w przygotowaniu. Poinformujemy Cię, gdy będą gotowe.' },
    es:      { inst: 'Responde únicamente en español.', h1: 'Resultados de búsqueda de documentos de la Oficina WYD de la Diócesis de Incheon', h2: 'Explicación de la IA', h3: 'Nota', closing: 'Si tienes más preguntas, contacta con la Oficina WYD de la Diócesis de Incheon (qna.wyd.doc.icn@gmail.com). 😊', na: 'Esta información aún está en preparación. Te avisaremos cuando esté lista.' },
    fr:      { inst: 'Réponds uniquement en français.', h1: 'Résultats de recherche dans les documents du Bureau WYD du Diocèse d\'Incheon', h2: 'Explication de l\'IA', h3: 'Remarque', closing: 'Pour toute question, contactez le Bureau WYD du Diocèse d\'Incheon (qna.wyd.doc.icn@gmail.com). 😊', na: 'Ces informations sont encore en préparation. Nous vous informerons dès qu\'elles seront prêtes.' },
    de:      { inst: 'Antworte ausschließlich auf Deutsch.', h1: 'Suchergebnisse aus den Dokumenten des WYD-Büros der Diözese Incheon', h2: 'KI-Erklärung', h3: 'Hinweis', closing: 'Bei weiteren Fragen wenden Sie sich gerne an das WYD-Büro der Diözese Incheon (qna.wyd.doc.icn@gmail.com). 😊', na: 'Diese Informationen sind noch in Vorbereitung. Wir informieren Sie, sobald sie bereit sind.' },
    it:      { inst: 'Rispondi esclusivamente in italiano.', h1: 'Risultati della ricerca nei documenti dell\'Ufficio WYD della Diocesi di Incheon', h2: 'Spiegazione dell\'IA', h3: 'Nota', closing: 'Per ulteriori domande, contatta l\'Ufficio WYD della Diocesi di Incheon (qna.wyd.doc.icn@gmail.com). 😊', na: 'Queste informazioni sono ancora in preparazione. Ti avviseremo quando saranno pronte.' },
  };

  const lc = LANG_INSTRUCTIONS[lang] || LANG_INSTRUCTIONS['en'];
  const langHeader = `[CRITICAL LANGUAGE RULE — MUST FOLLOW BEFORE ANYTHING ELSE]\n${lc.inst}\nYou MUST write every single word of your response in that language. Do NOT use Korean unless the target language is Korean. This rule overrides all other instructions.\n\n`;
  const langPrompt = `\n\n[언어 지시 — 최우선 규칙 재확인]\n${lc.inst}\n응답의 모든 단어를 위 언어로 작성하세요. 한국어 지식문서를 참고하더라도 출력은 반드시 위 언어로 해야 합니다.\n섹션 제목은 반드시 다음을 사용하세요:\n- 1번 섹션: "${lc.h1}"\n- 2번 섹션: "${lc.h2}"\n- 3번 섹션: "${lc.h3}"\n비고 마지막 문장: "${lc.closing}"\n관련 내용이 없을 때: "${lc.na}"`;

  const contents = [
    ...history.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const requestBody = JSON.stringify({
    system_instruction: { parts: [{ text: langHeader + SYSTEM_PROMPT + langPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  });

  const geminiResponse = await callGemini(apiKey, requestBody);

  if (geminiResponse.error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: geminiResponse.error }),
    };
  }

  const text =
    geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || '답변을 가져오지 못했어요.';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply: text }),
  };
};

function callGemini(apiKey, requestBody) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => { chunks.push(chunk); });
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch {
          resolve({ error: 'Failed to parse Gemini response' });
        }
      });
    });

    req.on('error', (e) => resolve({ error: e.message }));
    req.write(requestBody);
    req.end();
  });
}
