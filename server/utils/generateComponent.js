import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function generateComponent(messages) {
  const formatted = messages.map((m) => ({ role: m.role, content: m.content }));
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content:
          'You are an AI that generates React component code. Return JSON with keys "code" and "css". "code" should be valid JSX. "css" should be plain CSS matching the classes used.',
      },
      ...formatted,
    ],
  });

  const assistantMessage = completion.choices[0].message.content;
  let code = '';
  let css = '';
  try {
    const json = JSON.parse(assistantMessage);
    code = json.code ?? '';
    css = json.css ?? '';
  } catch (e) {
    const [c, s] = assistantMessage.split('/* CSS */');
    code = c.trim();
    css = s?.trim() || '';
  }

  return { assistantMessage, code, css };
}