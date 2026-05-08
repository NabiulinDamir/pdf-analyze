FROM pytorch/pytorch:2.9.1-cuda12.6-cudnn9-runtime

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
    
WORKDIR /app

COPY ./ ./

RUN pip install marker-pdf==1.10.1
RUN pip install uvicorn fastapi python-multipart

RUN marker_single example.pdf

CMD ["marker_server", "--host", "0.0.0.0", "--port", "7774"]
