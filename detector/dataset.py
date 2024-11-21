import os
import typing
import torch
import torch.nn.functional as F
import torchaudio
import torchaudio.transforms as T
from torch.utils.data import Dataset
import numpy as np
from functools import lru_cache
from pydantic import BaseModel

class BeepPermutation(BaseModel):
    beep_file: str|None
    noise_file: str|None
    # apply white noise
    beep_volume: float
    white_noise_factor: float
    label: torch.Tensor

    class Config:
        arbitrary_types_allowed = True


class AudioClip(BaseModel):
    audio: torch.Tensor
    offset: int

    class Config:
        arbitrary_types_allowed = True

def get_all_wavs(path: str) -> typing.List[str]:
    wav_files = []
    for root, dirs, files in os.walk(path):
        for dir in dirs:
            wav_files.extend(get_all_wavs(os.path.join(root,dir)))

        for file in files:
            if file.endswith(".wav"):
                wav_files.append(os.path.join(root,file))

    return [f.replace("\\","/") for f in wav_files]

class AugmentedBeepDataset(Dataset):
    def enumerate_beeps(self,beep_path,device: torch.device):
        """
        Enumerate all the beep files with their corresponding labels
        """
        # Load all the classes for the beeps
        beep_dirs = [os.path.join(beep_path,d) for d in os.listdir(beep_path) if os.path.isdir(os.path.join(beep_path,d))]

        beeps = []  
        beep_name_to_idx = {}     
        class_count = len(beep_dirs) + 1
        for idx, d in enumerate(beep_dirs):
            dir_name = os.path.basename(d)
            label = torch.zeros((class_count)).to(device=device)
            label[idx] = 1.0
            beep_name_to_idx[dir_name] = idx

            for file in get_all_wavs(d):
                beeps.append((file,label))     
        
        return beeps, beep_name_to_idx

    def __init__(self,beep_path,noise_path,device: torch.device,win_length=30,sample_rate=16000,n_fft: int = 2048):

        self.device = device
        self.permutations: typing.List[BeepPermutation] = []
        self.win_length = win_length
        self.sample_rate = sample_rate
        self.n_fft = n_fft
        self.spectrogram = T.Spectrogram(win_length=win_length,n_fft=n_fft)

        # Enumerate 
        beeps, beep_name_to_idx = self.enumerate_beeps(beep_path=beep_path,device=device)

        

        # Get a list of all the noise files
        noises = self.load_noise_clips(noise_path)

        volumes = [0.8,1.0,1.2,1.4]
        white_noise_factors = [0.0,0.001,0.05,0.01]
        no_value_label = torch.zeros((len(beeps) + 1)).to(device=device)
        no_value_label[-1] = 1.0

        for beep, label in beeps:

            # We add the raw beeps 
            for white_noise_factor in white_noise_factors:
                for volume in volumes:
                    self.permutations.append(BeepPermutation(
                        beep_file=beep,
                        noise_file=None,
                        label=label,
                        beep_volume=volume,
                        white_noise_factor=white_noise_factor
                    ))

            beep_noise_permutations = []
            for noise in noises:

                #
                beep_noise_permutations.append(BeepPermutation(
                    beep_file=None,
                    noise_file=noise,
                    beep_volume=0,
                    white_noise_factor=0,
                    label=no_value_label
                ))
                if len(beep_noise_permutations) >= 10000:
                    break
                # We should partition the noise into clips of half second

                # Add empty noise
                self.permutations

            self.permutations.append(beep_noise_permutations)


        #Initialize the permutations of noise we will use to test against
        for beep_idx in range(len(self.beeps)):

            label = torch.zeros((len(self.beeps+1))).to(device=device)
            label[beep_idx] = 1.0
            self.permutations.append(self.beeps[beep_idx],None,label)
            for noise in self.noise:
                self.permutations.append((self.beeps[beep_idx],noise,label))

        # We need to create a group of noise only labels for 
        no_value_label = torch.zeros((len(self.beeps+1))).to(device=device)
        no_value_label[-1] = 1.0
        for noise in self.noise:
            self.permutations.append((None,noise,no_value_label))

    def __len__(self):
        return len(self.permutations)

    def load_noise_clips(self,path: str) -> typing.List[torch.Tensor]:
        files = get_all_wavs(path)
        
        clips = []
        # We should implement tqdm here since this could take awhile
        for file in files:
            audio = self.load_audio(file)
            for idx in range(start=0,stop=audio.shape[0],step=self.win_length):
                clips.append(audio[idx:idx+min(self.win_length,audio.shape[0])])

        return clips

    @lru_cache(maxsize=None)
    def load_audio(self,file_path):
        waveform, sample_rate = torchaudio.load(file_path,format="wav")
        if sample_rate != self.sample_rate:
            transform = T.Resample(orig_freq=sample_rate,new_freq=self.sample_rate)
            waveform = transform(waveform)

        # We need to increase the length to spectrogram length if it is shorter than that
        # We will do that by prepending silence to it

        return waveform.squeeze(0).to(self.device) #Squeeze for mono channel
    
    def add_white_noise(self,audio,noise_factor=0.005):
        return audio +  torch.randn(audio.size(),device=self.device)*noise_factor
    
    def add_background_noise(self,audio,noise_audio,noise_factor=0.3):
        if len(noise_audio) > len(audio):
            start_idx = np.random.randint(0,len(noise_audio) - len(audio))
            noise_audio = noise_audio[start_idx:start_idx + len(audio)]
        elif len(noise_audio) < len(audio):
            noise_audio = F.pad(noise_audio,(0,len(audio)-len(noise_audio)))

        return audio + noise_factor*noise_audio

    def augment_audio(self,audio,noise):

        #Add white noise
        audio = self.add_white_noise(audio,noise_factor=np.random.uniform(0.001,0.01))

        # Apply the noise
        if noise:
            audio = self.add_background_noise(audio,noise,noise_factor=np.random.uniform(0.1,0.5))

        # Don't think we need to augment the final pitch at all
        return audio
    
    def __getitem__(self,idx):
        perm = self.permutations[idx]

        # Some files are just noise, we use these to train the model there is not always an answer
        if not perm.beep_file and perm.noise_file:
            # We want to just grab a chunk out of the length of the noise at random
            noise = self.load_audio(perm.noise_file)
            # We should sample a random section of the noise
            return self.spectrogram(noise), perm.label
        
        audio = self.load_audio(perm.audio_file)
        if perm.noise_file:
            noise = self.load_audio(perm.noise_file)
            # We should sample a random section of the noise
            audio = self.augment_audio(audio,noise)

        return self.spectrogram(audio), perm.label


audio_files = [
    "StartBeep3.wav",
    "MenuOpenBeep.wav",
    "MenuCloseBeep.wav",
    "TradeDetected.wav"
]

noise_files = [

]