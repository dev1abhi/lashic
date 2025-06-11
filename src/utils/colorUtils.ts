// // src/utils/colorUtils.ts
// export const extractColorsFromImage = (imageUrl: string): Promise<{ primary: string; secondary: string; accent: string }> => {
//   return new Promise((resolve) => {
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');
//     const img = new Image();

//     img.crossOrigin = 'anonymous';
//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx?.drawImage(img, 0, 0);

//       try {
//         const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
//         if (!imageData) throw new Error('Could not get image data');

//         const pixels = imageData.data;
//         const colorMap: { [key: string]: number } = {};

//         for (let i = 0; i < pixels.length; i += 16) {
//           const r = pixels[i];
//           const g = pixels[i + 1];
//           const b = pixels[i + 2];
//           const alpha = pixels[i + 3];

//           if (alpha > 128) {
//             const key = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`;
//             colorMap[key] = (colorMap[key] || 0) + 1;
//           }
//         }

//         const sortedColors = Object.entries(colorMap)
//           .sort(([, a], [, b]) => b - a)
//           .slice(0, 5)
//           .map(([color]) => color.split(',').map(Number));

//         if (sortedColors.length >= 3) {
//           const [r1, g1, b1] = sortedColors[0];
//           const [r2, g2, b2] = sortedColors[1];
//           const [r3, g3, b3] = sortedColors[2];

//           const primary = `rgb(${Math.floor(r1 * 0.2)}, ${Math.floor(g1 * 0.2)}, ${Math.floor(b1 * 0.2)})`;
//           const secondary = `rgb(${Math.floor(r2 * 0.3)}, ${Math.floor(g2 * 0.3)}, ${Math.floor(b2 * 0.3)})`;
//           const accent = `rgb(${Math.floor(r3 * 0.4)}, ${Math.floor(g3 * 0.4)}, ${Math.floor(b3 * 0.4)})`;

//           resolve({ primary, secondary, accent });
//         } else {
//           resolve({ primary: "#1a1a1a", secondary: "#2a2a2a", accent: "#3a3a3a" });
//         }
//       } catch {
//         resolve({ primary: "#1a1a1a", secondary: "#2a2a2a", accent: "#3a3a3a" });
//       }
//     };

//     img.onerror = () => {
//       resolve({ primary: "#1a1a1a", secondary: "#2a2a2a", accent: "#3a3a3a" });
//     };

//     img.src = imageUrl;
//   });
// };


// Updated extractColorsFromImage (colorUtils.ts)
export const extractColorsFromImage = (
  imageUrl: string
): Promise<string[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      try {
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) throw new Error('Could not get image data');

        const pixels = imageData.data;
        const colorMap: { [key: string]: number } = {};

        for (let i = 0; i < pixels.length; i += 12) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];

          if (a > 128) {
            const key = `${Math.floor(r / 16) * 16},${Math.floor(g / 16) * 16},${Math.floor(b / 16) * 16}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
          }
        }

        const sorted = Object.entries(colorMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 7) // <-- extract more dominant colors
          .map(([key]) => {
            const [r, g, b] = key.split(',').map(Number);
            return `rgb(${r}, ${g}, ${b})`;
          });

        resolve(sorted.length ? sorted : ['#1a1a1a', '#2a2a2a', '#3a3a3a']);
      } catch {
        resolve(['#1a1a1a', '#2a2a2a', '#3a3a3a']);
      }
    };

    img.onerror = () => {
      resolve(['#1a1a1a', '#2a2a2a', '#3a3a3a']);
    };

    img.src = imageUrl;
  });
};
