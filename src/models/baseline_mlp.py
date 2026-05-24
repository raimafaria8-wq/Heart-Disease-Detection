"""
models/baseline_mlp.py
──────────────────────
Two-hidden-layer MLP for UCI Heart Disease tabular classification.
Architecture: Input(~24) → 64 → 32 → 1 (sigmoid)
"""

import torch
import torch.nn as nn


class BaselineMLP(nn.Module):
    """
    Compact MLP for binary cardiovascular risk prediction.

    Args:
        input_dim: Number of input features after one-hot encoding (~24).
        dropout:   Dropout probability between hidden layers.
    """

    def __init__(self, input_dim: int = 24, dropout: float = 0.3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, 1),
            nn.Sigmoid(),
        )
        self._init_weights()

    def _init_weights(self) -> None:
        """He (Kaiming) initialisation to prevent vanishing gradients."""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
                nn.init.zeros_(m.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x).squeeze(-1)
