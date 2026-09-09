from typing import List, Dict
from repositories.pricing_repository import PricingRepository
from models.pricing import PricingTier, Feature, TierFeatureMapping
from schemas.pricing import PricingTableResponse, TierHeaderSchema, FeatureRowSchema, CreateTierRequest

class PricingService:
    def __init__(self, repository: PricingRepository):
        self.repository = repository

    async def get_pricing_table(self) -> PricingTableResponse:
        tiers = await self.repository.get_all_tiers()
        features = await self.repository.get_all_features()
        mappings = await self.repository.get_all_mappings()

        mapping_dict: Dict[tuple[str, str], str] = {
            (m.feature_id, m.tier_id): m.value for m in mappings
        }

        tier_headers: List[TierHeaderSchema] = []
        for t in tiers:
            price_str = "$0 / Free" if t.price_monthly == 0 else f"${int(t.price_monthly)} / mo"
            tier_headers.append(
                TierHeaderSchema(
                    id=t.id,
                    slug=t.slug,
                    name=t.name,
                    priceFormatted=price_str,
                    isRecommended=t.is_recommended,
                    ctaLabel=t.cta_label,
                    ctaLink=t.cta_link
                )
            )

        feature_rows: List[FeatureRowSchema] = []
        for f in features:
            values_by_slug: Dict[str, str] = {}
            for t in tiers:
                val = mapping_dict.get((f.id, t.id), "—")
                values_by_slug[t.slug] = val
            
            feature_rows.append(
                FeatureRowSchema(
                    featureName=f.name,
                    values=values_by_slug
                )
            )

        return PricingTableResponse(tiers=tier_headers, features=feature_rows)