"""
utils/logger.py
───────────────
Lightweight CSV + console logger. Upgrade to W&B in Phase 3 by
swapping get_logger() for a WandbLogger without touching training code.
"""

import csv
import logging
import sys
from pathlib import Path
from datetime import datetime


def get_logger(name: str, log_dir: str = "experiments/logs") -> logging.Logger:
    """Return a logger that writes to both console and a timestamped file."""
    Path(log_dir).mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = Path(log_dir) / f"{name}_{timestamp}.log"

    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Console handler
    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)

    # File handler
    fh = logging.FileHandler(log_file)
    fh.setLevel(logging.INFO)

    fmt = logging.Formatter("[%(asctime)s] %(levelname)s — %(message)s",
                            datefmt="%H:%M:%S")
    ch.setFormatter(fmt)
    fh.setFormatter(fmt)

    if not logger.handlers:
        logger.addHandler(ch)
        logger.addHandler(fh)

    return logger


class CSVMetricLogger:
    """Append one row per epoch to a CSV for offline curve plotting."""

    def __init__(self, filepath: str):
        self.filepath = Path(filepath)
        self.filepath.parent.mkdir(parents=True, exist_ok=True)
        self._header_written = self.filepath.exists()

    def log(self, metrics: dict) -> None:
        write_header = not self._header_written
        with open(self.filepath, "a", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=metrics.keys())
            if write_header:
                writer.writeheader()
                self._header_written = True
            writer.writerow(metrics)
