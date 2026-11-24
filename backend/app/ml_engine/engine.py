import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split


class AeroTriageAnalyticalEngine:
    def __init__(self) -> None:
        self.model = RandomForestClassifier(
            n_estimators=180,
            max_depth=8,
            random_state=42,
            class_weight="balanced",
        )
        self.metrics: dict[str, float] = {}
        self._train_and_evaluate()

    def _features(self, df: pd.DataFrame) -> pd.DataFrame:
        safe_sbp = df["sbp"].replace(0, 1)
        shock_index = df["hr"] / safe_sbp
        return pd.DataFrame(
            {
                "age": df["age"],
                "hr": df["hr"],
                "sbp": df["sbp"],
                "spo2": df["spo2"],
                "troponin": df["troponin"],
                "shock_index": shock_index,
            }
        )

    def _train_and_evaluate(self) -> None:
        rng = np.random.default_rng(42)
        n = 1500
        raw = pd.DataFrame(
            {
                "age": rng.integers(18, 95, n),
                "hr": rng.integers(50, 170, n),
                "sbp": rng.integers(70, 210, n),
                "spo2": rng.integers(78, 100, n),
                "troponin": np.round(rng.exponential(scale=0.35, size=n), 3),
            }
        )
        shock_idx = raw["hr"] / raw["sbp"]
        target = (
            ((raw["troponin"] > 0.04) & (raw["sbp"] < 95))
            | (raw["spo2"] < 90)
            | (shock_idx > 1.15)
            | ((raw["age"] > 65) & (raw["troponin"] > 0.04))
        ).astype(int)

        X = self._features(raw)
        X_train, X_test, y_train, y_test = train_test_split(
            X, target, test_size=0.2, random_state=42, stratify=target
        )
        self.model.fit(X_train, y_train)

        probs = self.model.predict_proba(X_test)[:, 1]
        preds = (probs >= 0.50).astype(int)
        self.metrics = {
            "roc_auc": round(float(roc_auc_score(y_test, probs)), 3),
            "precision": round(float(precision_score(y_test, preds, zero_division=0)), 3),
            "recall": round(float(recall_score(y_test, preds, zero_division=0)), 3),
        }

    def analyze_vitals(
        self, age: int, hr: int, sbp: int, spo2: int, troponin: float
    ) -> dict:
        shock_index = round(hr / max(sbp, 1), 2)
        row = pd.DataFrame(
            [{"age": age, "hr": hr, "sbp": sbp, "spo2": spo2, "troponin": troponin}]
        )
        prob = float(self.model.predict_proba(self._features(row))[0][1])

        root_causes: list[str] = []
        if troponin > 0.04:
            root_causes.append(
                f"Troponin {troponin} ng/mL (>0.04) indicates cardiac strain / myocardial injury risk."
            )
        if spo2 < 92:
            root_causes.append(
                f"SpO2 {spo2}% (<92%) indicates hypoxia / respiratory compromise."
            )
        if sbp < 90:
            root_causes.append(
                f"Systolic BP {sbp} mmHg (<90) indicates hypotension / shock pattern."
            )
        if shock_index > 1.0:
            root_causes.append(
                f"Shock Index {shock_index} (>1.0) signals hemodynamic instability."
            )
        if not root_causes:
            root_causes.append("Vitals and Shock Index are within normal baseline range.")

        if prob >= 0.65 or shock_index > 1.15 or spo2 < 90:
            tier = "Critical"
        elif prob >= 0.35 or troponin > 0.04 or shock_index > 0.95:
            tier = "Moderate"
        else:
            tier = "Low"

        return {
            "risk_probability_pct": round(prob * 100, 1),
            "triage_tier": tier,
            "shock_index": shock_index,
            "root_causes": root_causes,
            "evaluation_metrics": self.metrics,
        }

    def score_hospitals(self, hospitals: list[dict], risk_pct: float) -> list[dict]:
        risk_factor = risk_pct / 100.0
        scored: list[dict] = []
        for h in hospitals:
            avail = max(int(h.get("available_beds", 0)), 0)
            total = max(int(h.get("total_beds", 1)), 1)
            dist_km = float(h.get("distance_km", 4.5))
            bed_ratio = avail / total
            bed_penalty = (1.0 - bed_ratio) * 35.0 + (25.0 if avail == 0 else 0.0)
            travel_penalty = dist_km * (2.4 + risk_factor * 3.2)
            composite_score = round(bed_penalty + travel_penalty, 2)
            scored.append(
                {
                    **h,
                    "bed_availability_ratio": round(bed_ratio, 2),
                    "composite_routing_score": composite_score,
                }
            )
        return sorted(scored, key=lambda x: x["composite_routing_score"])


analytical_engine = AeroTriageAnalyticalEngine()