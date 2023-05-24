import { COLORS, getImageContext, imgToArray } from './image-utils';

/**
 * Метод для отримання вектора, який задає СКД
 *
 * @param values значення кольорів базового класу
 * @return вектор, який задає СКД
 */
export function getLimitVector(values: number[][]): number[] {
  const limitVector: number[] = [];
  for (let i = 0; i < values[0].length; i += 1) {
    let sum = 0;
    values.forEach((row) => {
      sum += row[i];
    });
    limitVector.push(sum / values.length);
  }

  return limitVector;
}

/**
 * Метод для перетворення значень кольорів зображення у бінарний вигляд відносно СКД
 *
 * @param values      значення кольорів зображення, яке необхідно перетворити у бінарну матрицю
 * @param limitVector вектор, який задає СКД
 * @param delta       значення дельти для СКД
 * @return бінарну матрицю зображення
 */
export function getBinaryMatrix(
  values: number[][],
  limitVector: number[],
  delta: number
): number[][] {
  const binaryMatrix: number[][] = [...Array(values.length)].map(() =>
    Array(values[0].length)
  );
  for (let i = 0; i < values.length; i += 1) {
    for (let j = 0; j < values[0].length; j += 1) {
      if (
        values[i][j] >= limitVector[j] - delta &&
        values[i][j] <= limitVector[j] + delta
      ) {
        binaryMatrix[i][j] = 1;
      } else {
        binaryMatrix[i][j] = 0;
      }
    }
  }

  return binaryMatrix;
}

/**
 * Метод для отримання еталонного вектора із бінарної матриці класу
 *
 * @param binaryMatrix бінарна матриця класу, для якого необхідно знайти еталонний вектор
 * @return еталонний вектор класу
 */
export function getVectorFromBinaryMatrix(binaryMatrix: number[][]): number[] {
  const vector: number[] = Array(binaryMatrix[0].length);
  for (let i = 0; i < binaryMatrix[0].length; i += 1) {
    let sum = 0;
    binaryMatrix.forEach((row) => {
      sum += row[i];
    });
    vector[i] = Math.round(sum / binaryMatrix.length);
  }

  return vector;
}

/**
 * Метод для пошуку відстаней між двома векторами
 *
 * @param firstVector  перший вектор
 * @param secondVector другий вектор
 * @return відстань між двома векторами
 */
function getDistanceBetweenVectors(
  firstVector: number[],
  secondVector: number[]
): number {
  let distance = 0;
  for (let i = 0; i < firstVector.length; i += 1) {
    if (firstVector[i] !== secondVector[i]) {
      distance += 1;
    }
  }

  return distance;
}

/**
 * Метод для пошуку сусідів кожного класу
 *
 * @param classVectors еталонні вектори кожного класу
 * @return сусідів кожного класу
 */
function makePairs(classVectors: number[][]): number[][] {
  const valueToSet: number = classVectors[0].length + 1;
  const pairs: number[][] = [...Array(classVectors.length)].map(() => [
    valueToSet,
    valueToSet,
  ]);
  // for (int[] pair : pairs) {
  //     Arrays.fill(pair, valueToSet);
  // }
  for (let i = 0; i < classVectors.length; i += 1) {
    for (let j = 0; j < classVectors.length; j += 1) {
      if (i !== j) {
        const distance: number = getDistanceBetweenVectors(
          classVectors[i],
          classVectors[j]
        );
        if (distance < pairs[i][1]) {
          pairs[i][0] = j;
          pairs[i][1] = distance;
        }
      }
    }
  }

  return pairs;
}

/**
 * Метод для пошуку відстаней між вектором та рядками бінарної матриці
 *
 * @param vector       вектор
 * @param binaryMatrix бінарна матриця
 * @return відстані між вектором та рядками бінарної матриці
 */
function getDistancesBetweenVectorAndBinaryMatrix(
  vector: number[],
  binaryMatrix: number[][]
): number[] {
  return binaryMatrix.map((binaryMatrixVector) =>
    getDistanceBetweenVectors(vector, binaryMatrixVector)
  );
}

/**
 * Метод для розрахунку критерію Кульбака
 *
 * @param alpha помилка першого роду
 * @param beta  помилка другого роду
 * @return значення критерію Кульбака
 */
function calculateKullback(alpha: number, beta: number): number {
  return (
    (Math.log((2 - (alpha + beta) + 0.1) / (alpha + beta + 0.1)) /
      Math.log(2)) *
    (1 - (alpha + beta))
  );
}

/**
 * Метод для розрахунку критерію
 *
 * @param alpha помилка першого роду
 * @param beta  помилка другого роду
 * @return значення критерію
 */
function calculateCriterion(alpha: number, beta: number): number {
  return calculateKullback(alpha, beta) / calculateKullback(0, 0);
}

function average(a: number[]) {
  return a.reduce((acc, val) => acc + val, 0) / a.length;
}

/**
 * Метод для обчислення значення критерію для класів та радіусів їх контейнера
 *
 * @param classVectors        еталонні вектори кожного класу
 * @param classBinaryMatrices бінарні матриці класів
 * @param pairs               сусідні класи
 * @return значення критерію для класів та радіусів їх контейнера
 */
function getCriterionValuesForClassesAndRadii(
  classVectors: number[][],
  classBinaryMatrices: number[][][],
  pairs: number[][]
): [number, boolean][][] {
  const criterionValues: [number, boolean][][] = classVectors.map(() => []);
  /* Обчислюємо значення критерію для радіусів у інтервалі [0, 60] */
  classVectors.forEach((_, classNumber) => {
    [...Array(61)].forEach((__, radius) => {
      /* Перша достовірність */
      const d1: number = average(
        getDistancesBetweenVectorAndBinaryMatrix(
          classVectors[classNumber],
          classBinaryMatrices[classNumber]
        ).map((i) => (i <= radius ? 1 : 0))
      );
      const alpha = 1 - d1;

      /* Помилка другого роду */
      const beta: number = average(
        getDistancesBetweenVectorAndBinaryMatrix(
          classVectors[classNumber],
          classBinaryMatrices[pairs[classNumber][0]]
        ).map((i) => (i <= radius ? 1 : 0))
      );

      /* Обчислюємо значення критерію */
      const criterionValue: number = calculateCriterion(alpha, beta);
      /* Якщо перша достовірність >= 0.5, а помилка другого роду < 0.5, то це значення знаходиться у робочій області */
      const isWorkingArea: boolean = d1 >= 0.5 && beta < 0.5;
      criterionValues[classNumber].push([criterionValue, isWorkingArea]);
    });
  });

  return criterionValues;
}

/**
 * Метод для отримання оптимальні радіуси для кожного класу
 *
 * @param classVectors        еталонні вектори кожного класу
 * @param classBinaryMatrices бінарні матриці класів
 * @return список радіусів контейнерів усіх класів
 */
export function getRadii(
  classVectors: number[][],
  classBinaryMatrices: number[][][]
): {
  radii: number[];
  radiiData: {
    isWorkingArea: boolean;
    radius: number;
    criterionValue: number;
  }[];
} {
  /* Знаходимо сусідні класи */
  const pairs: number[][] = makePairs(classVectors);
  /* Знаходимо значення критерію для можливих значень радіусів */
  const criterionValues: [number, boolean][][] =
    getCriterionValuesForClassesAndRadii(
      classVectors,
      classBinaryMatrices,
      pairs
    );

  /* Знаходимо оптимальні радіуси */
  const radii: number[] = [];
  // eslint-disable-next-line no-console
  // console.log('Calculation of radii for classes');

  const radiiData: {
    isWorkingArea: boolean;
    radius: number;
    criterionValue: number;
  }[] = [];

  for (let i = 0; i < criterionValues.length; i += 1) {
    // eslint-disable-next-line no-console
    // console.log(`Class number: ${i}`);
    // eslint-disable-next-line no-console
    // console.log('Is working area | radius | criterion value');
    const res: [number, boolean][] = criterionValues[i];
    let index = -1;
    let value = -1;
    /* Проходимо по всім можливив значенням радіуса */
    for (let j = 0; j < res.length; j += 1) {
      const [key, val] = res[j];
      radiiData.push({
        isWorkingArea: val,
        radius: j,
        criterionValue: key,
      });
      // eslint-disable-next-line no-console
      // console.log(val, j, key);

      /* Якщо значення критерію у робочій області для даного радіуса більше за поточне оптимальне, то запам'ятовуємо його та значення радіуса */
      if (val && key >= value) {
        value = key;
        index = j;
      }
    }
    radii.push(index);
  }

  return { radii, radiiData };
}

/**
 * Метод для отримання оптимального значення дельти для СКД
 *
 * @param classesValues значення кольорів пікселів для зображень кожного класу
 * @return оптимальне значення дельти для СКД
 */
export function getOptimalDelta(classesValues: number[][][]): {
  optimalDelta: number;
  optimalDeltaData: {
    delta: number;
    criterionValue: number;
    criterionValueInWorkingArea: number;
  }[];
} {
  const optimalDeltaData: {
    delta: number;
    criterionValue: number;
    criterionValueInWorkingArea: number;
  }[] = [];
  let optimalDelta: number = 0;
  let optimalDeltaCriterionValue: number = 0;
  /* Шукаємо оптимальне значення у інтервалі [1, 120] */
  // eslint-disable-next-line no-console
  // console.log('Calculation of the optimal delta');
  // eslint-disable-next-line no-console
  // console.log('Delta | criterion value | criterion value in working area');

  for (let delta = 1; delta <= 120; delta += 1) {
    /* Розраховуємо вектор, який задає СКД, бінарні матриці та еталонні вектори кожного класу */
    const classBinaryMatrices: number[][][] = [];
    const classVectors: number[][] = [...Array(classesValues.length)].map(
      () => []
    );
    const limitVector: number[] = getLimitVector(classesValues[0]);
    for (let i = 0; i < classesValues.length; i += 1) {
      const classBinaryMatrix: number[][] = getBinaryMatrix(
        classesValues[i],
        limitVector,
        delta
      );
      classBinaryMatrices.push(classBinaryMatrix);
      classVectors[i] = getVectorFromBinaryMatrix(classBinaryMatrix);
    }

    /* Шукаємо сусідів класів */
    const pairs: number[][] = makePairs(classVectors);
    let criterionValues: [number, boolean][][] = [];
    /* Для кожного класу знаходимо значення критеріїв */
    // IntStream.range(0, classVectors.length).forEach(
    //         classNumber -> criterionValues.addAll(getCriterionValuesForClassesAndRadii(classVectors, classBinaryMatrices, pairs))
    // );
    classVectors.forEach((_, classNumber) => {
      criterionValues = [
        ...criterionValues,
        ...getCriterionValuesForClassesAndRadii(
          classVectors,
          classBinaryMatrices,
          pairs
        ),
      ];
    });

    /* Обчислюємо середнє значення критерію та середнє значення критерію у робочій області */
    const sum: number[] = [];
    const sumWorkingArea: number[] = [];
    criterionValues.forEach((criterionValue) => {
      sum.push(Math.max(...criterionValue.map(([key]) => key)));
      sumWorkingArea.push(
        Math.max(...criterionValue.map(([key, val]) => (val ? key : -10)))
      );
    });
    const currentValue: number = average(sumWorkingArea);

    /* Якщо середнє значення критерію у робочій області на даному кроці більше за поточне оптимальне, то запам'ятовуємо його та значення дельти */
    if (currentValue > optimalDeltaCriterionValue) {
      optimalDelta = delta;
      optimalDeltaCriterionValue = currentValue;
    }

    const criterionValue = average(sum);
    const criterionValueInWorkingArea =
      average(sumWorkingArea) > 0 ? average(sumWorkingArea) : -1;

    optimalDeltaData.push({
      delta,
      criterionValue,
      criterionValueInWorkingArea,
    });

    // eslint-disable-next-line no-console
    // console.log(delta, criterionValue, criterionValueInWorkingArea);
  }
  // eslint-disable-next-line no-console
  // console.log(`Optimal delta:`, optimalDelta);

  return { optimalDelta, optimalDeltaData };
}

/**
 * Метод для проведення екзамену на належність зображення до певного класу
 *
 * @param classVector  еталонний вектор класу на належність до якого відбувається екзамен
 * @param radius       радіус контейнера класу на належність до якого відбувається екзамен
 * @param binaryMatrix бінарна матриця зображення, для якого відбувається пошук класу
 * @return результат екзамену
 */
function exam(
  classVector: number[],
  radius: number,
  binaryMatrix: number[][]
): number {
  let sum = 0;
  binaryMatrix.forEach((aBinaryMatrix) => {
    sum += 1 - getDistanceBetweenVectors(classVector, aBinaryMatrix) / radius;
  });

  return sum / binaryMatrix.length;
}

/**
 * Метод для класифікації областей зображення
 *
 * @param imageName    ім'я зображення для класифікації
 * @param colors       масив кольорів для класів
 * @param areaSize     розмір області для класифікації (повинна дорівнювати стороні квадрата зображення класу)
 * @param delta        значення дельти для СКД
 * @param limitVector  вектор, який задає СКД
 * @param classVectors еталонні вектори кожного класу
 * @param radii        радіуси контейнерів кожного класу
 * @throws IOException
 */
export async function classifyImage(
  imageName: string,
  areaSize: number,
  delta: number,
  limitVector: number[],
  classVectors: number[][],
  radii: number[]
) {
  const image = await getImageContext(imageName);
  image.font = 'bold 18pt Arial';

  const cropCanvas = document.createElement('canvas');
  cropCanvas.height = areaSize;
  cropCanvas.width = areaSize;
  const crop = cropCanvas.getContext('2d')!;

  // BufferedImage image = ImageIO.read(new File(imageName));
  // Graphics g = image.getGraphics();
  // Font font = new Font("Arial", Font.BOLD, 18);
  /* Проходимо по всім квадратним областям зі стороною areaSize у зображенні, яке потрібно класифікувати */
  for (let i = 0; i < image.canvas.width; i += areaSize) {
    for (let j = 0; j < image.canvas.height; j += areaSize) {
      /* Вирізаємо квадратну область, перетворюємо її у бінарну матрицю та проводимо екзамен */
      // context.drawImage(
      //   sourceImage,  // the source image to clip from
      //   sX,           // the left X position to start clipping
      //   sY,           // the top Y position to start clipping
      //   sW,           // clip this width of pixels from the source
      //   wH,           // clip this height of pixels from the source
      //   dX,           // the left X canvas position to start drawing the clipped sub-image
      //   dY,           // the top Y canvas position to start drawing the clipped sub-image
      //   dW,           // scale sW to dW and draw a dW wide sub-image on the canvas
      //   dH            // scale sH to dH and draw a dH high sub-image on the canvas
      // }
      // crop.drawImage(image.canvas, -i, -j, areaSize, areaSize);
      crop.drawImage(
        image.canvas,
        i,
        j,
        areaSize,
        areaSize,
        0,
        0,
        areaSize,
        areaSize
      );

      // BufferedImage crop = image.getSubimage(i, j, areaSize, areaSize);
      // eslint-disable-next-line no-await-in-loop
      const cropValues: number[][] = await imgToArray(crop);
      const cropBinaryMatrix: number[][] = getBinaryMatrix(
        cropValues,
        limitVector,
        delta
      );
      let classNumber = -1;
      let classValue = 0;

      /* Проводимо екзамен області відносно кожного класу */
      for (let k = 0; k < classVectors.length; k += 1) {
        const res = exam(classVectors[k], radii[k], cropBinaryMatrix);
        /* Якщо значення після екзамену більше за поточне значення, то відносимо область до цього класу */
        if (res > classValue) {
          classNumber = k;
          classValue = res;
        }
      }

      /* Якщо вдалося класифікувати область, то помічаємо її на вихідному зображенні відповідним номером та кольором */
      if (classNumber !== -1) {
        const color = COLORS[classNumber];
        // AttributedString attributedText = new AttributedString(String.valueOf(classNumber));
        // attributedText.addAttribute(TextAttribute.FONT, font);
        // attributedText.addAttribute(TextAttribute.FOREGROUND, colors.get(classNumber));
        // g.drawString(attributedText.getIterator(), i + areaSize / 2, j + areaSize / 2);
        image.fillStyle = color;
        image.fillText(`${classNumber}`, i + areaSize / 2, j + areaSize / 2);

        // g.setColor(colors.get(classNumber));
        // g.drawRect(i + 1, j + 1, areaSize - 1, areaSize - 1);
        image.strokeStyle = color;
        // image.lineWidth = 1;
        image.strokeRect(i + 1, j + 1, areaSize - 1, areaSize - 1);
      }
    }
  }

  // /* Зберігаємо зображення після класифікації */
  // ImageIO.write(
  //   image,
  //   'jpg',
  //   new File(
  //     String.format(
  //       RESULT_NAME_TEMPLATE,
  //       RESULT_DATE_FORMAT.format(new Date()),
  //       imageName
  //     )
  //   )
  // );
  const resultUrl = image.canvas.toDataURL('image/jpg');

  return resultUrl;
}
