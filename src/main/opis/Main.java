package com.mishchenko;

import java.awt.*;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        List<String> classesImagesNames = Arrays.asList("heart_sand.jpg", "heart_forest.jpg", "heart_water2.jpg");
        // List<String> classesImagesNames = Arrays.asList("forest.jpg", "road.jpg", "field.jpg", "field2.jpg");
        List<Color> colors = Arrays.asList(Color.BLUE, Color.ORANGE, Color.RED, Color.BLACK);

        IEITCartesianCoordinates.launch("heart_700x700.jpg", classesImagesNames, colors, 50);
        // IEITCartesianCoordinates.launch("Phantom_article_cloudy_photo_nadir_cropped.jpg", classesImagesNames, colors, 51);
    }
}
