from pydantic import BaseModel
from typing import Optional, List, Literal, Dict, Any
from datetime import datetime

class vcModel(BaseModel):
    # credentials / account
    username: Optional[str] = None
    encrypted_password: Optional[str] = None

    # investment focus / thematic fields
    domain_focus: Optional[List[str]] = None                # high-level domains (e.g. healthcare, fintech, climate)
    sector_boundaries: Optional[List[str]] = None           # sectors the fund considers investable
    sub_sector_filters: Optional[List[str]] = None          # finer sub-sectors to include/exclude
    thematic_priorities: Optional[List[str]] = None         # specific themes inside domains the fund prioritizes

    # product / business model prefs (use Literals where enumerations make sense)
    business_model_types: Optional[List[Literal[
        "B2B","B2C","D2C","marketplace","SaaS","infra","deep-tech","fintech-rails","dev-tools"
    ]]] = None
    revenue_model_preference: Optional[List[Literal[
        "subscription","usage-based","transaction","licensing","ad-supported","freemium"
    ]]] = None
    customer_segment_focus: Optional[List[Literal[
        "SMB","mid-market","enterprise","prosumer","developer-first","consumer"
    ]]] = None
    go_to_market_model_tolerance: Optional[List[Literal[
        "outbound","channel","self-serve","PLG","hybrid"
    ]]] = None
    distribution_bias: Optional[List[Literal[
        "PLG","enterprise-sales","channel-driven","consumer-virality"
    ]]] = None

    # stage / capital / ownership
    stage_mandate: Optional[List[Literal[
        "pre-seed","seed","series-a","series-b","growth"
    ]]] = None
    check_size_min: Optional[float] = None                  # minimum deployment (currency)
    check_size_max: Optional[float] = None                  # maximum deployment (currency)
    ownership_target_pct: Optional[float] = None            # target equity % (e.g. 10.0)
    exit_horizon_preference: Optional[Literal["M&A","IPO","both","no-preference"]] = None           # M&A-focused vs IPO-oriented sectors

    # traction / metrics
    traction_revenue_floor: Optional[float] = None          # revenue threshold
    traction_user_floor: Optional[int] = None               # user count threshold
    traction_retention_benchmark: Optional[float] = None    # retention % threshold

    # geographic / regulatory
    geographic_scope_includes: Optional[List[str]] = None   # regions they invest in
    geographic_scope_excludes: Optional[List[str]] = None   # regions they avoid
    regulatory_blacklist: Optional[List[str]] = None        # industries they won't touch due to compliance/licensing

    # risk / operational preferences
    margin_profile_preference: Optional[Literal["high-margin","low-margin","balanced"]] = None         # high-margin software vs low-margin ops
    capital_intensity_tolerance: Optional[Literal["low","medium","high"]] = None       # tolerance for heavy capex/hardware/logistics
    time_to_market_preference: Optional[Literal["immediate-monetization","long-research"]] = None         # immediate monetization vs long research timelines
    competitive_structure_preference: Optional[Literal["fragmented","winner-take-all","balanced"]] = None  # fragmented vs winner-take-all
    risk_appetite: Optional[Literal["low","medium","high","sector-specific"]] = None                     # willingness to underwrite regulatory/technical/market/geopolitical risk
    cyclicality_preference: Optional[Literal["avoid-cyclical","neutral","prefer-cyclical"]] = None            # avoidance of macro-volatile industries

    # team / founder / defensibility
    founder_market_fit_expectations: Optional[str] = None   # domain expertise, repeat founder bias
    team_composition_requirements: Optional[str] = None     # min engineering strength, GTM capability, leadership maturity
    defensibility_bias: Optional[List[Literal["network-effects","data-moat","workflow-lock-in","IP"]]] = None          # network effects, data moats, workflow lock-in, IP

    # portfolio / thesis / tech
    portfolio_construction_constraints: Optional[str] = None# avoid overexposure, balance risk types
    fund_thesis_alignment: Optional[List[str]] = None      # thematic focus areas guiding conviction
    technology_stack_comfort: Optional[List[Literal["ml-heavy","traditional","cloud-native","on-prem","polyglot"]]] = None    # ML-heavy, languages, infra paradigms, etc.

    # misc
    notes: Optional[str] = None                            # freeform notes about the fund prefs
    cultural_fit: Optional[str] = None                     # founder behavior, transparency, communication style

    # audit
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Replaced: lightweight account creation / update models now expose explicit preference fields
class VcAccountCreate(BaseModel):
    """
    Inbound model for creating a VC account.
    - username: required
    - password: required (plaintext on inbound; caller/service should hash/encrypt before persisting)
    - preference fields mirror vcModel to avoid a freeform dict
    """
    username: str
    password: str

    # preference fields (optional seeds for the full vcModel)
    domain_focus: Optional[List[str]] = None
    sector_boundaries: Optional[List[str]] = None
    sub_sector_filters: Optional[List[str]] = None
    thematic_priorities: Optional[List[str]] = None

    business_model_types: Optional[List[Literal[
        "B2B","B2C","D2C","marketplace","SaaS","infra","deep-tech","fintech-rails","dev-tools"
    ]]] = None
    revenue_model_preference: Optional[List[Literal[
        "subscription","usage-based","transaction","licensing","ad-supported","freemium"
    ]]] = None
    customer_segment_focus: Optional[List[Literal[
        "SMB","mid-market","enterprise","prosumer","developer-first","consumer"
    ]]] = None
    go_to_market_model_tolerance: Optional[List[Literal[
        "outbound","channel","self-serve","PLG","hybrid"
    ]]] = None
    distribution_bias: Optional[List[Literal[
        "PLG","enterprise-sales","channel-driven","consumer-virality"
    ]]] = None

    stage_mandate: Optional[List[Literal[
        "pre-seed","seed","series-a","series-b","growth"
    ]]] = None
    check_size_min: Optional[float] = None
    check_size_max: Optional[float] = None
    ownership_target_pct: Optional[float] = None
    exit_horizon_preference: Optional[Literal["M&A","IPO","both","no-preference"]] = None

    traction_revenue_floor: Optional[float] = None
    traction_user_floor: Optional[int] = None
    traction_retention_benchmark: Optional[float] = None

    geographic_scope_includes: Optional[List[str]] = None
    geographic_scope_excludes: Optional[List[str]] = None
    regulatory_blacklist: Optional[List[str]] = None

    margin_profile_preference: Optional[Literal["high-margin","low-margin","balanced"]] = None
    capital_intensity_tolerance: Optional[Literal["low","medium","high"]] = None
    time_to_market_preference: Optional[Literal["immediate-monetization","long-research"]] = None
    competitive_structure_preference: Optional[Literal["fragmented","winner-take-all","balanced"]] = None
    risk_appetite: Optional[Literal["low","medium","high","sector-specific"]] = None
    cyclicality_preference: Optional[Literal["avoid-cyclical","neutral","prefer-cyclical"]] = None

    founder_market_fit_expectations: Optional[str] = None
    team_composition_requirements: Optional[str] = None
    defensibility_bias: Optional[List[Literal["network-effects","data-moat","workflow-lock-in","IP"]]] = None

    portfolio_construction_constraints: Optional[str] = None
    fund_thesis_alignment: Optional[List[str]] = None
    technology_stack_comfort: Optional[List[Literal["ml-heavy","traditional","cloud-native","on-prem","polyglot"]]] = None

    notes: Optional[str] = None
    cultural_fit: Optional[str] = None

    created_at: Optional[datetime] = None


class VcAccountUpdate(BaseModel):
    """
    Partial update model for VC account.
    - password: optional plaintext (service must re-encrypt if provided)
    - preference fields optional for partial updates
    """
    password: Optional[str] = None

    # same preference fields as create but all optional
    domain_focus: Optional[List[str]] = None
    sector_boundaries: Optional[List[str]] = None
    sub_sector_filters: Optional[List[str]] = None
    thematic_priorities: Optional[List[str]] = None

    business_model_types: Optional[List[Literal[
        "B2B","B2C","D2C","marketplace","SaaS","infra","deep-tech","fintech-rails","dev-tools"
    ]]] = None
    revenue_model_preference: Optional[List[Literal[
        "subscription","usage-based","transaction","licensing","ad-supported","freemium"
    ]]] = None
    customer_segment_focus: Optional[List[Literal[
        "SMB","mid-market","enterprise","prosumer","developer-first","consumer"
    ]]] = None
    go_to_market_model_tolerance: Optional[List[Literal[
        "outbound","channel","self-serve","PLG","hybrid"
    ]]] = None
    distribution_bias: Optional[List[Literal[
        "PLG","enterprise-sales","channel-driven","consumer-virality"
    ]]] = None

    stage_mandate: Optional[List[Literal[
        "pre-seed","seed","series-a","series-b","growth"
    ]]] = None
    check_size_min: Optional[float] = None
    check_size_max: Optional[float] = None
    ownership_target_pct: Optional[float] = None
    exit_horizon_preference: Optional[Literal["M&A","IPO","both","no-preference"]] = None

    traction_revenue_floor: Optional[float] = None
    traction_user_floor: Optional[int] = None
    traction_retention_benchmark: Optional[float] = None

    geographic_scope_includes: Optional[List[str]] = None
    geographic_scope_excludes: Optional[List[str]] = None
    regulatory_blacklist: Optional[List[str]] = None

    margin_profile_preference: Optional[Literal["high-margin","low-margin","balanced"]] = None
    capital_intensity_tolerance: Optional[Literal["low","medium","high"]] = None
    time_to_market_preference: Optional[Literal["immediate-monetization","long-research"]] = None
    competitive_structure_preference: Optional[Literal["fragmented","winner-take-all","balanced"]] = None
    risk_appetite: Optional[Literal["low","medium","high","sector-specific"]] = None
    cyclicality_preference: Optional[Literal["avoid-cyclical","neutral","prefer-cyclical"]] = None

    founder_market_fit_expectations: Optional[str] = None
    team_composition_requirements: Optional[str] = None
    defensibility_bias: Optional[List[Literal["network-effects","data-moat","workflow-lock-in","IP"]]] = None

    portfolio_construction_constraints: Optional[str] = None
    fund_thesis_alignment: Optional[List[str]] = None
    technology_stack_comfort: Optional[List[Literal["ml-heavy","traditional","cloud-native","on-prem","polyglot"]]] = None

    notes: Optional[str] = None
    cultural_fit: Optional[str] = None

    updated_at: Optional[datetime] = None
