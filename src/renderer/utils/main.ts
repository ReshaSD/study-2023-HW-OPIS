import {
  classifyImage,
  getBinaryMatrix,
  getLimitVector,
  getOptimalDelta,
  getRadii,
  getVectorFromBinaryMatrix,
} from './IEITCartesian';
import { imgToArray } from './image-utils';

/**
 * Метод для отримання значень кольорів пікселів для зображень кожного класу
 *
 * @param classesImagesNames список імен зображень класів
 * @return список масивів, які містять значення кольорів пікселів класу
 * @throws IOException
 */
async function getClassesValues(imageUrls: string[]): Promise<number[][][]> {
  return Promise.all(imageUrls.map(imgToArray));
}

async function launch(
  imageName: string,
  classesImagesNames: string[],
  // colors: Color[],
  areaSize: number
) {
  /* Отримуємо значення кольорів пікселів для зображень кожного класу */
  const classesValues: number[][][] = await getClassesValues(
    classesImagesNames
  );

  /* Знаходимо оптимальне значення дельти для СКД */
  const { optimalDelta: delta, optimalDeltaData } =
    getOptimalDelta(classesValues);

  /* Переводимо значення у бінарний вигляд та знаходимо еталонні вектори кожного класу */
  const limitVector: number[] = getLimitVector(classesValues[0]);

  const classBinaryMatrices: number[][][] = [];
  const classVectors: number[][] = [...Array(classesValues.length)].map(
    () => [] as number[]
  );

  classesValues.forEach((classValue, i) => {
    const classBinaryMatrix: number[][] = getBinaryMatrix(
      classValue,
      limitVector,
      delta
    );
    classBinaryMatrices.push(classBinaryMatrix);
    classVectors[i] = getVectorFromBinaryMatrix(classBinaryMatrix);
  });

  /* Знаходимо радіуси контейнера кожного класу */
  const { radii, radiiData } = getRadii(classVectors, classBinaryMatrices);

  // console.log(`Optimal radii:`, radii);

  /* Класифікуємо зображення (екзамен) */
  const resultUrl = await classifyImage(
    imageName,
    areaSize,
    delta,
    limitVector,
    classVectors,
    radii
  );

  return {
    classesValues,
    optimalDeltaData,
    delta,
    radii,
    radiiData,
    resultUrl,
  };
}

export default async function getData(
  mainImageURL: string,
  imageURLs: string[]
) {
  const data = await launch(mainImageURL, imageURLs, 50);

  // eslint-disable-next-line no-console
  console.log('data', data);

  return data;
}
