FROM python:3.13
WORKDIR /app

RUN apt-get update && apt-get install -y libgl1-mesa-glx

COPY requirements.txt .
RUN pip install --no-cache-dir setuptools
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python scripts only
COPY app.py .
COPY inference.py .

CMD ["fastapi", "run", "app.py", "--port", "8884"]
