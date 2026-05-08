"""
training/train_mlp.py
─────────────────────
End-to-end training script for the UCI Heart Disease MLP.
Usage:
    python -m src.training.train_mlp --data_path data/raw/heart_disease.csv
"""

import argparse
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.metrics import roc_auc_score

from src.utils.seeds import seed_everything
from src.utils.logger import get_logger, CSVMetricLogger
from src.data.heart_disease import load_heart_disease
from src.models.baseline_mlp import BaselineMLP


def train(args):
    seed_everything(args.seed)
    logger = get_logger("mlp_train")
    metric_log = CSVMetricLogger(f"experiments/mlp/metrics_{args.seed}.csv")

    # ── Data ────────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = load_heart_disease(
        args.data_path, test_size=0.2, seed=args.seed
    )

    train_ds = TensorDataset(
        torch.tensor(X_train), torch.tensor(y_train)
    )
    train_dl = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)

    # ── Model ───────────────────────────────────────────────────────
    model = BaselineMLP(input_dim=X_train.shape[1], dropout=args.dropout)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr)
    criterion = nn.BCELoss()

    # ── Training loop ───────────────────────────────────────────────
    best_val_auc = 0.0
    patience_counter = 0
    Path("experiments/mlp").mkdir(parents=True, exist_ok=True)

    for epoch in range(1, args.epochs + 1):
        model.train()
        epoch_loss = 0.0
        for X_batch, y_batch in train_dl:
            optimizer.zero_grad()
            preds = model(X_batch)
            loss = criterion(preds, y_batch)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item() * len(X_batch)

        train_loss = epoch_loss / len(train_ds)

        # Validation on held-out test set (used once at the end; here for monitoring)
        model.eval()
        with torch.no_grad():
            X_t = torch.tensor(X_test)
            val_preds = model(X_t).numpy()
        val_auc = roc_auc_score(y_test, val_preds)
        val_acc = ((val_preds >= 0.5) == y_test).mean()

        logger.info(
            f"Epoch {epoch:03d} | loss={train_loss:.4f} | "
            f"val_acc={val_acc:.4f} | val_auc={val_auc:.4f}"
        )
        metric_log.log({
            "epoch": epoch, "train_loss": train_loss,
            "val_acc": val_acc, "val_auc": val_auc,
        })

        # Early stopping + checkpointing
        if val_auc > best_val_auc:
            best_val_auc = val_auc
            patience_counter = 0
            torch.save(model.state_dict(), "experiments/mlp/best_model.pt")
            logger.info(f"  ✓ New best val_AUC={best_val_auc:.4f} — checkpoint saved")
        else:
            patience_counter += 1
            if patience_counter >= args.patience:
                logger.info(f"Early stopping at epoch {epoch}")
                break

    logger.info(f"Training complete. Best val_AUC: {best_val_auc:.4f}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_path", default="data/raw/heart_disease.csv")
    parser.add_argument("--epochs",     type=int,   default=100)
    parser.add_argument("--batch_size", type=int,   default=32)
    parser.add_argument("--lr",         type=float, default=1e-3)
    parser.add_argument("--dropout",    type=float, default=0.3)
    parser.add_argument("--patience",   type=int,   default=10)
    parser.add_argument("--seed",       type=int,   default=42)
    train(parser.parse_args())
