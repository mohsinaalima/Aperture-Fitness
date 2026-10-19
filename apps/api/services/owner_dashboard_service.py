from typing import List
from repositories.owner_dashboard_repository import OwnerDashboardRepository
from models.account_flows import GymMembershipStatus, GymRole
from schemas.owner_dashboard import (
    DashboardDataResponse,
    DashboardMetricsResponse,
    TrainerRosterItem,
)

class OwnerDashboardService:
    def __init__(self, repository: OwnerDashboardRepository):
        self.repository = repository

    async def get_dashboard_overview(self, gym_id) -> DashboardDataResponse:
        people = await self.repository.get_gym_people(gym_id)
        roster_items: List[TrainerRosterItem] = []
        trainers_count = 0
        for membership, user, profile in people:
            is_trainer = membership.role == GymRole.TRAINER
            trainers_count += int(is_trainer)
            assigned_clients = await self.repository.count_active_trainer_clients(profile.id) if profile else 0
            roster_items.append(
                TrainerRosterItem(
                    id=str(membership.id),
                    name=user.name,
                    specialization=(profile.business_name if profile and profile.business_name else ("Trainer" if is_trainer else "Staff")),
                    presentToday=False,
                    checkInTime="—",
                    assignedClients=assigned_clients,
                    feeStatus="Invited" if membership.status == GymMembershipStatus.INVITED else "Active",
                    monthlyRevenue="$0",
                )
            )
        active_members = await self.repository.count_active_members(gym_id)
        metrics = DashboardMetricsResponse(
            totalTrainers=trainers_count,
            presentToday=0,
            attendancePercentage=0.0,
            paidCount=0,
            pendingInvoicesCount=0,
            totalManagedMembers=active_members,
        )

        return DashboardDataResponse(metrics=metrics, roster=roster_items)
