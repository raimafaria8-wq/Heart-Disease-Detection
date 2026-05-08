"""
tests/test_smoke.py
───────────────────
Smoke tests — run with: pytest tests/ -v
These catch shape errors and import failures before a full training run.
"""

import pytest
import numpy as np
import torch


# ── MLP ─────────────────────────────────────────────────────────────────────

def test_mlp_forward_shape():
    from src.models.baseline_mlp import BaselineMLP
    model = BaselineMLP(input_dim=24)
    x = torch.randn(8, 24)
    out = model(x)
    assert out.shape == (8,), f"Expected (8,), got {out.shape}"


def test_mlp_output_range():
    from src.models.baseline_mlp import BaselineMLP
    model = BaselineMLP(input_dim=24)
    x = torch.randn(16, 24)
    out = model(x)
    assert out.min() >= 0.0 and out.max() <= 1.0, "Sigmoid output out of [0,1]"


# ── DenseNet X-Ray ────────────────────────────────────────────────────────────

def test_densenet_forward_shape():
    from src.models.densenet_xray import DenseNetXray
    model = DenseNetXray(num_classes=15)
    x = torch.randn(2, 3, 256, 256)
    out = model(x)
    assert out.shape == (2, 15), f"Expected (2,15), got {out.shape}"


# ── ECG BiLSTM ───────────────────────────────────────────────────────────────

def test_ecg_lstm_forward_shape():
    from src.models.ecg_lstm import ECG_BiLSTM
    model = ECG_BiLSTM(signal_dim=12, meta_dim=16, num_classes=5)
    signal = torch.randn(4, 1000, 12)
    meta   = torch.randn(4, 16)
    out = model(signal, meta)
    assert out.shape == (4, 5), f"Expected (4,5), got {out.shape}"


# ── Seed utility ─────────────────────────────────────────────────────────────

def test_seed_everything_runs():
    from src.utils.seeds import seed_everything
    seed_everything(0)   # should not raise


# ── Data loader (UCI) ────────────────────────────────────────────────────────

def test_heart_disease_loader(tmp_path):
    """Create a tiny synthetic CSV and verify split shapes."""
    import pandas as pd
    from src.data.heart_disease import load_heart_disease, CATEGORICAL_COLS, CONTINUOUS_COLS

    n = 50
    rng = np.random.default_rng(0)
    data = {col: rng.integers(0, 3, n) for col in CATEGORICAL_COLS}
    data.update({col: rng.uniform(50, 200, n) for col in CONTINUOUS_COLS})
    data["target"] = rng.integers(0, 2, n)
    csv_path = tmp_path / "heart_disease.csv"
    pd.DataFrame(data).to_csv(csv_path, index=False)

    X_train, X_test, y_train, y_test = load_heart_disease(str(csv_path))
    assert X_train.shape[0] == 40
    assert X_test.shape[0]  == 10
