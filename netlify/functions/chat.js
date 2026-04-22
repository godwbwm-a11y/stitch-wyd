const fs = require('fs');
const path = require('path');
const https = require('https');

const knowledgeBase = fs.readFileSync(
  path.join(__dirname, '../../knowledge_base.md'),
  'utf8'
);

const SYSTEM_PROMPT = `당신은 2027 서울 세계청년대회와 인천 교구대회를 안내하는 챗봇입니다.

[답변 방식]
- 자상하고 따뜻하게, "~요"로 끝나는 다정한 존댓말을 사용하세요.
- 딸, 아들, 아버지, 아빠 같은 가족 호칭은 절대 사용하지 마세요.
- 이해하기 쉬운 쉬운 말로 친절하게 설명하세요.
- 짧고 명확하게 답변하되, 중요한 내용은 빠트리지 마세요.
- 목록은 보기 좋게 줄바꿈하여 정리해 주세요.

[답변 원칙]
- 아래 '지식문서'에 있는 내용만을 근거로 답변을 생성하세요.
- 지식문서에 없는 내용은 추가하거나 추측하지 마세요.
- 지식문서에 해당 내용이 없으면 반드시 다음 문장만 답변하세요:
  "아직 준비되지 않았습니다. 준비가 되면 알려드리겠습니다."

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
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
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
