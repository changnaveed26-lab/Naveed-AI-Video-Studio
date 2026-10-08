import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Allow large payloads for base64 images
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

function getGenAI() {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health & Config endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    supportedModels: [
      'veo-3.1-fast-generate-preview',
      'veo-3.1-lite-generate-preview',
      'veo-3.1-generate-preview',
    ],
  });
});

// 2. Start Video Generation
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      prompt = '',
      aspectRatio = '9:16', // '16:9' or '9:16'
      resolution = '720p',
      model = 'veo-3.1-fast-generate-preview',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (aspectRatio !== '16:9' && aspectRatio !== '9:16') {
      return res.status(400).json({ error: 'Aspect ratio must be either "16:9" or "9:16"' });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const ai = getGenAI();

    let targetModel = model || 'veo-3.1-fast-generate-preview';
    let operation;

    try {
      operation = await ai.models.generateVideos({
        model: targetModel,
        prompt: prompt || 'Cinematic subtle animation, realistic facial expressions and natural movement',
        image: {
          imageBytes: cleanBase64,
          mimeType: mimeType || 'image/jpeg',
        },
        config: {
          numberOfVideos: 1,
          resolution: resolution === '1080p' ? '1080p' : '720p',
          aspectRatio: aspectRatio as '16:9' | '9:16',
        },
      });
    } catch (primaryErr: any) {
      console.warn(`Generation failed with ${targetModel}:`, primaryErr?.message || primaryErr);
      // If veo-3.1-fast-generate-preview fails or is unavailable in preview region, fallback to veo-3.1-lite-generate-preview
      if (targetModel !== 'veo-3.1-lite-generate-preview') {
        console.log('Attempting fallback to veo-3.1-lite-generate-preview...');
        targetModel = 'veo-3.1-lite-generate-preview';
        operation = await ai.models.generateVideos({
          model: targetModel,
          prompt: prompt || 'Cinematic subtle animation, realistic facial expressions and natural movement',
          image: {
            imageBytes: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
          config: {
            numberOfVideos: 1,
            resolution: resolution === '1080p' ? '1080p' : '720p',
            aspectRatio: aspectRatio as '16:9' | '9:16',
          },
        });
      } else {
        throw primaryErr;
      }
    }

    if (!operation || !operation.name) {
      throw new Error('Failed to retrieve operation name from Veo API');
    }

    res.json({
      operationName: operation.name,
      modelUsed: targetModel,
      aspectRatio,
    });
  } catch (error: any) {
    console.error('Error generating video:', error);
    const errorStr = `${error?.message || ''} ${JSON.stringify(error || '')}`;
    const isQuota =
      error?.status === 429 ||
      errorStr.includes('429') ||
      errorStr.includes('quota') ||
      errorStr.includes('RESOURCE_EXHAUSTED');

    if (isQuota) {
      return res.status(429).json({
        error: 'Quota Exceeded (429)',
        isQuotaExceeded: true,
        message:
          'Your Gemini API key has exceeded its Veo video generation quota. Veo models require an active paid billing account in Google AI Studio.',
        details: error?.message || error?.toString(),
      });
    }

    res.status(500).json({
      error: error?.message || 'Failed to start video generation',
      details: error?.statusText || error?.toString(),
    });
  }
});

// 3. Poll Video Status
app.post('/api/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGenAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    const isDone = Boolean(updated.done);
    const hasError = updated.error;
    const hasVideo = Boolean(updated.response?.generatedVideos?.[0]?.video?.uri);

    res.json({
      done: isDone,
      error: hasError ? (typeof hasError === 'string' ? hasError : JSON.stringify(hasError)) : null,
      hasVideo,
    });
  } catch (error: any) {
    console.error('Error polling video status:', error);
    res.status(500).json({
      error: error?.message || 'Failed to poll video status',
    });
  }
});

// 4. Download Video (Streams MP4 to client)
app.post('/api/video-download', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGenAI();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (!updated.done) {
      return res.status(400).json({ error: 'Video generation is not complete yet' });
    }

    if (updated.error) {
      return res.status(500).json({ error: 'Video generation reported an error', details: updated.error });
    }

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'No video URI found in completed operation' });
    }

    // Fetch video with x-goog-api-key header
    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to download video stream from Google storage: ${videoRes.statusText}`);
    }

    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="veo-animation.mp4"');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error: any) {
    console.error('Error downloading video:', error);
    res.status(500).json({
      error: error?.message || 'Failed to download generated video',
    });
  }
});

// 5. Enhance Veo Motion Prompt using Gemini 3.8 Flash
app.post('/api/enhance-prompt', async (req: Request, res: Response) => {
  try {
    const { userPrompt, style, quoteText, language = 'en' } = req.body;

    const ai = getGenAI();
    const promptInstructions = `You are an elite cinematic director and Veo video prompt specialist.
Write an optimal, highly vivid visual motion prompt for Veo video generation to animate a still photograph.
The user wants to animate a photo (such as a motivational speaker/creator at a podcast microphone).

Input Details:
- Base Idea / Prompt: "${userPrompt || 'Speaker talking and gesturing'}"
- Style preset: "${style || 'Cinematic Podcast Speaker'}"
- Associated Quote/Speech: "${quoteText || ''}"

Guidelines:
1. Focus entirely on realistic physical motion: natural lip movement, engaged eye blinks and gaze, hand gestures, head nods, subtle camera zoom or pan, studio bokeh lighting, and breathing movement.
2. Avoid visual artifacts; describe steady cinematic quality, 24fps motion blur, and professional depth of field.
3. Keep the prompt between 40 to 80 words. Direct, descriptive, no markdown or chat pleasantries. Only return the prompt text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptInstructions,
      config: {
        temperature: 0.7,
      },
    });

    const enhanced = response.text?.trim() || userPrompt;
    res.json({ enhancedPrompt: enhanced });
  } catch (error: any) {
    console.error('Error enhancing prompt:', error);
    res.status(500).json({
      error: error?.message || 'Failed to enhance prompt',
    });
  }
});

// 6. Generate Motivational Speech Voiceover using Gemini TTS
app.post('/api/generate-tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Zephyr', tone = 'Inspirational motivational speaker' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: `${tone}, clear passionate tone with heartfelt emotion and steady pacing`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio data received from Gemini TTS');
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate speech voiceover',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function initServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

initServer().catch((err) => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});
