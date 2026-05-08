"""
models/densenet_xray.py
───────────────────────
DenseNet121 multi-label classifier for chest X-ray findings.
Output: 15-sigmoid head (one per MASTER_FINDINGS label).
"""

import torch
import torch.nn as nn
import torchvision.models as models


MASTER_FINDINGS = [
    "Atelectasis", "Cardiomegaly", "Consolidation", "Edema",
    "Effusion", "Emphysema", "Fibrosis", "Hernia",
    "Infiltration", "Mass", "Nodule", "Pleural_Thickening",
    "Pneumonia", "Pneumothorax", "No_Finding",
]


class DenseNetXray(nn.Module):
    """
    DenseNet121 pretrained on ImageNet, fine-tuned for multi-label
    chest pathology detection.

    Args:
        num_classes: Number of output labels (default 15 = MASTER_FINDINGS).
        dropout:     Dropout before classifier head.
        freeze_base: Freeze DenseNet weights for first N epochs (set in trainer).
    """

    def __init__(self, num_classes: int = 15, dropout: float = 0.3):
        super().__init__()
        base = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)

        # Feature extractor (everything except the classifier)
        self.features = base.features
        self.pool = nn.AdaptiveAvgPool2d((1, 1))  # → (B, 1024, 1, 1)
        self.dropout = nn.Dropout(p=dropout)
        self.classifier = nn.Linear(1024, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feat = self.features(x)              # (B, 1024, H', W')
        feat = self.pool(feat).flatten(1)    # (B, 1024)
        feat = self.dropout(feat)
        return torch.sigmoid(self.classifier(feat))  # (B, 15)
