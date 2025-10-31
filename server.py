from pathlib import Path

from flask import Flask, send_from_directory
from uvicorn.middleware.wsgi import WSGIMiddleware
import uvicorn


BASE_DIR = Path(__file__).resolve().parent

# Serve files from the project root so index.html can load sketch.js.
flask_app = Flask(
    __name__,
    static_folder=str(BASE_DIR),
    static_url_path="",
)


@flask_app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@flask_app.get("/sketch.js")
def serve_sketch():
    return send_from_directory(BASE_DIR, "sketch.js")


asgi_app = WSGIMiddleware(flask_app)


if __name__ == "__main__":
    uvicorn.run(asgi_app, host="0.0.0.0", port=8000, reload=False)
