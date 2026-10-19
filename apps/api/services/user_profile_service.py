from datetime import date
from models.user import User
from repositories.user_profile_repository import UserProfileRepository
from models.user_profile import UserProfile
from schemas.user_profile import (
    ProfileResponse,
    SystemPreferencesSchema,
    SubscriptionBillingSchema,
    UpdatePreferencesRequest,
)


class UserProfileService:
    def __init__(self, repository: UserProfileRepository):
        self.repository = repository

    def _build_response(self, user: UserProfile) -> ProfileResponse:
        renewal_str = user.renewal_date.strftime("%b %d, %Y") if user.renewal_date else "—"
        price_str = f"${user.monthly_price:.2f} / mo"

        return ProfileResponse(
            id=user.id,
            fullName=user.full_name,
            email=user.email,
            initials=user.initials,
            membershipTier=user.membership_tier,
            preferences=SystemPreferencesSchema(
                unitSystem=user.unit_system,
                unitDescription=user.unit_description,
                restIntervalSeconds=user.rest_interval_seconds,
            ),
            billing=SubscriptionBillingSchema(
                planName=user.plan_name,
                renewalDateFormatted=f"Renews automatically on {renewal_str}",
                monthlyPriceFormatted=price_str,
            ),
        )

    async def get_profile(self, account: User) -> ProfileResponse:
        user = await self.repository.get_by_email(account.email)
        
        if not user:
            user = UserProfile(
                full_name=account.name,
                email=account.email,
                initials="".join(part[0] for part in account.name.split()[:2]).upper() or "AF",
                membership_tier="PRO MEMBER",
                unit_system="Metric (KG)",
                unit_description="Kilograms (kg) with 2.5kg steppers",
                rest_interval_seconds=90,
                plan_name="Aperture Pro Tier",
                renewal_date=date(2026, 9, 15),
                monthly_price=12.00,
            )
            user = await self.repository.create_user(user)

        return self._build_response(user)

    async def update_preferences(self, request: UpdatePreferencesRequest, account: User) -> ProfileResponse:
        user = await self.repository.get_by_email(account.email)
        if not user:
            raise ValueError("User profile not found")

        if request.unitSystem is not None:
            user.unit_system = request.unitSystem
            if "Imperial" in request.unitSystem or "LBS" in request.unitSystem:
                user.unit_description = "Pounds (lbs) with 5lb steppers"
            else:
                user.unit_description = "Kilograms (kg) with 2.5kg steppers"

        if request.restIntervalSeconds is not None:
            user.rest_interval_seconds = request.restIntervalSeconds

        updated_user = await self.repository.update_user(user)
        return self._build_response(updated_user)
