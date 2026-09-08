from datetime import date, datetime
from typing import List, Optional
from repositories.owner_dashboard_repository import OwnerDashboardRepository
from models.owner_dashboard import Trainer, AttendanceLog, FeeInvoice
from schemas.owner_dashboard import (
    DashboardDataResponse,
    DashboardMetricsResponse,
    TrainerRosterItem,
    InviteTrainerRequest,
)

class OwnerDashboardService:
    def __init__(self, repository: OwnerDashboardRepository):
        self.repository = repository

    async def get_dashboard_overview(self) -> DashboardDataResponse:
        today = date.today()
        current_period = today.strftime("%Y-%m")

        trainers = await self.repository.get_all_active_trainers()
        attendance_logs = await self.repository.get_today_attendance(today)
        invoices = await self.repository.get_current_month_invoices(current_period)

        attendance_map = {log.trainer_id: log for log in attendance_logs}
        invoice_map = {inv.trainer_id: inv for inv in invoices}

        roster_items: List[TrainerRosterItem] = []
        total_clients = 0
        present_count = 0
        paid_count = 0
        pending_count = 0

        for trainer in trainers:
            log = attendance_map.get(trainer.id)
            inv = invoice_map.get(trainer.id)

            is_present = log.is_present if log else False
            check_in_str = "—"
            if log and log.check_in_time:
                check_in_str = log.check_in_time.strftime("%I:%M %p")

            if is_present:
                present_count += 1

            fee_status = inv.status if inv else "Paid"
            if fee_status == "Paid":
                paid_count += 1
            else:
                pending_count += 1

            total_clients += trainer.assigned_clients

            roster_items.append(
                TrainerRosterItem(
                    id=trainer.id,
                    name=trainer.name,
                    specialization=trainer.specialization,
                    presentToday=is_present,
                    checkInTime=check_in_str,
                    assignedClients=trainer.assigned_clients,
                    feeStatus=fee_status,
                    monthlyRevenue=f"${trainer.monthly_revenue:,.0f}",
                )
            )

        total_trainers = len(trainers)
        attendance_pct = (present_count / total_trainers * 100) if total_trainers > 0 else 0.0

        metrics = DashboardMetricsResponse(
            totalTrainers=total_trainers,
            presentToday=present_count,
            attendancePercentage=round(attendance_pct, 1),
            paidCount=paid_count,
            pendingInvoicesCount=pending_count,
            totalManagedMembers=total_clients,
        )

        return DashboardDataResponse(metrics=metrics, roster=roster_items)

    async def invite_trainer(self, request: InviteTrainerRequest) -> TrainerRosterItem:
        new_trainer = Trainer(
            name=request.name,
            specialization=request.specialization,
            assigned_clients=0,
            monthly_revenue=request.monthly_revenue,
        )
        saved_trainer = await self.repository.create_trainer(new_trainer)

        today = date.today()
        current_period = today.strftime("%Y-%m")

        invoice = FeeInvoice(
            trainer_id=saved_trainer.id,
            billing_period=current_period,
            amount=saved_trainer.monthly_revenue,
            status="Paid"
        )
        await self.repository.create_invoice(invoice)

        return TrainerRosterItem(
            id=saved_trainer.id,
            name=saved_trainer.name,
            specialization=saved_trainer.specialization,
            presentToday=False,
            checkInTime="—",
            assignedClients=saved_trainer.assigned_clients,
            feeStatus="Paid",
            monthlyRevenue=f"${saved_trainer.monthly_revenue:,.0f}",
        )