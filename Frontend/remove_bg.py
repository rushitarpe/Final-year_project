from PIL import Image

def remove_background(input_path, output_path, tolerance=50):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        # Let's assume the top-left pixel is the background color we want to remove
        bg_color = datas[0]
        
        for item in datas:
            # Check if pixel is close to background color
            if (abs(item[0] - bg_color[0]) < tolerance and
                abs(item[1] - bg_color[1]) < tolerance and
                abs(item[2] - bg_color[2]) < tolerance):
                newData.append((255, 255, 255, 0)) # Fully transparent
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path}")
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == '__main__':
    # Using the logo in the public folder
    input_file = r"d:\Final Project\Frontend\public\logo.png"
    output_file = r"d:\Final Project\Frontend\public\logo.png" # Overwrite
    remove_background(input_file, output_file)
