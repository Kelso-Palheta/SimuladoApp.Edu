from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers.planning import router as planning_router
from app.routers.calendar import router as calendar_router
from app.routers.class_ import router as class_router
from app.middleware.auth import SecurityHeadersMiddleware

app = FastAPI(title=settings.app_name, docs_url="/api/docs", openapi_url="/api/openapi.json")

app.include_router(planning_router)
app.include_router(calendar_router)
app.include_router(class_router)

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "environment": settings.environment}
