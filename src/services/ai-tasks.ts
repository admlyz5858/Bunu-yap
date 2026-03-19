export interface AiTask {
  title: string
  duration: number // minutes
}

const PHASE_NAMES = ['Giriş', 'Derinleşme', 'Uygulama', 'Tekrar']

function parseMinutes(input: string): number {
  const hourMatch = input.match(/(\d+(?:[.,]\d+)?)\s*saat/i)
  const minMatch = input.match(/(\d+)\s*dak/i)
  let total = 0
  if (hourMatch) total += parseFloat(hourMatch[1].replace(',', '.')) * 60
  if (minMatch) total += parseInt(minMatch[1])
  return Math.round(total) || 60
}

function fallbackSplit(input: string): AiTask[] {
  const totalMinutes = parseMinutes(input)
  const subjectMatch = input.match(/^(.+?)\s+\d/)
  const subject = subjectMatch ? subjectMatch[1].trim() : input.trim()

  if (totalMinutes <= 30) {
    return [{ title: subject, duration: totalMinutes }]
  }

  const sessionCount = Math.ceil(totalMinutes / 25)
  const baseMinutes = Math.floor(totalMinutes / sessionCount)
  const remainder = totalMinutes - baseMinutes * sessionCount

  return Array.from({ length: sessionCount }, (_, i) => ({
    title: `${subject} — ${PHASE_NAMES[i % PHASE_NAMES.length]}`,
    duration: baseMinutes + (i === sessionCount - 1 ? remainder : 0),
  }))
}

async function openAiSplit(input: string, apiKey: string): Promise<AiTask[]> {
  const prompt = `Kullanıcı şunu yazdı: "${input}"
Bu çalışma oturumunu odaklanmış alt görevlere böl.
Her alt görev yaklaşık 25-50 dakika olsun.
JSON dizi olarak döndür: [{"title": "...", "duration": 45}, ...]
Sadece JSON döndür, başka bir şey yazma.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    }),
  })

  if (!res.ok) throw new Error('OpenAI API error')
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  return JSON.parse(content) as AiTask[]
}

export async function splitTasks(input: string): Promise<AiTask[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (apiKey) {
    try {
      return await openAiSplit(input, apiKey)
    } catch {
      // fall through to offline
    }
  }
  return fallbackSplit(input)
}
