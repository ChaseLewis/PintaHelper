# Pinta's Quest

Pinta's Quest is a VMU game associated with the Dreamcast version of Skies of Arcadia. The game drops can be manipulated via doing certain actions with given timing. This is a tool to help people with those timings to manipulate the desired drops.

# Credit to SanicDelphinus
SanicDelphinus of the Skies of Arcadia Speedrun community pioneered most of these manipulations and created the original code this is based off of here. 
https://github.com/RikkiGibson/pinta-timing-helper

# Running Locally

- Need to have node.js installed. I am using v18.3.0 but any reasonably modern version should work.

- `npm install`
- `npm run dev`
- Open the link displayed by vite.

# Changes
- The main goal of this tool was to configure a more visual indicator for where the drops are. His original code relied on metronome like beats which was difficult to intuit for someone like myself who is not musically inclined.

- Map based selection. The selection of items differs from map area to map area, and the goal is to eventually have each map location mention all important locations. A couple areas appear to have greater than the 64ms most items have, these areas are preferred when found.

# Todo Improvements
- UI is still very pre-Alpha I'm making this public so Sanic and others can mess with it while I finish. 
- Have merges into master redeploy the code in the dist directory to a github.io page for easy permanent access.
- Original had hard coded amplitudes for sound detection using browser based FFT. I am doing the same currently; However, it is very finicky for the VMU sounds to be detected with a lot of different background noises. I'd like to move to an ML based approach that is less finicky if possible.
