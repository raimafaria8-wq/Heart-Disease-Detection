from tensorflow.keras import layers, Model

def build_vae(input_dim):

    encoder_input = layers.Input(shape=(input_dim,))

    x = layers.Dense(128, activation='relu')(encoder_input)

    latent = layers.Dense(32, activation='relu')(x)

    x = layers.Dense(128, activation='relu')(latent)

    decoder_output = layers.Dense(input_dim, activation='sigmoid')(x)

    vae = Model(encoder_input, decoder_output)

    return vae