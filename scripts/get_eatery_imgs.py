import requests
import json
import os
from bs4 import BeautifulSoup


def download_image(img_url, location_name, save_dir):
    # Ensure the directory exists
    os.makedirs(save_dir, exist_ok=True)

    # Full path for saving the image
    file_path = os.path.join(save_dir, f"{location_name}.jpg")

    # Send a GET request to the image URL
    response = requests.get(img_url)

    # Check if the request was successful
    if response.status_code == 200:
        # Open a file in binary write mode and save the image content
        with open(file_path, "wb") as file:
            file.write(response.content)
        print(f"Image downloaded successfully and saved to {file_path}!")
    else:
        print(f"Failed to retrieve the image. Status code: {response.status_code}")


# main method:
x = requests.get("https://dining.apis.scottylabs.org/locations")

d = x.json()

urls = []
names = []
save_directory = "public/assets/location_images/eatery_images"

locations = d["locations"]
for location in locations:
    if (location["conceptId"]) == 88:
        # if "Tepper" in location["location"]:
        urls.append(location["url"])
        names.append(location["name"])

# create image, name pairs
# TODO: add name labels!!!

for i in range(len(urls)):
    url = urls[i]
    name = "-".join(names[i].lower().split(" "))

    # Send a GET request to the website
    response = requests.get(url)

    # Check if the request was successful
    if response.status_code == 200:
        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.content, "html.parser")

        # Find the div with class 'conceptImage'
        div_tag = soup.find("div", class_="conceptImage")

        if div_tag:
            # Find the image tag within the div
            img_tag = div_tag.find("img")

            if img_tag and "src" in img_tag.attrs:
                # Extract the 'src' attribute of the image tag
                img_url = img_tag["src"]

                download_image(img_url, name, save_directory)
            else:
                print("Image tag not found within the specified div.")
        else:
            print("Div with class 'conceptImage' not found.")
    else:
        print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
