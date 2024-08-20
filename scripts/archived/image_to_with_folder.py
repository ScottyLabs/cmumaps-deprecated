import os
import shutil


def create_parent_folders(root_dir):
    # Walk through all files and directories in root_dir
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            # Construct the full file path
            file_path = os.path.join(subdir, file)

            parent_dir = file_path.replace(".jpg", "")

            os.makedirs(parent_dir)

            new_file_path = os.path.join(parent_dir, file)
            shutil.move(file_path, new_file_path)


# Usage
root_directory = "scripts/imgs"  # Replace with the path to your folder
create_parent_folders(root_directory)
