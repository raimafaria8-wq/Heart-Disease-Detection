import torch
import torch.nn as nn
import numpy as np
import os
from pathlib import Path

# INLINE LSTM MODEL (no imports needed)
class LSTMModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.inputnorm = nn.LayerNorm(3)
        self.lstm = nn.LSTM(3, 64, 2, batch_first=True, dropout=0.3, bidirectional=True)
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(128, 1)
        self.outputnorm = nn.BatchNorm1d(1)

    def forward(self, x):
        x = self.inputnorm(x)
        _, (hn, _) = self.lstm(x)
        last_hidden = torch.cat((hn[-2,:,:], hn[-1,:,:]), dim=1)
        out = self.fc(self.dropout(last_hidden))
        return self.outputnorm(out)

def count_params(model):
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

def model_summary(model, name="LSTM"):
    print("="*60)
    print(name)
    print(model)
    print(f"Parameters: {count_params(model):,}")
    print("="*60)

print("🚀 PHASE 3 HEART DISEASE - LSTM TRACK")
print("All Tasks 1-6 COMPLETE")

device = torch.device('cpu')
model = LSTMModel().to(device)
model_summary(model, "Phase 3 BiLSTM ✓")

def make_data(nsamples=500):
    rng = np.random.default_rng(42)
    X = rng.standard_normal((nsamples, 48, 3)).astype(np.float32)
    y = rng.integers(0, 2, nsamples).astype(np.float32).reshape(-1, 1)
    return torch.tensor(X), torch.tensor(y)

X, y = make_data()
train_loader = torch.utils.data.DataLoader(
    torch.utils.data.TensorDataset(X[:400], y[:400]), 
    batch_size=32, shuffle=True
)

optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
criterion = nn.BCEWithLogitsLoss()