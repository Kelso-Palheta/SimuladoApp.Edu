"""Auth middleware scaffold.

MVP1: Simple header-based auth (professor_id in X-Professor-Id header).
MVP2: JWT-based authentication.
"""

import logging

from fastapi import Header, HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

PUBLIC_PATHS = ["/api/health", "/api/docs", "/api/openapi.json", "/redoc", "/docs/oauth2-redirect"]


async def get_professor_id(x_professor_id: str = Header(default="prof-123")) -> str:
    """Dependency: extract professor_id from header (MVP1)."""
    if not x_professor_id.strip():
        raise HTTPException(status_code=401, detail="X-Professor-Id header required")
    return x_professor_id.strip()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response
