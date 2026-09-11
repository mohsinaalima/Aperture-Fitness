from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import engine, Base
from routers import (
    about,
    analytics,
    auth,
    dashboard,
    exercises,
    owner_dashboard,
    plans,
    pricing,
    profile,
    trainer,
    users,
    workout_logger,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profile.router)
app.include_router(trainer.router)
app.include_router(about.router)
app.include_router(analytics.router)
app.include_router(dashboard.router)
app.include_router(exercises.router)
app.include_router(pricing.router)
app.include_router(workout_logger.router)
app.include_router(owner_dashboard.router)
app.include_router(plans.router, prefix="/api/v1")


@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health Checks"])
async def health_check():
    return {"status": "healthy"}