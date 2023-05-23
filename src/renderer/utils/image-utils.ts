export const COLORS = ['blue', 'orange', 'red', 'black', 'white'];

export async function getImageContext(
  src: string
): Promise<CanvasRenderingContext2D> {
  const canvas = document.createElement('canvas');

  const destX = 0;
  const destY = 0;

  const imageObj = new Image();

  return new Promise((resolve) => {
    imageObj.onload = () => {
      canvas.width = imageObj.naturalWidth;
      canvas.height = imageObj.naturalHeight;

      const context = canvas.getContext('2d');
      context!.drawImage(imageObj, destX, destY);
      resolve(context!);
    };

    imageObj.src = src;
  });
}

/**
 * Метод для отримання значеннь кольорів пікселів зображення
 *
 * @param image об'єкт зображення
 * @return значення кольорів пікселів зображення
 * @throws IOException
 */
export async function imgToArray(
  src: string | CanvasRenderingContext2D
): Promise<number[][]> {
  const context = typeof src === 'string' ? await getImageContext(src) : src;

  const { height } = context.canvas;
  const { width } = context.canvas;

  const values: number[][] = [];

  for (let y = 0; y < height; y += 1) {
    values.push(new Array(width * 3));
    for (let x = 0; x < width; x += 1) {
      const canvasColor = context!.getImageData(x, y, 1, 1); // rgba e [0,255]
      const pixels = canvasColor.data;

      const [r, g, b] = pixels;

      values[y][x] = r;
      values[y][x + width] = g;
      values[y][x + width * 2] = b;
    }
  }

  return values;
}
