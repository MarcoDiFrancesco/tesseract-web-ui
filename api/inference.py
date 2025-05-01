from paddleocr import PaddleOCR
import numpy as np
from PIL import Image
from fastapi import File
import io

# Need to run only once to load model into memory
ocr = PaddleOCR(
    lang="en",
    use_angle_cls=False,
)


def fastapi_image_to_numpy(image_file: File) -> np.array:
    contents = image_file.file.read()
    # Reset file pointer
    image_file.file.seek(0)
    # Convert to numpy array using PIL
    image = Image.open(io.BytesIO(contents))
    image_np = np.array(image)
    return image_np


def extract_text(image_file: File) -> str:
    """
    Use paddle paddle library to extract text:

    Test it on inference.ipynb
    """

    image_arr = fastapi_image_to_numpy(image_file)

    result = ocr.ocr(image_arr, cls=False, det=True, rec=True)

    text_lines = []
    for idx in range(len(result)):
        res = result[idx]

        # If line has no text, then it's None
        if not res:
            continue

        for line in res:
            _, (text, _) = line
            text_lines.append(text)

    extracted_text = "\n".join(text_lines)
    return extracted_text
