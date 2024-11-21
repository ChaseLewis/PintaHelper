import torch
import torch.nn as nn
import torch.nn.functional as F

class BeepCNN(nn.Module):
    def __init__(self,n_fft: int,win_length:int,classes: int) -> None:
        super(BeepCNN).__init__()
        self.n_fft = n_fft
        self.win_length = win_length
        self.conv1 = nn.Conv2d(1,16,kernel_size=3,stride=1,padding=1)
        self.pool = nn.MaxPool2d(2,2)
        self.conv2 = nn.Conv2d(16,16,kernel_size=3,stride=1,padding=1)
        self.fc1 = nn.Linear(4*n_fft*win_length,32*classes)
        self.fc2 = nn.Linear(32*classes,classes)

    def forward(self,x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2))
        x = x.view(-1,4*self.n_fft*self.win_length) # Flatten the output
        x = F.relu(self.fc1(x))
        x = F.sigmoid(self.fc2(x))
        return x