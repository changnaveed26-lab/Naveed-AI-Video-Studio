import { MotivationalPreset, MotionPreset } from '../types';

export const MOTIVATIONAL_PRESETS: MotivationalPreset[] = [
  {
    id: 'urdu-success-dreams',
    title: 'کامیابی اور خواب (Motivational Quote)',
    language: 'ur',
    text: `کامیابی اُنہی لوگوں کو ملتی ہے جو اپنے خوابوں پر یقین رکھتے ہیں۔\nراستہ کتنا ہی مشکل کیوں نہ ہو، ہمت نہیں ہارنی چاہیے۔\nآج کی چھوٹی سی محنت، کل کی بڑی کامیابی بن سکتی ہے۔\nبس خود پر یقین رکھو، محنت کرتے رہو، اور آگے بڑھتے رہو۔`,
    author: 'پریزنٹر / موٹیویشنل اسپیکر',
    recommendedStyle: 'passionate-speaker',
  },
  {
    id: 'urdu-hard-work-journey',
    title: 'حوصلہ اور جستجو (Courage & Journey)',
    language: 'ur',
    text: `منزلیں انہی کو ملتی ہیں جن کے سپنوں میں جان ہوتی ہے۔ پروں سے کچھ نہیں ہوتا، حوصلوں سے اڑان ہوتی ہے۔ کبھی ہار مت مانو!`,
    author: 'اقبال کا پیغام',
    recommendedStyle: 'inspiring-host',
  },
  {
    id: 'urdu-daily-effort',
    title: 'روزانہ کی محنت اور یقین (Daily Dedication)',
    language: 'ur',
    text: `ہر نیا دن ایک نئی شروعات ہے۔ مایوسی کو پیچھے چھوڑ دو اور اپنے مقصد کے لیے دل و جان سے جدوجہد کرو۔ فتح تمہاری ہوگی۔`,
    author: 'موٹیویشن',
    recommendedStyle: 'cinematic-zoom',
  },
  {
    id: 'en-focus-action-success',
    title: 'Focus, Plan, Action, Success',
    language: 'en',
    text: `Success comes to those who refuse to quit. Every small step of disciplined work today compounds into massive triumph tomorrow. Believe in your vision and keep moving forward.`,
    author: 'Podcast Host',
    recommendedStyle: 'passionate-speaker',
  },
  {
    id: 'en-relentless-growth',
    title: 'Unstoppable Momentum',
    language: 'en',
    text: `The road might be tough, but resilience turns obstacles into stepping stones. Stay dedicated to the process, trust your intuition, and let your results speak.`,
    author: 'Creator Wisdom',
    recommendedStyle: 'inspiring-host',
  },
];

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'passionate-speaker',
    title: 'Passionate Podcast Host',
    titleUrdu: 'جوشیلہ پوڈکاسٹ اسپیکر',
    description: 'Realistic speaking cadence, articulate lip motion at mic, expressive head movement and passionate hand gestures.',
    promptSnippet: 'A charismatic speaker speaking passionately into a broadcast microphone, natural eye contact, realistic mouth articulation, subtle hand gesturing while explaining, professional studio rim lighting, 24fps cinematic filmic motion blur.',
    iconName: 'Mic',
  },
  {
    id: 'cinematic-zoom',
    title: 'Cinematic Slow Zoom-In',
    titleUrdu: 'سنیماٹک زوم اور فوکس',
    description: 'Slow dramatic camera push towards the speaker, shallow depth of field, warm warm studio lighting, subtle nodding.',
    promptSnippet: 'Slow smooth camera dolly push-in toward the speaker sitting at the desk, soft background bokeh, natural breathing movement, slight confident smile and head nod, broadcast studio atmosphere, crisp detail.',
    iconName: 'Video',
  },
  {
    id: 'inspiring-host',
    title: 'Inspiring Audience Address',
    titleUrdu: 'متاثر کن اندازِ بیان',
    description: 'Direct engaging eye contact, persuasive hand movement towards the viewer, dynamic studio presence.',
    promptSnippet: 'The speaker addresses the camera with an inspiring, motivational expression, dynamic hand gestures emphasizing key thoughts, natural eye blinks, steady camera framing, professional warm podcaster studio setup.',
    iconName: 'Sparkles',
  },
  {
    id: 'subtle-ambient',
    title: 'Subtle Lifelike Ambient',
    titleUrdu: 'قدرتی حرکات اور ماحول',
    description: 'Gentle organic micro-movements, realistic blinking, subtle posture shift, atmospheric ambient lighting.',
    promptSnippet: 'Gentle organic motion: speaker blinks naturally, adjusts posture slightly, gentle breathing chest movement, warm ambient studio lights softly illuminating the room, smooth photorealistic motion.',
    iconName: 'Wind',
  },
];

export const SAMPLE_IMAGES = [
  {
    id: 'portrait-speaker',
    title: 'Motivational Speaker (Portrait)',
    titleUrdu: 'موٹیویشنل اسپیکر (عمودی ۹:۱۶)',
    url: '/sample-speaker-portrait.jpg',
    aspectRatio: '9:16' as const,
    description: 'Podcast host at desk with microphone, laptop, notebook and "FOCUS PLAN ACTION SUCCESS" poster',
  },
  {
    id: 'landscape-studio',
    title: 'Broadcast Studio Desk (Landscape)',
    titleUrdu: 'پوڈکاسٹ اسٹوڈیو ڈیسک (افقی ۱۶:۹)',
    url: '/sample-speaker-landscape.jpg',
    aspectRatio: '16:9' as const,
    description: 'Widescreen 16:9 cinematic shot of speaker in warm professional podcast studio',
  },
];
