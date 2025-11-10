#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# Directorios
source_dir = r"F:\2025\11\08\fiesta\SI\remini\descomprimidas"
output_dir = r"C:\Users\foro7\invitacion-alisson\photos"

# Crear directorio de salida si no existe
os.makedirs(output_dir, exist_ok=True)

# Obtener lista de fotos
photos = sorted([f for f in os.listdir(source_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

print(f"Encontradas {len(photos)} fotos para convertir...")

for i, photo_name in enumerate(photos, 1):
    try:
        # Abrir imagen
        input_path = os.path.join(source_dir, photo_name)
        img = Image.open(input_path)

        # Convertir a RGB si es necesario
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Crear objeto para dibujar
        draw = ImageDraw.Draw(img)

        # Calcular tamaño de la marca de agua basado en el tamaño de la imagen
        width, height = img.size
        font_size = max(int(height * 0.02), 12)  # 2% de la altura, mínimo 12px

        # Intentar cargar una fuente, si no usar la predeterminada
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", font_size)
            except:
                font = ImageFont.load_default()

        # Texto de la marca de agua
        watermark_text = "foro 7"

        # Obtener tamaño del texto usando textbbox
        bbox = draw.textbbox((0, 0), watermark_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Posición: esquina inferior derecha con margen
        margin = int(height * 0.01)  # 1% de margen
        x = width - text_width - margin
        y = height - text_height - margin

        # Dibujar sombra (para mejor visibilidad)
        shadow_offset = max(1, int(font_size * 0.05))
        draw.text((x + shadow_offset, y + shadow_offset), watermark_text, font=font, fill=(0, 0, 0, 128))

        # Dibujar texto principal en blanco semi-transparente
        draw.text((x, y), watermark_text, font=font, fill=(255, 255, 255, 200))

        # Guardar como webp con calidad alta
        output_name = f"foto_{i:04d}.webp"
        output_path = os.path.join(output_dir, output_name)
        img.save(output_path, 'WEBP', quality=85)

        if i % 10 == 0:
            print(f"Procesadas {i}/{len(photos)} fotos...")

    except Exception as e:
        print(f"Error procesando {photo_name}: {e}")

print(f"\n¡Conversión completada! {len(photos)} fotos convertidas a webp con marca de agua.")
