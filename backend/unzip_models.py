import os
import glob
import zipfile

def combine_and_unzip(base_zip_name, output_dir):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    parts = sorted(glob.glob(os.path.join(backend_dir, f"{base_zip_name}.0*")))
    
    if not parts:
        print(f"No zip parts found for {base_zip_name}.")
        return False

    temp_zip = os.path.join(backend_dir, f"_temp_{base_zip_name}")
    print(f"Combining {len(parts)} parts for {base_zip_name}...")
    
    with open(temp_zip, 'wb') as outfile:
        for part in parts:
            print(f"  -> Reading {os.path.basename(part)}...")
            with open(part, 'rb') as infile:
                outfile.write(infile.read())
                
    print(f"Extracting {base_zip_name}...")
    with zipfile.ZipFile(temp_zip, 'r') as zipf:
        zipf.extractall(output_dir)
        
    if os.path.exists(temp_zip):
        os.remove(temp_zip)
    print(f"SUCCESS: Restored {base_zip_name} successfully!\n")
    return True

def auto_extract_if_needed():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    pth_path = os.path.join(backend_dir, "best_multimodal_model.pth")
    model_ta_path = os.path.join(backend_dir, "model_ta")

    if not os.path.exists(pth_path):
        combine_and_unzip("best_multimodal_model.zip", backend_dir)

    if not os.path.exists(model_ta_path):
        combine_and_unzip("model_ta.zip", backend_dir)

if __name__ == "__main__":
    auto_extract_if_needed()
