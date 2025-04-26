# OCR

OCR Web UI.

### Running the Server

```bash
docker-compose up -d
```

The server will be available at http://localhost:8884

### API Usage

Send OCR requests to the server:

```bash
curl -F "options={\"languages\":[\"eng\"]}" -F file=@your-image.jpg http://localhost:8884/tesseract
```

### Available Languages

The default image includes the following languages:
- English
- German
- French
- Georgian
- Polish
- Russian

For more information, see the [tesseract-server documentation](https://github.com/hertzg/tesseract-server).

