import os
import torch
from tqdm import tqdm, trange
from dataset import AugmentedBeepDataset
from torch.utils.data import DataLoader
from model import BeepCNN

# VARIABLES
EPOCHS = 64
WINDOW_LENGTH = 30 # Need to determine what the best
SAMPLE_RATE = 16000 # Probably can lower this a lot
N_FFT = 2048

# Device we should use
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

dataset = AugmentedBeepDataset("./detector/data","./detector/noise",device=device,sample_rate=SAMPLE_RATE,n_fft=N_FFT,win_length=N_FFT // 2)



# We should have a training loader & test loader
loader = DataLoader(dataset,batch_size=8,shuffle=True)

# Make a directory for saving our checkpoints
os.makedirs("./detector/checkpoints",exist_ok=True)

# Create our model
model = BeepCNN(sample_rate=SAMPLE_RATE,win_length=N_FFT // 2,classes=5).to(device=device)
loss_fn = torch.nn.CrossEntropyLoss()
optimizer = torch.optim.adam.Adam(model.parameters(),lr=0.001)


with trange(EPOCHS,desc="Epoch") as pbar1:
    for epoch in pbar1:
        with trange(loader,unit="batch") as pbar2:
            for x, y in pbar2:
                optimizer.zero_grad()

                # Make predictions on the batch
                outputs = model(x.to(device=device))
                
                # Compute the loss on the batch
                loss = loss_fn(outputs,y.to(device=device))

                # Apply the loss to the optimizer
                loss.backward()

                # Adjust learning weights via back propagation
                optimizer.step()
                pbar2.set_postfix(loss=loss.item())

# Save the outputs of the model
torch.save(model.state_dict(),"./detector/checkpoints/beep.ckpt")
