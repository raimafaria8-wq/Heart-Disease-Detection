import torch
import torch.nn as nn

class TransformerModel(nn.Module):
    def __init__(self, input_dim, nhead):

        super(TransformerModel, self).__init__()

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=input_dim,
            nhead=nhead
        )

        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=2
        )

        self.fc = nn.Linear(input_dim, 2)

    def forward(self, x):

        x = self.transformer(x)

        x = x.mean(dim=1)

        return self.fc(x)