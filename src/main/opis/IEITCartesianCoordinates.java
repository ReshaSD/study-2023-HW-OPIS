package com.mishchenko;

import javafx.util.Pair;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.font.TextAttribute;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.AttributedString;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.IntStream;

public class IEITCartesianCoordinates {
    private static String RESULT_NAME_TEMPLATE = "result_%s_%s";
    private static SimpleDateFormat RESULT_DATE_FORMAT = new SimpleDateFormat("ddMMyy_HHmm");

    public static void launch(String imageName, List<String> classesImagesNames, List<Color> colors, int areaSize) throws IOException {
        /* Отримуємо значення кольорів пікселів для зображень кожного класу */
        List<int[][]> classesValues = getClassesValues(classesImagesNames);

        /* Знаходимо оптимальне значення дельти для СКД */
        int delta = getOptimalDelta(classesValues);

        /* Переводимо значення у бінарний вигляд та знаходимо еталонні вектори кожного класу */
        List<int[][]> classBinaryMatrices = new LinkedList<>();
        int[][] classVectors = new int[classesValues.size()][];
        List<Double> limitVector = getLimitVector(classesValues.get(0));
        for (int i = 0; i < classesValues.size(); i++) {
            int[][] classBinaryMatrix = getBinaryMatrix(classesValues.get(i), limitVector, delta);
            classBinaryMatrices.add(classBinaryMatrix);
            classVectors[i] = getVectorFromBinaryMatrix(classBinaryMatrix);
        }

        /* Знаходимо радіуси контейнера кожного класу */
        List<Integer> radii = getRadii(classVectors, classBinaryMatrices);
        System.out.println("Optimal radii: " + radii);

        /* Класифікуємо зображення (екзамен) */
        classifyImage(imageName, colors, areaSize, delta, limitVector, classVectors, radii);
    }

    /**
     * Метод для отримання значень кольорів пікселів для зображень кожного класу
     *
     * @param classesImagesNames список імен зображень класів
     * @return список масивів, які містять значення кольорів пікселів класу
     * @throws IOException
     */
    private static List<int[][]> getClassesValues(List<String> classesImagesNames) throws IOException {
        List<int[][]> classesValues = new LinkedList<>();
        for (String classImageName : classesImagesNames) {
            classesValues.add(IEITCartesianCoordinates.imgToArray(classImageName));
        }

        return classesValues;
    }

    /**
     * Метод для отримання оптимальні радіуси для кожного класу
     *
     * @param classVectors        еталонні вектори кожного класу
     * @param classBinaryMatrices бінарні матриці класів
     * @return список радіусів контейнерів усіх класів
     */
    private static List<Integer> getRadii(int[][] classVectors, List<int[][]> classBinaryMatrices) {
        /* Знаходимо сусідні класи */
        int[][] pairs = makePairs(classVectors);
        /* Знаходимо значення критерію для можливих значень радіусів */
        List<List<Pair<Double, Boolean>>> criterionValues = new LinkedList<>();
        criterionValues.addAll(getCriterionValuesForClassesAndRadii(classVectors, classBinaryMatrices, pairs));
        /* Знаходимо оптимальні радіуси */
        List<Integer> radii = new LinkedList<>();
        System.out.println("Calculation of radii for classes");
        for (int i = 0; i < criterionValues.size(); i++) {
            System.out.println("Class number: " + i);
            System.out.println("Is working area | radius | criterion value");
            List<Pair<Double, Boolean>> res = criterionValues.get(i);
            int index = -1;
            double value = -1;
            /* Проходимо по всім можливив значенням радіуса */
            for (int j = 0; j < res.size(); j++) {
                System.out.println(res.get(j).getValue() + " " + j + " " + res.get(j).getKey());
                /* Якщо значення критерію у робочій області для даного радіуса більше за поточне оптимальне, то запам'ятовуємо його та значення радіуса */
                if (res.get(j).getValue() && res.get(j).getKey() >= value) {
                    value = res.get(j).getKey();
                    index = j;
                }
            }
            radii.add(index);
        }

        return radii;
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
    private static void classifyImage(String imageName, List<Color> colors, int areaSize, int delta, List<Double> limitVector, int[][] classVectors,
                                      List<Integer> radii) throws IOException {
        BufferedImage image = ImageIO.read(new File(imageName));
        Graphics g = image.getGraphics();
        Font font = new Font("Arial", Font.BOLD, 18);
        /* Проходимо по всім квадратним областям зі стороною areaSize у зображенні, яке потрібно класифікувати */
        for (int i = 0; i < image.getWidth(); i += areaSize) {
            for (int j = 0; j < image.getHeight(); j += areaSize) {
                try {
                    /* Вирізаємо квадратну область, перетворюємо її у бінарну матрицю та проводимо екзамен */
                    BufferedImage crop = image.getSubimage(i, j, areaSize, areaSize);
                    int[][] cropValues = imgToArray(crop);
                    int[][] cropBinaryMatrix = getBinaryMatrix(cropValues, limitVector, delta);
                    int classNumber = -1;
                    double classValue = 0;
                    /* Проводимо екзамен області відносно кожного класу */
                    for (int k = 0; k < classVectors.length; k++) {
                        double res = exam(classVectors[k], radii.get(k), cropBinaryMatrix);
                        /* Якщо значення після екзамену більше за поточне значення, то відносимо область до цього класу */
                        if (res > classValue) {
                            classNumber = k;
                            classValue = res;
                        }
                    }
                    /* Якщо вдалося класифікувати область, то помічаємо її на вихідному зображенні відповідним номером та кольором */
                    if (classNumber != -1) {
                        AttributedString attributedText = new AttributedString(String.valueOf(classNumber));
                        attributedText.addAttribute(TextAttribute.FONT, font);
                        attributedText.addAttribute(TextAttribute.FOREGROUND, colors.get(classNumber));
                        g.drawString(attributedText.getIterator(), i + areaSize / 2, j + areaSize / 2);
                        g.setColor(colors.get(classNumber));
                        g.drawRect(i + 1, j + 1, areaSize - 1, areaSize - 1);
                    }
                } catch (Exception e) {
                    System.out.println(e.getMessage());
                }
            }
        }
        /* Зберігаємо зображення після класифікації */
        ImageIO.write(image, "jpg", new File(String.format(RESULT_NAME_TEMPLATE, RESULT_DATE_FORMAT.format(new Date()), imageName)));
    }

    /**
     * Метод для отримання оптимального значення дельти для СКД
     *
     * @param classesValues значення кольорів пікселів для зображень кожного класу
     * @return оптимальне значення дельти для СКД
     */
    private static int getOptimalDelta(List<int[][]> classesValues) {
        int optimalDelta = 0;
        double optimalDeltaCriterionValue = 0;
        /* Шукаємо оптимальне значення у інтервалі [1, 120] */
        System.out.println("Calculation of the optimal delta");
        System.out.println("Delta | criterion value | criterion value in working area");
        for (int delta = 1; delta <= 120; delta++) {
            /* Розраховуємо вектор, який задає СКД, бінарні матриці та еталонні вектори кожного класу */
            List<int[][]> classBinaryMatrices = new LinkedList<>();
            int[][] classVectors = new int[classesValues.size()][];
            List<Double> limitVector = getLimitVector(classesValues.get(0));
            for (int i = 0; i < classesValues.size(); i++) {
                int[][] classBinaryMatrix = getBinaryMatrix(classesValues.get(i), limitVector, delta);
                classBinaryMatrices.add(classBinaryMatrix);
                classVectors[i] = getVectorFromBinaryMatrix(classBinaryMatrix);
            }
            /* Шукаємо сусідів класів */
            int[][] pairs = makePairs(classVectors);
            List<List<Pair<Double, Boolean>>> criterionValues = new LinkedList<>();
            /* Для кожного класу знаходимо значення критеріїв */
            IntStream.range(0, classVectors.length).forEach(
                    classNumber -> criterionValues.addAll(getCriterionValuesForClassesAndRadii(classVectors, classBinaryMatrices, pairs))
            );

            /* Обчислюємо середнє значення критерію та середнє значення критерію у робочій області */
            List<Double> sum = new LinkedList<>();
            List<Double> sumWorkingArea = new LinkedList<>();
            for (List<Pair<Double, Boolean>> criterionValue : criterionValues) {
                sum.add(criterionValue.stream().mapToDouble(Pair::getKey).max().getAsDouble());
                sumWorkingArea.add(criterionValue.stream().mapToDouble(pair -> pair.getValue() ? pair.getKey() : -10).max().getAsDouble());
            }
            double currentValue = sumWorkingArea.stream().mapToDouble(Double::doubleValue).average().getAsDouble();
            /* Якщо середнє значення критерію у робочій області на даному кроці більше за поточне оптимальне, то запам'ятовуємо його та значення дельти */
            if (currentValue > optimalDeltaCriterionValue) {
                optimalDelta = delta;
                optimalDeltaCriterionValue = currentValue;
            }

            System.out.println(delta + " " + sum.stream().mapToDouble(Double::doubleValue).average().getAsDouble()
                    + " " + (sumWorkingArea.stream().mapToDouble(Double::doubleValue).average().getAsDouble() > 0 ? sumWorkingArea.stream().mapToDouble(Double::doubleValue).average().getAsDouble() : -1));

        }
        System.out.println("Optimal delta: " + optimalDelta);

        return optimalDelta;
    }

    /**
     * Метод для обчислення значення критерію для класів та радіусів їх контейнера
     *
     * @param classVectors        еталонні вектори кожного класу
     * @param classBinaryMatrices бінарні матриці класів
     * @param pairs               сусідні класи
     * @return значення критерію для класів та радіусів їх контейнера
     */
    private static List<List<Pair<Double, Boolean>>> getCriterionValuesForClassesAndRadii(int[][] classVectors,
                                                                                          List<int[][]> classBinaryMatrices,
                                                                                          int[][] pairs) {
        List<List<Pair<Double, Boolean>>> criterionValues = new LinkedList<>();
        for (int[] classVector : classVectors) {
            criterionValues.add(new LinkedList<>());
        }
        /* Обчислюємо значення критерію для радіусів у інтервалі [0, 60] */
        IntStream.range(0, classVectors.length).forEach(
                classNumber -> IntStream.range(0, 61).forEach(
                        radius -> {
                            /* Перша достовірність */
                            double d1 = getDistancesBetweenVectorAndBinaryMatrix(classVectors[classNumber],
                                    classBinaryMatrices.get(classNumber))
                                    .stream()
                                    .mapToInt(i -> i <= radius ? 1 : 0)
                                    .average()
                                    .getAsDouble();
                            double alpha = 1 - d1;
                            /* Помилка другого роду */
                            double beta = getDistancesBetweenVectorAndBinaryMatrix(classVectors[classNumber],
                                    classBinaryMatrices.get(pairs[classNumber][0]))
                                    .stream()
                                    .mapToInt(i -> i <= radius ? 1 : 0)
                                    .average()
                                    .getAsDouble();
                            /* Обчислюємо значення критерію*/
                            double criterionValue = calculateCriterion(alpha, beta);
                            /* Якщо перша достовірність >= 0.5, а помилка другого роду < 0.5, то це значення знаходиться у робочій області */
                            boolean isWorkingArea = (d1 >= 0.5 && beta < 0.5);
                            criterionValues.get(classNumber).add(new Pair<>(criterionValue, isWorkingArea));
                        }
                )
        );

        return criterionValues;
    }

    /**
     * Метод для проведення екзамену на належність зображення до певного класу
     *
     * @param classVector  еталонний вектор класу на належність до якого відбувається екзамен
     * @param radius       радіус контейнера класу на належність до якого відбувається екзамен
     * @param binaryMatrix бінарна матриця зображення, для якого відбувається пошук класу
     * @return результат екзамену
     */
    private static double exam(int[] classVector, int radius, int[][] binaryMatrix) {
        double sum = 0;
        for (int[] aBinaryMatrix : binaryMatrix) {
            sum += 1 - (double) getDistanceBetweenVectors(classVector, aBinaryMatrix) / radius;
        }

        return sum / binaryMatrix.length;
    }

    /**
     * Метод для пошуку сусідів кожного класу
     *
     * @param classVectors еталонні вектори кожного класу
     * @return сусідів кожного класу
     */
    private static int[][] makePairs(int[][] classVectors) {
        int[][] pairs = new int[classVectors.length][2];
        int valueToSet = classVectors[0].length + 1;
        for (int[] pair : pairs) {
            Arrays.fill(pair, valueToSet);
        }
        for (int i = 0; i < classVectors.length; i++) {
            for (int j = 0; j < classVectors.length; j++) {
                if (i != j) {
                    int distance = getDistanceBetweenVectors(classVectors[i], classVectors[j]);
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
     * Метод для розрахунку критерію
     *
     * @param alpha помилка першого роду
     * @param beta  помилка другого роду
     * @return значення критерію
     */
    private static double calculateCriterion(double alpha, double beta) {
        return calculateKullback(alpha, beta) / calculateKullback(0, 0);
    }

    /**
     * Метод для розрахунку критерію Кульбака
     *
     * @param alpha помилка першого роду
     * @param beta  помилка другого роду
     * @return значення критерію Кульбака
     */
    private static double calculateKullback(double alpha, double beta) {
        return (Math.log((2 - (alpha + beta) + 0.1) / (alpha + beta + 0.1)) / Math.log(2)) * (1 - (alpha + beta));
    }

    /**
     * Метод для пошуку відстаней між вектором та рядками бінарної матриці
     *
     * @param vector       вектор
     * @param binaryMatrix бінарна матриця
     * @return відстані між вектором та рядками бінарної матриці
     */
    private static List<Integer> getDistancesBetweenVectorAndBinaryMatrix(int[] vector, int[][] binaryMatrix) {
        List<Integer> distances = new LinkedList<>();
        for (int[] binaryMatrixVector : binaryMatrix) {
            distances.add(getDistanceBetweenVectors(vector, binaryMatrixVector));
        }

        return distances;
    }

    /**
     * Метод для пошуку відстаней між двома векторами
     *
     * @param firstVector  перший вектор
     * @param secondVector другий вектор
     * @return відстань між двома векторами
     */
    private static int getDistanceBetweenVectors(int[] firstVector, int[] secondVector) {
        int distance = 0;
        for (int i = 0; i < firstVector.length; i++) {
            if (firstVector[i] != secondVector[i]) {
                distance++;
            }
        }

        return distance;
    }

    /**
     * Метод для отримання значеннь кольорів пікселів зображення
     *
     * @param imagePath шлях до зображення
     * @return значення кольорів пікселів зображення
     * @throws IOException
     */
    private static int[][] imgToArray(String imagePath) throws IOException {
        BufferedImage image = ImageIO.read(new File(imagePath));

        return imgToArray(image);
    }

    /**
     * Метод для отримання значеннь кольорів пікселів зображення
     *
     * @param image об'єкт зображення
     * @return значення кольорів пікселів зображення
     * @throws IOException
     */
    private static int[][] imgToArray(BufferedImage image) {
        int imageWidth = image.getWidth();
        int imageHeight = image.getHeight();
        int[][] values = new int[imageHeight][imageWidth * 3];
        for (int i = 0; i < imageHeight; i++) {
            for (int j = 0; j < imageWidth; j++) {
                Color color = new Color(image.getRGB(j, i));
                values[i][j] = color.getRed();
                values[i][j + imageWidth] = color.getGreen();
                values[i][j + imageWidth * 2] = color.getBlue();
            }
        }

        return values;
    }

    /**
     * Метод для перетворення значень кольорів зображення у бінарний вигляд відносно СКД
     *
     * @param values      значення кольорів зображення, яке необхідно перетворити у бінарну матрицю
     * @param limitVector вектор, який задає СКД
     * @param delta       значення дельти для СКД
     * @return бінарну матрицю зображення
     */
    private static int[][] getBinaryMatrix(int[][] values, List<Double> limitVector, int delta) {
        int[][] binaryMatrix = new int[values.length][values[0].length];
        for (int i = 0; i < values.length; i++) {
            for (int j = 0; j < values[0].length; j++) {
                if (values[i][j] >= limitVector.get(j) - delta && values[i][j] <= limitVector.get(j) + delta) {
                    binaryMatrix[i][j] = 1;
                } else {
                    binaryMatrix[i][j] = 0;
                }

            }
        }

        return binaryMatrix;
    }

    /**
     * Метод для отримання вектора, який задає СКД
     *
     * @param values значення кольорів базового класу
     * @return вектор, який задає СКД
     */
    private static List<Double> getLimitVector(int[][] values) {
        List<Double> limitVector = new LinkedList<>();
        for (int i = 0; i < values[0].length; i++) {
            double sum = 0;
            for (int[] row : values) {
                sum += row[i];
            }
            limitVector.add(sum / values.length);
        }

        return limitVector;
    }

    /**
     * Метод для отримання еталонного вектора із бінарної матриці класу
     *
     * @param binaryMatrix бінарна матриця класу, для якого необхідно знайти еталонний вектор
     * @return еталонний вектор класу
     */
    private static int[] getVectorFromBinaryMatrix(int[][] binaryMatrix) {
        int[] vector = new int[binaryMatrix[0].length];
        for (int i = 0; i < binaryMatrix[0].length; i++) {
            int sum = 0;
            for (int[] row : binaryMatrix) {
                sum += row[i];
            }
            vector[i] = (int) (Math.round((double) sum / binaryMatrix.length));
        }

        return vector;
    }
}
