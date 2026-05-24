import torch

def train_model(model, dataloader, optimizer, criterion):

    model.train()

    total_loss = 0

    for inputs, labels in dataloader:

        optimizer.zero_grad()

        outputs = model(inputs)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        total_loss += loss.item()

    return total_loss