"""
models/ecg_lstm.py
──────────────────
Bidirectional LSTM for multi-label ECG superclass/subclass prediction on PTB-XL.
Input shape: (B, 1000, 12)  — 10 seconds at 100 Hz, 12 leads
"""

import torch
import torch.nn as nn


class ECG_BiLSTM(nn.Module):
    """
    Bidirectional LSTM over 12-lead ECG signals.

    Args:
        signal_dim:   Number of ECG leads (12).
        meta_dim:     Number of one-hot metadata features (age, sex, etc.).
        hidden_size:  LSTM hidden units per direction.
        num_layers:   Stacked LSTM layers.
        num_classes:  Output labels (5 superclasses by default).
        dropout:      Dropout between LSTM layers and before head.
    """

    def __init__(
        self,
        signal_dim: int = 12,
        meta_dim: int = 16,
        hidden_size: int = 128,
        num_layers: int = 2,
        num_classes: int = 5,
        dropout: float = 0.3,
    ):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=signal_dim,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        lstm_out_dim = hidden_size * 2  # bidirectional

        self.meta_proj = nn.Linear(meta_dim, 32)
        self.head = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(lstm_out_dim + 32, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes),
        )

    def forward(
        self, signal: torch.Tensor, meta: torch.Tensor
    ) -> torch.Tensor:
        """
        Args:
            signal: (B, T, 12) — raw ECG signal
            meta:   (B, meta_dim) — one-hot encoded metadata
        Returns:
            logits: (B, num_classes) — raw logits; apply sigmoid for multi-label
        """
        lstm_out, _ = self.lstm(signal)          # (B, T, 2*hidden)
        pooled = lstm_out.mean(dim=1)            # temporal mean pooling
        meta_feat = torch.relu(self.meta_proj(meta))
        combined = torch.cat([pooled, meta_feat], dim=-1)
        return self.head(combined)               # (B, num_classes)
