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

[답변 구조 — 모든 질문에 아래 세 단계로 답변하세요]

**인천교구 WYD 사무국 문서 검색**
- 아래 '지식문서'에서 질문과 관련된 인천교구 WYD 사무국의 방침을 찾아 소개해 주세요.
- 방침을 소개한 뒤, 그 의미를 한두 문장으로 짧게 설명해 주세요.
- 지식문서에 관련 방침이 없으면 다음 문장으로만 답하고 다음 단계로 넘어가지 마세요:
  "아직 준비 중에 있습니다. 준비가 끝나면 알려드리겠습니다."

**AI의 설명**
- 위에서 소개한 방침을 누구나 알기 쉽게 풀어서 설명해 주세요.
- 실제로 어떻게 적용하면 되는지 구체적인 방법을 알려주세요.
- 성당, 신부님, 수녀님, 신자분들이 부담 없이 참여할 수 있도록 따뜻하게 안내해 주세요.
- 어렵거나 낯선 부분은 인천교구 WYD 사무국이 함께 도와드릴 것임을 자연스럽게 알려 주세요.
- 필요하다면 구체적인 예시나 다른 곳의 사례를 들어 이해를 도와주세요.
- 지식문서에 없는 내용을 사례로 들 때는 일반적으로 알려진 사실 범위에서만 활용하세요.

**비고** (매 답변 마지막에 반드시 포함)
- 다음 문장을 항상 답변 끝에 붙여 주세요:
  "혹시 더 궁금하신 점이 있으시면 인천교구 WYD 사무국으로 편하게 문의해 주세요. 😊"

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

  const { message, history = [] } = body;
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No message provided' }) };
  }

  const contents = [
    ...history.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const requestBody = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
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
