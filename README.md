![Pinta's Quest Map](/app/src/assets/img/PintasQuestMap.webp)

# Pinta's Quest
Pinta's Quest is a VMU game associated with the Dreamcast version of Skies of Arcadia. The game drops can be manipulated via doing certain actions with given timing. This is a tool to help people with those timings to manipulate the desired drops.

# Credit to SanicDelphinus
SanicDelphinus of the Skies of Arcadia Speedrun community pioneered most of these manipulations and created the original code this is based off of here. 
https://github.com/RikkiGibson/pinta-timing-helper

# Explanation of Drift & Anticipation Settings
The drift and anticipation are important for getting the tool setup. We store your values in local storage so if you set them the application should remember them the next time you come to the site assuming you haven't done something to clear that information. You may have to adjust these settings for each device you do because they could be different based on audio processing latency for your device.

### Drift
Drift is used to compensate for systemic error. If you are hitting the green areas and NOT getting the expected item. Then you likely have system drift compared to the calibrated values. I recommend compensating by 0.016-0.032 positive & negative until you find it. Systemtic drift is unlikely to be several hundred milliseconds but it allows -1 to 1 second of compensation just in case. Landing in the center of the green should always give you the expected item.

### Anticipation
Anticipation is used to indicate the point you should press the button ahead of here the actual green indicator is located. The reason the green indicator is different than the press location has to do with how everything is calibrated. Essentially it will take a little bit of time after you press the button for the VMU to make noise and for it to be registered by the computer. When the timing is calibrated we use the timing the computer registers. This means the button needs to be pressed just a little ahead of this time. If you aren't hitting the green zone even though you feel you are hitting the button correctly you may need to increase the anticipation if you are are landing after the green zone, or decrease it if you are landing before the green zone. I recommend testing out each timing a few times. While 64 ms is 4 frames the timing isn't "free" without a good deal of practice.

# How items are calibrated
Timings are found by hand using the console outputs generated by this program. We plug in a target time and sample it repeatedly and check with the game what items we got. We do this repeatedly until we find potentially useful items then sample repeatedly around that timing until we feel we got an idea of the range of acceptable values. Because of system errors and frame misalignments between the game and this application these ranges can shift up to 32ms potentially. So if you land on the edge of the green or *barely* outside you could still get the item. The opposite is possible you land barely on the edge of the green and don't get the item. Landing near the center should always give you the item. If you find yourself consistently landing on the edges of the green and not getting the item you may have systemic error and need to adjust your drift value. **NOTE** This application is pre-alpha so it's entirely possible I fat fingered or added an item to the wrong map section in its current form. If you feel there is an error notify me and I'll check into it. I plan on spending some time tightening all of this within the next couple months.

# Running Locally
- Need to have node.js installed. I am using v18.3.0 but any reasonably modern version should work.
- `npm install`
- `npm run dev`
- Open the link displayed by vite.

# Changes
- The main goal of this tool was to configure a more visual indicator for where the drops are. His original code relied on metronome like beats which was difficult to intuit for someone like myself who is not musically inclined.

- Map based selection. The selection of items differs from map area to map area, and the goal is to eventually have each map location mention all important locations. A couple areas appear to have greater than the 64ms window most items have, these areas are preferred when found.

# Todo Improvements
- UI is still very pre-Alpha I'm making this public so Sanic and others can mess with it while I finish. I'd like to do a lot of things here like have the bar not become to long for the 5-6 second range times, have it be more mobile friendly, etc.
- Have merges into master redeploy the code in the dist directory to a github.io page for easy permanent public access.
- Original had hard coded amplitudes for sound detection using browser based FFT. I am doing the same currently; However, it is very finicky for the VMU sounds to be detected with a lot of different background noises. I'd like to move to an ML based approach that is less finicky if possible.
