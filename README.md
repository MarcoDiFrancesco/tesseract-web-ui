## Docker quick-start

```bash
docker-compose up
```

http://localhost:8884

Spins up the **Docker containers** for:
- *paddle server*: uses docker image from *hertzg/tesseract-server*
- *nginx server*: to expose the *paddle server* and the web pages in /web

Uses nginx to expose the endpoint to the *tesseract server* and the web pages in */web*.

## Setup dev environment

API:

```sh
python3.13 -m venv .venv
source .venv/bin/activate
pip install setuptools
pip install -r api/requirements.txt
cd api
fastapi dev
```

http://localhost:8080/docs/
