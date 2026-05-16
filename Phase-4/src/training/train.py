from src.models.transfer_model import build_transfer_model

model = build_transfer_model()

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print(model.summary())