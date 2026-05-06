from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import dspy
from collections import namedtuple
from dotenv import load_dotenv
import os

load_dotenv()

lm = dspy.LM(
    api_base=os.getenv("OPENAI_URL"),
    api_key="local",
    max_tokens=32000,
    temperature=0.1,
    stream=False
)
dspy.configure(lm=lm)

class Task(BaseModel):
    formulation: str = Field(..., description="")
    responsible_executors: str = Field(..., description="")
    deadline: Optional[str] = Field(None, pattern="", description="")
    item_number: Optional[str] = Field(None, description="")

Task = namedtuple('Task', ['formulation', 'responsible_executors', 'deadline', 'item_number'])

prompt = os.getenv("INSTRUCTIONS")

# промпт = """Extract the formulations of the tasks, their responsible executors, associated deadlines, and item numbers from the document. Responsible executors can be represented as the names of departments or persons. If you are unsure about any field, leave it empty. Format all dates as yyyy-mm-dd."""

class ExtractSignature(dspy.Signature):
    __doc__ = prompt
    document: str = dspy.InputField()
    tasks: List[Task] = dspy.OutputField()

ExtractionTasks = dspy.Predict(ExtractSignature)

# --- добавить FastAPI  ---
