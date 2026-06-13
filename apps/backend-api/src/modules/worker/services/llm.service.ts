import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly timeoutMs = 15000;
  private readonly maxRetries = 3;

  async synthesizeBio(textProfile: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not defined in environment. Falling back to mock biography.');
      return this.generateMockBio(textProfile);
    }

    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const prompt = `System Instruction: You are a professional music biographer. Summarize the following artist profile/press kit into a concise, engaging biography of 2-3 paragraphs. Focus on their musical style, achievements, and background. Output only the summarized biography text without any markdown formatting, commentary or introduction.

Here is the artist press kit:

${textProfile}`;

    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    let attempt = 0;
    while (attempt < this.maxRetries) {
      attempt++;
      try {
        this.logger.log(`Dispatching query to Gemini API (Attempt ${attempt}/${this.maxRetries})...`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
        }

        const data = await response.json() as any;
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText || typeof candidateText !== 'string') {
          throw new Error('Invalid JSON response format from Gemini API');
        }

        return candidateText.trim();
      } catch (error: any) {
        this.logger.error(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt >= this.maxRetries) {
          this.logger.warn('All retries to Gemini API exhausted. Falling back to mock biography.');
          return this.generateMockBio(textProfile);
        }
        // Wait with simple backoff before retrying
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    return this.generateMockBio(textProfile);
  }

  private generateMockBio(_textProfile: string): string {
    this.logger.log('Generating fallback biography from mock engine.');
    return `The artist has captured audiences globally with their unique style and performance energy. According to their press materials, they have dedicated years to honing their craft, blending multiple genres to create a distinctive and memorable sonic experience.\n\nWith various notable projects and live shows under their belt, they continue to push boundaries and connect with listeners through emotional depth and artistic authenticity. This biography was generated via the system fallback engine.`;
  }
}
