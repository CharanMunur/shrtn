package com.example.demo.service;

import com.google.zxing.EncodeHintType;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.google.zxing.qrcode.encoder.ByteMatrix;
import com.google.zxing.qrcode.encoder.Encoder;
import com.google.zxing.qrcode.encoder.QRCode;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;
import javax.imageio.ImageIO;
import org.springframework.stereotype.Service;

@Service
public class QrService {

    public byte[] generate(String url, int size) {
        try {
            // 1. Build hints map
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

            // 2. Encode to raw QRCode grid (e.g., 25x25 or 29x29 modules)
            QRCode qrCode = Encoder.encode(url, ErrorCorrectionLevel.H, hints);
            ByteMatrix matrix = qrCode.getMatrix();

            int matrixWidth = matrix.getWidth();
            int matrixHeight = matrix.getHeight();

            // Set margin (e.g., 2 modules wide)
            int margin = 2;
            int totalModules = matrixWidth + margin * 2;

            // Calculate the exact size of one module (block)
            double moduleSize = (double) size / totalModules;

            // 3. Create BufferedImage & get Graphics2D
            BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = image.createGraphics();

            try {
                // Enable anti-aliasing for smooth, high-quality curves
                g.setRenderingHint(
                    RenderingHints.KEY_ANTIALIASING,
                    RenderingHints.VALUE_ANTIALIAS_ON
                );

                // 4. Fill white background
                g.setColor(Color.WHITE);
                g.fillRect(0, 0, size, size);

                // Set color for the QR modules (black)
                g.setColor(Color.BLACK);

                // 5. Loop matrix and draw rounded modules
                for (int x = 0; x < matrixWidth; x++) {
                    for (int y = 0; y < matrixHeight; y++) {
                        if (matrix.get(x, y) == 1) {
                            // 1 means the module is "on" (black)
                            // Calculate pixel coordinates with margin padding
                            int px = (int) Math.round((x + margin) * moduleSize);
                            int py = (int) Math.round((y + margin) * moduleSize);
                            int pSize = (int) Math.ceil(moduleSize);

                            // Adjust the roundness (arc size)
                            // 30%-55% of the module size creates nice rounded corners.
                            // 100% of the module size makes them perfect circles (dots).
                            int arcSize = (int) (pSize * 0.45);

                            g.fillRoundRect(px, py, pSize, pSize, arcSize, arcSize);
                        }
                    }
                }
            } finally {
                g.dispose();
            }

            // 6. Write image as png
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR Code", e);
        }
    }
}
