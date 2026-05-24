# CardioSense — AI Diagnostic Platform

> Phase 2 | Deep Learning Course | Team: Raima, Rahma, Faria  
> GitHub: https://github.com/rahmasajid/Heart-Disease-Detection

CardioSense is a multi-modal AI diagnostic platform that fuses four clinical data modalities:
chest X-rays, tabular cardiovascular risk data, 12-lead ECG signals, and ICU time series.

---

## Repository Structure

```
cardiosense/
├── data/                   # Raw + processed data  ← gitignored
├── notebooks/              # EDA and exploration only (not production code)
├── src/
│   ├── data/               # Dataset loaders and splitting logic
│   ├── preprocessing/      # Transforms, augmentation pipelines
│   ├── models/             # Model class definitions
│   ├── training/           # Train / eval loop scripts
│   └── utils/              # seed_everything(), logger, metrics
├── experiments/            # Per-run CSVs, checkpoints, W&B logs
├── reports/
│   ├── figures/            # Plots, Grad-CAM images
│   └── results/            # Per-class AUC tables, confusion matrices
├── tests/                  # Smoke tests (pytest)
├── requirements.txt        # Pinned dependency versions
├── environment.yml         # Conda environment
└── .gitignore
```

---

## Quickstart

### 1 — Clone

```bash
git clone https://github.com/rahmasajid/Heart-Disease-Detection.git
cd Heart-Disease-Detection
```

### 2 — Install dependencies

**Option A — pip (any environment):**
```bash
pip install -r requirements.txt
```

**Option B — conda (recommended for GPU):**
```bash
conda env create -f environment.yml
conda activate cardiosense
```

### 3 — Download datasets

| Dataset | Source | Place at |
|---------|--------|----------|
| UCI Heart Disease | [UCI ML Repo](https://archive.ics.uci.edu/ml/datasets/heart+disease) | `data/raw/heart_disease.csv` |
| PTB-XL ECG | [PhysioNet](https://physionet.org/content/ptb-xl/1.0.3/) | `data/raw/ptb-xl/` |
| CheXpert | [Stanford](https://stanfordmlgroup.github.io/competitions/chexpert/) | `data/raw/chexpert/` |
| Pneumonia (Kaggle) | [Kaggle](https://www.kaggle.com/paultimothymooney/chest-xray-pneumonia) | `data/raw/pneumonia/` |

### 4 — Run smoke tests

```bash
pytest tests/ -v
```
All 6 tests should pass before any training run.

### 5 — Train the Heart Disease MLP

```bash
python -m src.training.train_mlp \
    --data_path data/raw/heart_disease.csv \
    --epochs 100 \
    --seed 42
```

Checkpoints saved to `experiments/mlp/best_model.pt`.  
Metrics CSV saved to `experiments/mlp/metrics_42.csv`.

---

## Reproducibility

Every training script calls `seed_everything(seed)` as its first line.
This sets seeds for Python `random`, NumPy, PyTorch, and TensorFlow.

```python
from src.utils.seeds import seed_everything
seed_everything(42)
```

Fixed seeds are: `np.random.seed(42)`, `random.seed(42)`, `tf.random.set_seed(42)`, `torch.manual_seed(42)`.

---

## Modules

| Module | Architecture | Dataset | Status |
|--------|-------------|---------|--------|
| Heart Disease | MLP (64→32→1) | UCI (303 records) | ✅ Phase 2 baseline |
| Chest X-Ray | DenseNet121 (15-label) | NIH + CheXpert + Pneumonia | ✅ Phase 2 baseline |
| ECG | Bidirectional LSTM | PTB-XL (21,837 records) | 🔄 Phase 3 |
| ICU Prediction | Interpolation + ClinicalBERT | MIMIC-III (simulated) | 🔄 Phase 3 |

---

## Phase 3 Targets

- [ ] DenseNet121 full-scale training (val_AUC > 0.85 across 15 findings)
- [ ] Per-class threshold optimisation (replace flat 0.3 threshold)
- [ ] MLP with `drop_first=True` + SHAP feature importance
- [ ] PTB-XL BiLSTM full training + per-superclass AUC
- [ ] ICU ClinicalBERT fusion prototype
- [ ] Fairness evaluation: disaggregated AUC by sex and age decile
- [ ] Grad-CAM visualisations for misclassified X-ray cases
- [ ] Migrate experiment tracking to Weights & Biases (W&B)

---

## Known Issues (from Phase 2)

- `get_dummies` was applied without `drop_first=True`, introducing multicollinearity for binary features. **Fixed in `src/data/heart_disease.py`.**
- DenseNet121 trained on 20% sample only due to Kaggle GPU timeout. Phase 3 will use Colab Pro A100.
- MIMIC-III ICU module uses simulated HR/BP data pending credentialed PhysioNet access.

---

## Citation

```
CardioSense Phase 2 — Deep Learning Course
Team: Raima, Rahma, Faria
Commit: a4f2c91d | Date: May 2026
```
