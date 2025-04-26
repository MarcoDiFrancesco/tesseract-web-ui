# Tesseract Web UI

Spins up the **Docker containers** for:
- *tesseract server*: uses *hertzg/tesseract-server*
- *nginx server*: to expose the tesseract endpoint and the web pages

## Tesseract server

```bash
docker-compose up -d
```

Tesseract server: http://localhost:8884

Example:

```bash
curl -F "options={\"languages\":[\"eng\"]}" -F file=@test.png http://localhost:8884/tesseract
```

## Web Interface

**Uncomment** `ocr-web` in the docker compose.

```bash
docker-compose up -d
```

Web page: http://localhost:8080/
