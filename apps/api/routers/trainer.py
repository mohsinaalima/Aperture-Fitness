from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from apps.api.schemas.trainer import ClientResponse, ClientCreate, ClientUpdate
from apps.api.services.trainer_service import TrainerService

from apps.api.main import get_db

router = APIRouter(prefix="/trainer", tags=["Trainer Workspace"])


@router.get("/clients", response_model=List[ClientResponse])
async def get_roster(db: AsyncSession = Depends(get_db)):
    """Fetch all clients for trainer workspace roster."""
    return await TrainerService.get_clients(db)


@router.get("/clients/{client_id}", response_model=ClientResponse)
async def get_client_details(client_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch single client details for the detail drawer."""
    client = await TrainerService.get_client_by_id(db, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )
    return client


@router.post("/clients", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def add_client(client_in: ClientCreate, db: AsyncSession = Depends(get_db)):
    """Add a new client to roster."""
    return await TrainerService.create_client(db, client_in)


@router.patch("/clients/{client_id}", response_model=ClientResponse)
async def update_client_info(
    client_id: str, client_in: ClientUpdate, db: AsyncSession = Depends(get_db)
):
    """Update assigned plan or compliance status."""
    client = await TrainerService.get_client_by_id(db, client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Client not found"
        )
    return await TrainerService.update_client(db, client, client_in)


@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_data(db: AsyncSession = Depends(get_db)):
    """Seed initial demo client roster into Neon DB."""
    await TrainerService.seed_initial_roster(db)
    return {"message": "Roster successfully seeded."}