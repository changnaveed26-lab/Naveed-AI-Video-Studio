import { AspectRatio } from '../types';

/**
 * Creates a lightweight animated video preview using Canvas and MediaRecorder.
 * Used when the user's Veo quota is exhausted (429) so they can test the player,
 * audio synchronization, split comparison, and export without being blocked.
 */
export async function createDemoAnimatedVideo(
  imageBase64: string,
  aspectRatio: AspectRatio,
  durationMs: number = 4000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageBase64;

    img.onload = () => {
      const isPortrait = aspectRatio === '9:16';
      const width = isPortrait ? 720 : 1280;
      const height = isPortrait ? 1280 : 720;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Canvas context not available'));
      }

      // Check supported mime types
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      recorder.start();

      const startTime = performance.now();

      function renderFrame(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        // Calculate subtle cinematic zoom & breathing effect
        const zoom = 1 + Math.sin(progress * Math.PI) * 0.08;
        const shiftY = Math.sin(progress * Math.PI * 2) * 6;

        ctx!.save();
        ctx!.fillStyle = '#09090b';
        ctx!.fillRect(0, 0, width, height);

        // Aspect fit / crop
        const imgAspect = img.width / img.height;
        const targetAspect = width / height;
        let drawW = width;
        let drawH = height;

        if (imgAspect > targetAspect) {
          drawW = height * imgAspect;
        } else {
          drawH = width / imgAspect;
        }

        drawW *= zoom;
        drawH *= zoom;

        const offsetX = (width - drawW) / 2;
        const offsetY = (height - drawH) / 2 + shiftY;

        ctx!.drawImage(img, offsetX, offsetY, drawW, drawH);

        // Subtle warm studio rim lighting overlay
        const gradient = ctx!.createRadialGradient(
          width / 2,
          height / 3,
          width / 6,
          width / 2,
          height / 2,
          width / 1.2
        );
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.03)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
        ctx!.fillStyle = gradient;
        ctx!.fillRect(0, 0, width, height);

        ctx!.restore();

        if (progress < 1) {
          requestAnimationFrame(renderFrame);
        } else {
          recorder.stop();
        }
      }

      requestAnimationFrame(renderFrame);
    };

    img.onerror = (err) => reject(err);
  });
}
