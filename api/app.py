from fastapi import FastAPI, UploadFile, File, HTTPException
from inference import extract_text


app = FastAPI(root_path="/api")


@app.get("/")
def index():
    return {"Welcome to the OCR API!": "Check out documentation at /api/docs"}


@app.post("/ocr")
def query_ocr(image: UploadFile = File(...)):
    """
    Process image with OCR and return extracted text.
    """
    if not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail=f"File '{image.filename}' is not an image."
        )

    extracted_text = extract_text(image)

    return {"text": extracted_text}
