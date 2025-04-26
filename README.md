# Tesseract Web UI

Spins up the **Docker containers** for:
- *tesseract server*: uses docker image from *hertzg/tesseract-server*
- *nginx server*: to expose the *tesseract server* and the web pages in /web

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

Uses nginx to expose the endpoint to the *tesseract server* and the web pages in */web*.

```bash
docker-compose up -d
```

Web page: http://localhost:8080/
