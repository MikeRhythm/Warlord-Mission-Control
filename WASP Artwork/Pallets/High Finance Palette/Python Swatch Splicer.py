import os
from PIL import Image

swatches_dir = r"C:\Warlord_Inc\Warlord_WASP\WASP Artwork\Pallets\High Finance Palette\High Finance Swatches"
assets_dir = r"C:\Warlord_Inc\Warlord_WASP\WASP Artwork\Pallets\High Finance Palette\High Finance Assets"

os.makedirs(assets_dir, exist_ok=True)

for filename in os.listdir(swatches_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
        img_path = os.path.join(swatches_dir, filename)
        base_name = os.path.splitext(filename)[0]
        palette_folder = os.path.join(assets_dir, base_name)
        os.makedirs(palette_folder, exist_ok=True)
        
        try:
            with Image.open(img_path).convert("RGB") as img:
                width, height = img.size
                
                # There are 4 columns across the master sheet
                cols = 4
                col_w = width / cols
                
                # We only want the very top row (first 1/8th of the height)
                row_h = height / 8
                
                for c in range(cols):
                    inset_x = int(col_w * 0.08)
                    inset_y = int(row_h * 0.08)
                    
                    left = int(c * col_w) + inset_x
                    upper = inset_y
                    right = int((c + 1) * col_w) - inset_x
                    lower = int(row_h) - inset_y
                    
                    cropped = img.crop((left, upper, right, lower))
                    
                    asset_name = f"base_color_row1_col{c+1}.png"
                    cropped.save(os.path.join(palette_folder, asset_name))
                        
            print(f"Successfully extracted top row base colors for: {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print("Top row base color extraction complete.")