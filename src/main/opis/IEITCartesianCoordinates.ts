import { Color } from '../../renderer/utils/constants'


export default function launch(imageName: string, classesImagesNames: string[], colors: Color[], areaSize: number): any {
  /* Отримуємо значення кольорів пікселів для зображень кожного класу */
  const classesValues: number[][][] = getClassesValues(classesImagesNames);

  /* Знаходимо оптимальне значення дельти для СКД */
  const delta: number = getOptimalDelta(classesValues);

  /* Переводимо значення у бінарний вигляд та знаходимо еталонні вектори кожного класу */
  const classBinaryMatrices: number[][][] = [];
  const classVectors: number[][] = [...Array(classesValues.length)].map(() => ([] as number[]));
  const limitVector: number[] = getLimitVector(classesValues[0]);

  classesValues.forEach((classValue, i) => {
    const classBinaryMatrix: number[][] = getBinaryMatrix(classValue, limitVector, delta);
    classBinaryMatrices.push(classBinaryMatrix);
    classVectors[i] = getVectorFromBinaryMatrix(classBinaryMatrix);
  });

  /* Знаходимо радіуси контейнера кожного класу */
  const radii: number[] = getRadii(classVectors, classBinaryMatrices);
  console.log("Optimal radii: " + radii);

  /* Класифікуємо зображення (екзамен) */
  classifyImage(imageName, colors, areaSize, delta, limitVector, classVectors, radii);
}

/**
 * Метод для отримання значеннь кольорів пікселів зображення
 *
 * @param image об'єкт зображення
 * @return значення кольорів пікселів зображення
 * @throws IOException
 */
function imgToArray(BufferedImage image): number[][] {
    const imageWidth: number = image.getWidth();
    const imageHeight: number = image.getHeight();
    const values: number[][] = new int[imageHeight][imageWidth * 3];
    for (let i = 0; i < imageHeight; i++) {
        for (let j = 0; j < imageWidth; j++) {
            Color color = new Color(image.getRGB(j, i));
            values[i][j] = color.getRed();
            values[i][j + imageWidth] = color.getGreen();
            values[i][j + imageWidth * 2] = color.getBlue();
        }
    }

    return values;
}


/**
 * Метод для отримання значеннь кольорів пікселів зображення
 *
 * @param imagePath шлях до зображення
 * @return значення кольорів пікселів зображення
 * @throws IOException
 */
function imgFileToArray(imagePath: string): number[][] {
    BufferedImage image = ImageIO.read(imagePath);

    return imgToArray(image);
}

/**
 * Метод для отримання значень кольорів пікселів для зображень кожного класу
 *
 * @param classesImagesNames список імен зображень класів
 * @return список масивів, які містять значення кольорів пікселів класу
 * @throws IOException
 */
function getClassesValues(classesImagesNames: string[]): number[][][] {
  return classesImagesNames.map(imgFileToArray);
}
