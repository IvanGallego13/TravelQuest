import sys
from google.cloud import vision
import os

client = vision.ImageAnnotatorClient()

def validate_image(image_path, keyword):
    with open(image_path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)
    response = client.label_detection(image=image)
    labels = [label.description.lower() for label in response.label_annotations]

    return "yes" if keyword.lower() in labels else "no"

if __name__ == "__main__":
    image_path = sys.argv[1]
    keyword = sys.argv[2]
    print(validate_image(image_path, keyword))
