FROM kube.avid.ru:5000/python:3.12-bookworm

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "server_dspy_fastapi:app", "--host", "0.0.0.0", "--port", "7773", "--reload"]
